"""Unified search for @-mentions in the MDX editor.

Returns three buckets — users, published projects, clients — so the editor
can render one grouped dropdown with a single round-trip.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.project import Project, PublicationStatus
from app.models.user import User
from database.database import get_db

router = APIRouter(prefix="/mentions", tags=["mentions"])


class MentionUser(BaseModel):
    username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_team_member: bool = False


class MentionProject(BaseModel):
    id: str
    slug: str
    title: str
    cover_image_src: str


class MentionClient(BaseModel):
    id: UUID
    slug: str
    name: str
    logotype_url: Optional[str] = None


class MentionResults(BaseModel):
    users: List[MentionUser] = []
    projects: List[MentionProject] = []
    clients: List[MentionClient] = []


@router.get("", response_model=MentionResults)
def search_mentions(
    q: str = Query("", description="Substring query"),
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    qs = (q or "").strip()
    pattern = f"%{qs}%"

    # Users — only those with a username, since the mention format is
    # @-based and username is what resolves to /<username>.
    user_q = db.query(User).filter(User.username.isnot(None))
    if qs:
        user_q = user_q.filter(
            (User.username.ilike(pattern)) | (User.name.ilike(pattern))
        )
    users = user_q.order_by(User.username.asc()).limit(limit).all()

    # Projects — published only, so mentions never point at drafts.
    project_q = db.query(Project).filter(
        Project.publication_status == PublicationStatus.published
    )
    if qs:
        project_q = project_q.filter(Project.title.ilike(pattern))
    projects = project_q.order_by(Project.updated_at.desc()).limit(limit).all()

    # Clients.
    client_q = db.query(Company)
    if qs:
        client_q = client_q.filter(Company.name.ilike(pattern))
    clients = client_q.order_by(Company.name.asc()).limit(limit).all()

    return MentionResults(
        users=[
            MentionUser(
                username=u.username,
                name=(f"{u.name or ''} {u.surname or ''}".strip() or None),
                avatar_url=u.avatar_url,
            )
            for u in users
            if u.username
        ],
        projects=[
            MentionProject(
                id=p.id, slug=p.slug, title=p.title, cover_image_src=p.cover_image_src
            )
            for p in projects
        ],
        clients=[
            MentionClient(id=c.id, slug=c.slug, name=c.name, logotype_url=c.logotype_url)
            for c in clients
        ],
    )

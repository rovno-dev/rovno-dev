"""Public team info: list, single lookup, and linked projects."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.project import Project, PublicationStatus
from app.models.project_team_assignment import ProjectTeamAssignment
from app.models.team_member import TeamMember
from app.models.user import User
from app.schemas.team.responses import TeamMemberListItem, TeamMemberPublic
from pydantic import BaseModel, ConfigDict
from database.database import get_db

router = APIRouter(prefix="/team", tags=["team"])


class TeamProjectRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    slug: str
    title: str
    short_description: Optional[str] = None
    cover_image_src: str
    cover_video_src: Optional[str] = None
    period: Optional[str] = None
    role_on_project: Optional[str] = None
    category_label: Optional[str] = None


def _serialize_member(tm: TeamMember, user: Optional[User], count: int = 0):
    return TeamMemberListItem(
        id=tm.id,
        user_id=tm.user_id,
        role=tm.role,
        bio=tm.bio,
        cover_url=tm.cover_url,
        sort_order=tm.sort_order,
        username=(user.username if user else None),
        name=(user.name if user else None),
        surname=(user.surname if user else None),
        avatar_url=(user.avatar_url if user else None),
        short_bio=(user.bio if user else None),
        project_count=count,
    )


def _resolve_member(db: Session, username: str) -> tuple[User, TeamMember]:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    tm = (
        db.query(TeamMember)
        .filter(TeamMember.user_id == user.id, TeamMember.is_active.is_(True))
        .first()
    )
    if not tm:
        raise HTTPException(404, "Not a team member")
    return user, tm


@router.get("", response_model=List[TeamMemberListItem])
def list_team_public(db: Session = Depends(get_db)):
    """Public list of active team members, ordered by sort_order then join date.

    Users without a username are skipped — their profile URL can't be built.
    """
    members = (
        db.query(TeamMember)
        .filter(TeamMember.is_active.is_(True))
        .order_by(TeamMember.sort_order.asc(), TeamMember.created_at.asc())
        .all()
    )
    if not members:
        return []

    user_ids = [m.user_id for m in members if m.user_id]
    users_by_id = {
        u.id: u
        for u in db.query(User).filter(User.id.in_(user_ids)).all()
    } if user_ids else {}

    # One query for all project counts.
    counts_rows = (
        db.query(
            ProjectTeamAssignment.team_member_id,
            func.count(Project.id).label("count"),
        )
        .join(Project, Project.id == ProjectTeamAssignment.project_id)
        .filter(Project.publication_status == PublicationStatus.published)
        .group_by(ProjectTeamAssignment.team_member_id)
        .all()
    )
    counts = {row[0]: int(row[1]) for row in counts_rows}

    out: List[TeamMemberListItem] = []
    for m in members:
        u = users_by_id.get(m.user_id)
        # A member without a linked user, or without a username, has no
        # public URL to link to. Skip them here — the admin panel surfaces
        # the reason (empty "Публичная страница" in the team editor dialog)
        # and the fix is to set a username there.
        if not u or not u.username:
            continue
        out.append(_serialize_member(m, u, counts.get(m.id, 0)))
    return out


@router.get("/by-username/{username}", response_model=TeamMemberPublic)
def get_team_member_by_username(username: str, db: Session = Depends(get_db)):
    user, tm = _resolve_member(db, username)
    return _serialize_member(tm, user)


@router.get(
    "/by-username/{username}/projects",
    response_model=List[TeamProjectRef],
)
def get_team_member_projects(username: str, db: Session = Depends(get_db)):
    """Projects pinned to this member, newest first. Published only."""
    _, tm = _resolve_member(db, username)
    rows = (
        db.query(ProjectTeamAssignment, Project)
        .join(Project, Project.id == ProjectTeamAssignment.project_id)
        .filter(ProjectTeamAssignment.team_member_id == tm.id)
        .filter(Project.publication_status == PublicationStatus.published)
        .order_by(Project.updated_at.desc())
        .all()
    )
    return [
        TeamProjectRef(
            id=proj.id,
            slug=proj.slug,
            title=proj.title,
            short_description=proj.short_description,
            cover_image_src=proj.cover_image_src,
            cover_video_src=proj.cover_video_src,
            period=proj.period,
            role_on_project=asg.role_on_project,
            category_label=(proj.category.label if proj.category else None),
        )
        for asg, proj in rows
    ]

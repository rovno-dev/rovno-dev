"""Admin-only article management: list with filters, approve, reject."""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.models.article import Article
from app.models.project import PublicationStatus
from app.models.team_member import TeamMember
from app.models.user import User
from app.schemas.article.responses import AdminArticleListItem
from app.shared.auth import get_current_user
from database.database import get_db
from app.api.v1.admin import get_admin_user  # reuse the existing dependency

router = APIRouter(prefix="/admin/articles", tags=["admin-articles"])


class RejectRequest(BaseModel):
    note: str = Field(..., min_length=1, max_length=1000)


@router.get("", response_model=List[AdminArticleListItem])
def list_admin_articles(
    status: Optional[str] = Query(
        None,
        description="draft | pending_review | published | rejected — omit for all",
    ),
    author_type: Optional[str] = Query(
        None,
        description="team | external — filter by whether the author is an active team member",
    ),
    q: Optional[str] = Query(None, description="Substring match on title"),
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    query = db.query(Article)

    if status:
        if status not in {s.value for s in PublicationStatus}:
            raise HTTPException(422, f"Unknown status: {status}")
        query = query.filter(Article.publication_status == PublicationStatus(status))

    if q:
        query = query.filter(Article.title.ilike(f"%{q.strip()}%"))

    # For author_type we need to know which users are active team members.
    # Resolve once, then filter in Python — the set is small and this avoids
    # a correlated subquery in the main SELECT.
    if author_type in ("team", "external"):
        team_user_ids = {
            row[0]
            for row in db.query(TeamMember.user_id)
            .filter(TeamMember.is_active.is_(True), TeamMember.user_id.isnot(None))
            .all()
        }
        if author_type == "team":
            query = query.filter(Article.author_id.in_(team_user_ids))
        else:
            query = query.filter(
                (Article.author_id.is_(None))
                | (Article.author_id.notin_(team_user_ids))
            )

    # Pipeline order: pending first (needs attention), then rejected (author
    # may need to be nudged), then published, then drafts. Within a bucket,
    # newest activity first.
    from sqlalchemy import case

    order = case(
        (Article.publication_status == PublicationStatus.pending_review, 0),
        (Article.publication_status == PublicationStatus.rejected, 1),
        (Article.publication_status == PublicationStatus.published, 2),
        (Article.publication_status == PublicationStatus.draft, 3),
        else_=4,
    )
    articles = (
        query.order_by(order, Article.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Annotate is_team_author in one batch — cheap and avoids a property that
    # would trigger N+1.
    author_ids = [a.author_id for a in articles if a.author_id]
    team_ids = (
        {
            row[0]
            for row in db.query(TeamMember.user_id)
            .filter(TeamMember.user_id.in_(author_ids), TeamMember.is_active.is_(True))
            .all()
        }
        if author_ids
        else set()
    )

    out: List[AdminArticleListItem] = []
    for a in articles:
        item = AdminArticleListItem.model_validate(a)
        item.is_team_author = a.author_id in team_ids
        item.is_pending = a.publication_status == PublicationStatus.pending_review
        out.append(item)
    return out


@router.patch("/{slug}/approve")
def approve_article(
    slug: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(404, "Article not found")
    if article.publication_status not in (
        PublicationStatus.pending_review,
        PublicationStatus.rejected,
    ):
        raise HTTPException(409, f"Cannot approve an article in status '{article.publication_status.value}'")

    article.publication_status = PublicationStatus.published
    article.review_note = None
    article.reviewed_by_id = admin.id
    from datetime import datetime
    article.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return AdminArticleListItem.model_validate(article)


@router.patch("/{slug}/reject")
def reject_article(
    slug: str,
    payload: RejectRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(404, "Article not found")
    if article.publication_status not in (
        PublicationStatus.pending_review,
        PublicationStatus.published,
    ):
        raise HTTPException(409, f"Cannot reject an article in status '{article.publication_status.value}'")

    article.publication_status = PublicationStatus.rejected
    article.review_note = payload.note.strip()
    article.reviewed_by_id = admin.id
    from datetime import datetime
    article.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return AdminArticleListItem.model_validate(article)

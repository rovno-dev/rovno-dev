from datetime import datetime
from typing import List, Optional
from uuid import UUID
import re

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.models.article import Article
from app.models.tag import Tag
from app.models.user import User, UserRole
from app.models.project import PublicationStatus
from app.schemas.article.requests import ArticleCreate, ArticleUpdate
from app.schemas.article.responses import ArticleListItem, ArticleResponse
from app.services.tag_service import resolve_tags
from app.services.team_service import is_team_member
from app.shared.auth import get_current_user, get_optional_user
from database.database import get_db

router = APIRouter(prefix="/articles", tags=["articles"])

_SLUG_RE = re.compile(r"[^\w\s-]+", re.UNICODE)
_SLUG_WS = re.compile(r"[\s_]+", re.UNICODE)


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = _SLUG_RE.sub("", text)
    text = _SLUG_WS.sub("-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:80]


def _is_admin(user: User | None) -> bool:
    return user is not None and user.user_role in (UserRole.admin, UserRole.root)


def _ensure_owner_or_admin(article: Article, user: User | None) -> None:
    if user is None:
        raise HTTPException(401, "Authentication required")
    if _is_admin(user):
        return
    if article.author_id != user.id:
        raise HTTPException(403, "Not your article")


def _unique_slug(db: Session, base: str, exclude_id: Optional[UUID] = None) -> str:
    slug = base or "article"
    suffix = 2
    while True:
        q = db.query(Article.id).filter(Article.slug == slug)
        if exclude_id:
            q = q.filter(Article.id != exclude_id)
        if not q.first():
            return slug
        slug = f"{base}-{suffix}"
        suffix += 1


def _resolve_publish_status(
    db: Session,
    requested: str,
    user: User,
) -> PublicationStatus:
    """Team members publish immediately. Everyone else goes into review."""
    if requested == "published":
        if is_team_member(db, user):
            return PublicationStatus.published
        return PublicationStatus.pending_review
    return PublicationStatus(requested)


# ---------- Public list ----------
@router.get("", response_model=List[ArticleListItem])
def list_published_articles(
    tag: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Article).filter(
        Article.publication_status == PublicationStatus.published
    )
    if tag:
        query = query.join(Article.tags).filter(Tag.slug == tag)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(Article.title.ilike(like))
    return query.order_by(Article.date.desc()).offset(offset).limit(limit).all()


# ---------- My articles ----------
@router.get("/me", response_model=List[ArticleListItem])
def list_my_articles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Article)
        .filter(Article.author_id == current_user.id)
        .order_by(Article.updated_at.desc())
        .all()
    )


# ---------- Get one ----------
@router.get("/{slug}", response_model=ArticleResponse)
def get_article(
    slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(404, "Article not found")

    if article.publication_status == PublicationStatus.published:
        return article

    if current_user is None:
        raise HTTPException(401, "Authentication required")
    if article.author_id != current_user.id and not _is_admin(current_user):
        raise HTTPException(404, "Article not found")
    return article


# ---------- Create ----------
@router.post("", response_model=ArticleResponse, status_code=201)
def create_article(
    payload: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base_slug = slugify(payload.slug or payload.title)
    slug = _unique_slug(db, base_slug)

    requested = payload.publication_status or "draft"
    if requested not in {"draft", "published"}:
        raise HTTPException(422, "publication_status must be 'draft' or 'published'")

    final_status = _resolve_publish_status(db, requested, current_user)

    article = Article(
        slug=slug,
        title=payload.title,
        description=payload.description or "",
        image_url=payload.image_url or "",
        date=payload.date or datetime.utcnow(),
        mdx_content=payload.mdx_content or "",
        raw_json=payload.raw_json,
        seo_title=payload.seo_title,
        meta_description=payload.meta_description,
        publication_status=final_status,
        author_id=current_user.id,
    )
    article.tags = resolve_tags(db, payload.tags)

    db.add(article)
    db.commit()
    db.refresh(article)
    return article


# ---------- Update ----------
@router.patch("/{slug}", response_model=ArticleResponse)
def update_article(
    slug: str,
    payload: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(404, "Article not found")
    _ensure_owner_or_admin(article, current_user)

    update = payload.model_dump(exclude_unset=True)

    if "slug" in update and update["slug"] != article.slug:
        update["slug"] = _unique_slug(db, slugify(update["slug"]), exclude_id=article.id)

    if "publication_status" in update and update["publication_status"] is not None:
        requested = update["publication_status"]
        if requested not in {"draft", "published"}:
            raise HTTPException(422, "publication_status must be 'draft' or 'published'")
        update["publication_status"] = _resolve_publish_status(db, requested, current_user)
        # Re-submitting a rejected article clears the old review note —
        # otherwise the author sees a stale rejection on a pending article.
        if update["publication_status"] == PublicationStatus.pending_review:
            article.review_note = None
            article.reviewed_by_id = None
            article.reviewed_at = None

    tag_names = update.pop("tags", None)
    if tag_names is not None:
        article.tags = resolve_tags(db, tag_names)

    for key, value in update.items():
        setattr(article, key, value)

    db.commit()
    db.refresh(article)
    return article


# ---------- Submit / withdraw ----------
@router.post("/{slug}/publish", response_model=ArticleResponse)
def publish_article(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Team members publish; everyone else lands in pending_review."""
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(404, "Article not found")
    _ensure_owner_or_admin(article, current_user)

    article.publication_status = _resolve_publish_status(db, "published", current_user)
    if article.publication_status == PublicationStatus.pending_review:
        article.review_note = None
        article.reviewed_by_id = None
        article.reviewed_at = None

    db.commit()
    db.refresh(article)
    return article


@router.post("/{slug}/unpublish", response_model=ArticleResponse)
def unpublish_article(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(404, "Article not found")
    _ensure_owner_or_admin(article, current_user)
    article.publication_status = PublicationStatus.draft
    db.commit()
    db.refresh(article)
    return article


# ---------- Delete ----------
@router.delete("/{slug}", status_code=204)
def delete_article(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(404, "Article not found")
    _ensure_owner_or_admin(article, current_user)
    db.delete(article)
    db.commit()
    return None

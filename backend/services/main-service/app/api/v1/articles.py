from datetime import datetime
from typing import List, Optional
from uuid import UUID
import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, cast, String
from sqlalchemy.orm import Session
from app.models.article import Article
from app.models.user import User, UserRole
from app.models.project import PublicationStatus
from app.schemas.article.requests import ArticleCreate, ArticleUpdate
from app.schemas.article.responses import ArticleListItem, ArticleResponse
from app.shared.auth import get_current_user, get_optional_user
from database.database import get_db
router = APIRouter(prefix="/articles", tags=["articles"])
# LLM context: keep slugify consistent with the frontend's utils/slugify.ts —\
# keep any-script letters + digits, collapse the rest to single hyphens.
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
# ---------- Public list ----------
@router.get("", response_model=List[ArticleListItem])
def list_published_articles(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Article).filter(Article.publication_status == PublicationStatus.published)
    if category:
        query = query.join(Article.category).filter_by(code=category)
    if tag:
        # tags is a JSON array; cast to text and do a substring check.
        query = query.filter(cast(Article.tags, String).ilike(f'%"{tag}"%'))
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Article.title.ilike(like), Article.description.ilike(like)))
    return query.order_by(Article.date.desc()).offset(offset).limit(limit).all()
# ---------- My articles (auth) ----------
# Declared before /{slug} so "me" is not swallowed as a slug.
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
    is_published = article.publication_status == PublicationStatus.published
    if is_published:
        return article
    # Draft / unpublished. Hide existence from strangers, but signal the
    # author's client that it needs a fresh token: returning 404 for an
    # expired session used to surface as a misleading "Article not found"
    # in the editor. 401 lets $fetch refresh-and-retry instead.
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
    status_val = payload.publication_status or "draft"
    if status_val not in {"draft", "published"}:
        raise HTTPException(422, "publication_status must be 'draft' or 'published'")
    article = Article(
        slug=slug,
        title=payload.title,
        description=payload.description or "",
        image_url=payload.image_url or "",
        date=payload.date or datetime.utcnow(),
        tags=payload.tags or [],
        mdx_content=payload.mdx_content or "",
        raw_json=payload.raw_json,
        seo_title=payload.seo_title,
        meta_description=payload.meta_description,
        category_id=payload.category_id,
        publication_status=PublicationStatus(status_val),
        author_id=current_user.id,
    )
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
        new_base = slugify(update["slug"])
        update["slug"] = _unique_slug(db, new_base, exclude_id=article.id)
    if "publication_status" in update and update["publication_status"] is not None:
        if update["publication_status"] not in {"draft", "published"}:
            raise HTTPException(422, "publication_status must be 'draft' or 'published'")
        update["publication_status"] = PublicationStatus(update["publication_status"])
    for key, value in update.items():
        setattr(article, key, value)
    db.commit()
    db.refresh(article)
    return article
# ---------- Publish / unpublish ----------
@router.post("/{slug}/publish", response_model=ArticleResponse)
def publish_article(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(404, "Article not found")
    _ensure_owner_or_admin(article, current_user)
    article.publication_status = PublicationStatus.published
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

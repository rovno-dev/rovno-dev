from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.tag import Tag, article_tags
from app.models.user import User
from app.services.tag_service import slugify_tag
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/tags", tags=["tags"])


class TagListItem(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    name: str
    slug: str
    usage_count: int = 0


class TagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=60)


@router.get("", response_model=List[TagListItem])
def list_tags(
    q: Optional[str] = None,
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Public endpoint. Sorted by usage count descending, then name.

    `usage_count` is computed with a LEFT JOIN so zero-usage tags (created
    via the editor but not yet linked to an article) still appear.
    """
    usage = func.count(article_tags.c.article_id).label("usage_count")

    query = (
        db.query(Tag, usage)
        .outerjoin(article_tags, article_tags.c.tag_id == Tag.id)
        .group_by(Tag.id)
        .order_by(usage.desc(), Tag.name.asc())
    )
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(Tag.name.ilike(like))

    rows = query.limit(limit).all()
    return [
        TagListItem(id=t.id, name=t.name, slug=t.slug, usage_count=int(c or 0))
        for t, c in rows
    ]


@router.post("", response_model=TagListItem, status_code=201)
def create_tag(
    payload: TagCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(422, "Tag name cannot be empty")

    existing = db.query(Tag).filter(func.lower(Tag.name) == name.lower()).first()
    if existing:
        raise HTTPException(409, f"Tag '{existing.name}' already exists")

    base_slug = slugify_tag(name)
    slug, n = base_slug, 2
    while db.query(Tag.id).filter(Tag.slug == slug).first():
        slug = f"{base_slug}-{n}"
        n += 1

    tag = Tag(name=name, slug=slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return TagListItem(id=tag.id, name=tag.name, slug=tag.slug, usage_count=0)

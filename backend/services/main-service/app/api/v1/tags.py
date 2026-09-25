from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.tag import Tag, TagKind, article_tags
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
    kind: str
    usage_count: int = 0


class TagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=60)
    kind: str = "tag"


def _normalize_kind(raw: Optional[str]) -> TagKind:
    if not raw:
        return TagKind.tag
    try:
        return TagKind(raw)
    except ValueError:
        raise HTTPException(422, f"Unknown tag kind: {raw}")


@router.get("", response_model=List[TagListItem])
def list_tags(
    q: Optional[str] = None,
    kind: Optional[str] = None,
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db),
):
    usage = func.count(article_tags.c.article_id).label("usage_count")

    query = (
        db.query(Tag, usage)
        .outerjoin(article_tags, article_tags.c.tag_id == Tag.id)
        .group_by(Tag.id)
        .order_by(usage.desc(), Tag.name.asc())
    )
    if kind:
        query = query.filter(Tag.kind == _normalize_kind(kind))
    if q:
        query = query.filter(Tag.name.ilike(f"%{q.strip()}%"))

    rows = query.limit(limit).all()
    return [
        TagListItem(
            id=t.id,
            name=t.name,
            slug=t.slug,
            kind=t.kind.value,
            usage_count=int(c or 0),
        )
        for t, c in rows
    ]


@router.post("", response_model=TagListItem, status_code=201)
def create_tag(
    payload: TagCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    kind = _normalize_kind(payload.kind)
    name = payload.name.strip()
    if not name:
        raise HTTPException(422, "Tag name cannot be empty")

    existing = (
        db.query(Tag)
        .filter(Tag.kind == kind, func.lower(Tag.name) == name.lower())
        .first()
    )
    if existing:
        raise HTTPException(409, f"'{existing.name}' уже существует в этой категории")

    base_slug = slugify_tag(name)
    slug, n = base_slug, 2
    while db.query(Tag.id).filter(Tag.slug == slug).first():
        slug = f"{base_slug}-{n}"
        n += 1

    tag = Tag(name=name, slug=slug, kind=kind)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return TagListItem(
        id=tag.id, name=tag.name, slug=tag.slug, kind=tag.kind.value, usage_count=0
    )

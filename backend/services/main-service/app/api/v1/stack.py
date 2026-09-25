from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.stack_item import StackItem, project_stack_items
from app.models.user import User
from app.shared.auth import get_current_user
from app.shared.slugify import slugify
from database.database import get_db

router = APIRouter(prefix="/stack", tags=["stack"])


class StackItemOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    name: str
    slug: str
    icon_url: Optional[str] = None
    usage_count: int = 0


class StackItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=60)
    icon_url: Optional[str] = None


@router.get("", response_model=List[StackItemOut])
def list_stack(
    q: Optional[str] = None,
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db),
):
    usage = func.count(project_stack_items.c.project_id).label("usage_count")
    query = (
        db.query(StackItem, usage)
        .outerjoin(project_stack_items, project_stack_items.c.stack_item_id == StackItem.id)
        .group_by(StackItem.id)
        .order_by(usage.desc(), StackItem.name.asc())
    )
    if q:
        query = query.filter(StackItem.name.ilike(f"%{q.strip()}%"))
    rows = query.limit(limit).all()
    return [
        StackItemOut(
            id=s.id, name=s.name, slug=s.slug, icon_url=s.icon_url, usage_count=int(c or 0)
        )
        for s, c in rows
    ]


@router.post("", response_model=StackItemOut, status_code=201)
def create_stack_item(
    payload: StackItemCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(422, "Name cannot be empty")
    existing = (
        db.query(StackItem).filter(func.lower(StackItem.name) == name.lower()).first()
    )
    if existing:
        raise HTTPException(409, f"«{existing.name}» уже в стеке")

    base = slugify(name, max_len=60, fallback="stack")
    slug, n = base, 2
    while db.query(StackItem.id).filter(StackItem.slug == slug).first():
        slug = f"{base}-{n}"
        n += 1

    item = StackItem(name=name, slug=slug, icon_url=payload.icon_url)
    db.add(item)
    db.commit()
    db.refresh(item)
    return StackItemOut(
        id=item.id, name=item.name, slug=item.slug, icon_url=item.icon_url, usage_count=0
    )

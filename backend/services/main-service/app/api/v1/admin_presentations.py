from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.v1.admin import get_admin_user
from app.models.presentation import Presentation, PresentationSlide
from app.models.user import User
from app.schemas.presentation.requests import PresentationIn
from app.schemas.presentation.responses import PresentationOut
from app.shared.slugify import slugify
from database.database import get_db
import random

router = APIRouter(prefix="/admin/presentations", tags=["admin-presentations"])

@router.get("", response_model=List[PresentationOut])
def list_presentations(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return db.query(Presentation).order_by(Presentation.created_at.desc()).all()

@router.get("/{id}", response_model=PresentationOut)
def get_presentation(id: UUID, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    p = db.get(Presentation, id)
    if not p:
        raise HTTPException(404, "Presentation not found")
    return p

@router.post("", response_model=PresentationOut, status_code=201)
def create_presentation(payload: PresentationIn, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    base_slug = slugify(payload.slug or payload.title)
    slug = base_slug
    while db.query(Presentation.id).filter(Presentation.slug == slug).first():
        slug = f"{base_slug}-{random.randint(10000, 99999)}"

    p = Presentation(
        slug=slug,
        title=payload.title,
        description=payload.description,
        event_id=payload.event_id,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        is_published=payload.is_published,
    )
    for s in payload.slides:
        p.slides.append(PresentationSlide(
            order=s.order, type=s.type, content=s.content, notes=s.notes
        ))
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.patch("/{id}", response_model=PresentationOut)
def update_presentation(id: UUID, payload: PresentationIn, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    p = db.get(Presentation, id)
    if not p:
        raise HTTPException(404, "Presentation not found")

    p.title = payload.title
    if payload.slug and payload.slug != p.slug:
        base = slugify(payload.slug)
        slug = base
        while db.query(Presentation.id).filter(Presentation.slug == slug, Presentation.id != p.id).first():
            slug = f"{base}-{random.randint(10000, 99999)}"
        p.slug = slug
    
    p.description = payload.description
    p.event_id = payload.event_id
    p.starts_at = payload.starts_at
    p.ends_at = payload.ends_at
    p.is_published = payload.is_published
    
    p.slides.clear()
    for s in payload.slides:
        p.slides.append(PresentationSlide(
            order=s.order, type=s.type, content=s.content, notes=s.notes
        ))
    
    db.commit()
    db.refresh(p)
    return p

@router.delete("/{id}", status_code=204)
def delete_presentation(id: UUID, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    p = db.get(Presentation, id)
    if p:
        db.delete(p)
        db.commit()
    return None

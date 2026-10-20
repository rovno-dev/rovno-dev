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


def sanitize_tsx_code(code: str):
    """Strict security filter to prevent XSS and malicious code execution."""
    forbidden_tokens = [
        "eval", "Function", "fetch", "XMLHttpRequest", "window", "document",
        "localStorage", "sessionStorage", "dangerouslySetInnerHTML", "<script",
        "navigator", "import(", "require(", "WebSocket", "process", "globalThis"
    ]
    for token in forbidden_tokens:
        if token in code:
            raise HTTPException(
                status_code=400, 
                detail=f"Security violation: The token '{token}' is not allowed in custom TSX code."
            )
    return code


def sanitize_tsx_code(code: str):
    """Strict security filter to prevent XSS and malicious code execution."""
    forbidden_tokens = [
        "eval", "Function", "fetch", "XMLHttpRequest", "window", "document",
        "localStorage", "sessionStorage", "dangerouslySetInnerHTML", "<script",
        "navigator", "import(", "require(", "WebSocket", "process", "globalThis"
    ]
    for token in forbidden_tokens:
        if token in code:
            raise HTTPException(
                status_code=400, 
                detail=f"Security violation: The token '{token}' is not allowed in custom TSX code."
            )
    return code

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

    if payload.custom_tsx:
        sanitize_tsx_code(payload.custom_tsx)
    p = Presentation(
        custom_tsx=payload.custom_tsx,
        slug=slug,
        title=payload.title,
        description=payload.description,
        event_id=payload.event_id,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        is_published=payload.is_published,
    )
    for s in payload.slides:
        if s.type == "CustomTsx" and "code" in s.content:
            sanitize_tsx_code(s.content["code"])
        p.slides.append(PresentationSlide(
            order=s.order, type=s.type, content=s.content, theme=s.theme, notes=s.notes
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

    if payload.custom_tsx:
        sanitize_tsx_code(payload.custom_tsx)
    p.custom_tsx = payload.custom_tsx
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
        if s.type == "CustomTsx" and "code" in s.content:
            sanitize_tsx_code(s.content["code"])
        p.slides.append(PresentationSlide(
            order=s.order, type=s.type, content=s.content, theme=s.theme, notes=s.notes
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

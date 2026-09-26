"""Admin CRUD for events + event request moderation."""
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1.admin import get_admin_user
from app.models.event import Event
from app.models.event_request import EventRequest
from app.models.project import PublicationStatus
from app.models.user import User
from app.schemas.event.requests import EventCreate, EventRequestUpdate, EventUpdate
from app.schemas.event.responses import EventDetail, EventListItem, EventRequestOut
from app.services.tag_service import resolve_tags
from app.models.tag import TagKind
from app.shared.slugify import slugify
from database.database import get_db

router = APIRouter(prefix="/admin/events", tags=["admin-events"])


def _unique_slug(db: Session, base: str, exclude_id: Optional[str] = None) -> str:
    slug = base
    n = 2
    while True:
        q = db.query(Event.id).filter(Event.slug == slug)
        if exclude_id:
            q = q.filter(Event.id != exclude_id)
        if not q.first():
            return slug
        slug = f"{base}-{n}"
        n += 1


@router.get("", response_model=List[EventListItem])
def list_admin_events(
    q: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    query = db.query(Event)
    if q:
        query = query.filter(Event.title.ilike(f"%{q.strip()}%"))
    if status:
        if status not in {s.value for s in PublicationStatus}:
            raise HTTPException(422, f"Unknown status: {status}")
        query = query.filter(Event.publication_status == PublicationStatus(status))
    return (
        query.order_by(Event.start_at.desc().nullslast(), Event.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{slug}", response_model=EventDetail)
def get_admin_event(slug: str, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    ev = db.query(Event).filter(Event.slug == slug).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    return ev


@router.post("", response_model=EventDetail, status_code=201)
def create_event(payload: EventCreate, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    status_val = payload.publication_status or "draft"
    if status_val not in {"draft", "published"}:
        raise HTTPException(422, "publication_status must be 'draft' or 'published'")

    slug = _unique_slug(db, slugify(payload.slug or payload.title))

    ev = Event(
        id=str(uuid4()),
        slug=slug,
        title=payload.title,
        short_description=payload.short_description or "",
        description=payload.description or "",
        cover_image_src=payload.cover_image_src or "",
        cover_video_src=payload.cover_video_src or "",
        start_at=payload.start_at,
        end_at=payload.end_at,
        location_name=payload.location_name,
        address=payload.address,
        metro=payload.metro,
        city=payload.city or "Москва",
        price=payload.price,
        registration_url=payload.registration_url,
        capacity=payload.capacity,
        custom_page=payload.custom_page or None,
        is_featured=payload.is_featured or False,
        publication_status=PublicationStatus(status_val),
        mdx_content=payload.mdx_content or "",
        seo_title=payload.seo_title,
        meta_description=payload.meta_description,
    )
    ev.tags = resolve_tags(db, payload.tags, TagKind.tag)
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


@router.patch("/{slug}", response_model=EventDetail)
def update_event(
    slug: str,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    ev = db.query(Event).filter(Event.slug == slug).first()
    if not ev:
        raise HTTPException(404, "Event not found")

    update = payload.model_dump(exclude_unset=True)

    if "slug" in update and update["slug"] and update["slug"] != ev.slug:
        update["slug"] = _unique_slug(db, slugify(update["slug"]), exclude_id=ev.id)

    if "publication_status" in update and update["publication_status"] is not None:
        if update["publication_status"] not in {"draft", "published"}:
            raise HTTPException(422, "publication_status must be 'draft' or 'published'")
        update["publication_status"] = PublicationStatus(update["publication_status"])

    tags_in = update.pop("tags", None)
    for k, v in update.items():
        setattr(ev, k, v)
    if tags_in is not None:
        ev.tags = resolve_tags(db, tags_in, TagKind.tag)

    db.commit()
    db.refresh(ev)
    return ev


@router.delete("/{slug}", status_code=204)
def delete_event(slug: str, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    ev = db.query(Event).filter(Event.slug == slug).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    db.delete(ev)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Event requests — admin moderation
# ---------------------------------------------------------------------------

@router.get("/{slug}/requests", response_model=List[EventRequestOut])
def list_event_requests(
    slug: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    ev = db.query(Event).filter(Event.slug == slug).first()
    if not ev:
        raise HTTPException(404, "Event not found")
    q = db.query(EventRequest).filter(EventRequest.event_id == ev.id)
    if status:
        q = q.filter(EventRequest.status == status)
    return q.order_by(EventRequest.created_at.desc()).all()


class RequestStatusUpdate(BaseModel):
    status: str
    decline_reason: Optional[str] = None


@router.patch("/requests/{request_id}", response_model=EventRequestOut)
def update_event_request(
    request_id: UUID,
    payload: RequestStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    req = db.get(EventRequest, request_id)
    if not req:
        raise HTTPException(404, "Request not found")
    allowed = {"new", "approved", "declined", "canceled"}
    if payload.status not in allowed:
        raise HTTPException(422, f"status must be one of {sorted(allowed)}")
    req.status = payload.status
    req.decline_reason = payload.decline_reason if payload.status == "declined" else None
    db.commit()
    db.refresh(req)
    return req

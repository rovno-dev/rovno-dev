"""Public events API: list, detail, register."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.event_request import EventRequest
from app.models.project import PublicationStatus
from app.schemas.event.requests import EventRequestIn
from app.schemas.event.responses import (
    EventDetail,
    EventListItem,
    EventRequestOut,
)
from app.services.tag_service import resolve_tags
from app.models.tag import TagKind
from database.database import get_db

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=List[EventListItem])
def list_published_events(
    upcoming_only: bool = Query(False),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    q = db.query(Event).filter(Event.publication_status == PublicationStatus.published)
    if upcoming_only:
        from datetime import datetime
        q = q.filter(Event.start_at >= datetime.utcnow())
    return (
        q.order_by(Event.start_at.desc().nullslast(), Event.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{slug}", response_model=EventDetail)
def get_published_event(slug: str, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.slug == slug).first()
    if not ev or ev.publication_status != PublicationStatus.published:
        raise HTTPException(404, "Event not found")
    return ev


@router.post("/{slug}/register", response_model=EventRequestOut, status_code=201)
def register_for_event(
    slug: str,
    payload: EventRequestIn,
    db: Session = Depends(get_db),
):
    """Anonymous registration. Landing pages call this from the form.

    Basic identity fields are stored as columns; anything else rides in the
    `meta` JSON blob. No auth required — the event page decides who can
    register.
    """
    ev = db.query(Event).filter(Event.slug == slug).first()
    if not ev or ev.publication_status != PublicationStatus.published:
        raise HTTPException(404, "Event not found")

    req = EventRequest(
        event_id=ev.id,
        name=(payload.name or "").strip() or None,
        surname=(payload.surname or "").strip() or None,
        patronymic=(payload.patronymic or "").strip() or None,
        phone=(payload.phone or "").strip() or None,
        email=(payload.email or "").strip().lower() or None,
        telegram_username=(payload.telegram_username or "").strip().lstrip("@") or None,
        age=payload.age,
        meta=payload.meta or None,
        status="new",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

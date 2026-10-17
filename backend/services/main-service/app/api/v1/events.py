"""Public events API: list, detail, register."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
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
# Seat statuses that still occupy a place. `declined` (rejected by admin)
# and `canceled` (withdrawn) release the seat back to the pool.
OCCUPYING_STATUSES = ("new", "approved")
def attach_registered_counts(db: Session, events: List[Event]) -> None:
    """Annotate each event with `.registered_count`.
    Not a column on `Event` — the value is derived from the requests
    table and set on the ORM instance so the Pydantic response model can
    read it via `from_attributes=True`. Batched in one query so the list
    endpoint doesn't N+1.
    """
    if not events:
        return
    ids = [e.id for e in events]
    rows = (
        db.query(EventRequest.event_id, func.count(EventRequest.id))
        .filter(
            EventRequest.event_id.in_(ids),
            EventRequest.status.in_(OCCUPYING_STATUSES),
        )
        .group_by(EventRequest.event_id)
        .all()
    )
    counts = {event_id: int(n) for event_id, n in rows}
    for e in events:
        e.registered_count = counts.get(e.id, 0)
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
    events = (
        q.order_by(Event.start_at.desc().nullslast(), Event.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    attach_registered_counts(db, events)
    return events
@router.get("/{slug}", response_model=EventDetail)
def get_published_event(slug: str, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.slug == slug).first()
    if not ev or ev.publication_status != PublicationStatus.published:
        raise HTTPException(404, "Event not found")
    attach_registered_counts(db, [ev])
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
    Capacity check: when `capacity` is a positive integer, registration is
    refused once the number of occupying requests hits it. Returns 409 so
    the client can render a distinct "sold out" state instead of a generic
    validation error.
    """
    ev = db.query(Event).filter(Event.slug == slug).first()
    if not ev or ev.publication_status != PublicationStatus.published:
        raise HTTPException(404, "Event not found")
    if ev.capacity is not None and ev.capacity > 0:
        taken = (
            db.query(func.count(EventRequest.id))
            .filter(
                EventRequest.event_id == ev.id,
                EventRequest.status.in_(OCCUPYING_STATUSES),
            )
            .scalar()
            or 0
        )
        if taken >= ev.capacity:
            raise HTTPException(
                status_code=409,
                detail="Регистрация закрыта — все места заняты",
            )
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

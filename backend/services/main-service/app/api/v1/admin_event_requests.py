"""Admin global view of every event registration, across all events."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.api.v1.admin import get_admin_user
from app.models.event import Event
from app.models.event_request import EventRequest
from app.models.user import User
from pydantic import BaseModel
from database.database import get_db

router = APIRouter(prefix="/admin/event-requests", tags=["admin-event-requests"])


class EventRequestWithEvent(BaseModel):
    id: UUID
    event_id: str
    event_slug: Optional[str] = None
    event_title: Optional[str] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    patronymic: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    telegram_username: Optional[str] = None
    age: Optional[int] = None
    status: str
    decline_reason: Optional[str] = None
    meta: Optional[dict] = None
    created_at: datetime
    updated_at: datetime


@router.get("", response_model=List[EventRequestWithEvent])
def list_all_event_requests(
    event_slug: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(500, ge=1, le=2000),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    query = (
        db.query(EventRequest, Event)
        .outerjoin(Event, Event.id == EventRequest.event_id)
    )
    if event_slug:
        query = query.filter(Event.slug == event_slug)
    if status:
        query = query.filter(EventRequest.status == status)
    if q:
        like = f"%{q.strip()}%"
        from sqlalchemy import or_
        query = query.filter(
            or_(
                EventRequest.name.ilike(like),
                EventRequest.surname.ilike(like),
                EventRequest.email.ilike(like),
                EventRequest.phone.ilike(like),
            )
        )
    rows = query.order_by(EventRequest.created_at.desc()).limit(limit).all()
    return [
        EventRequestWithEvent(
            id=req.id,
            event_id=req.event_id,
            event_slug=(ev.slug if ev else None),
            event_title=(ev.title if ev else None),
            name=req.name,
            surname=req.surname,
            patronymic=req.patronymic,
            phone=req.phone,
            email=req.email,
            telegram_username=req.telegram_username,
            age=req.age,
            status=req.status,
            decline_reason=req.decline_reason,
            meta=req.meta,
            created_at=req.created_at,
            updated_at=req.updated_at,
        )
        for req, ev in rows
    ]

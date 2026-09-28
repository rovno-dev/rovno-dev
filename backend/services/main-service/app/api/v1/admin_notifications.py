from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.notification import (
    NotificationSettings,
    DEFAULT_ORDER_SUBJECT,
    DEFAULT_ORDER_BODY,
)
from app.models.user import User, UserRole
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/admin/notification-settings", tags=["admin-notifications"])


def require_root(current_user: User = Depends(get_current_user)) -> User:
    """Stricter than get_admin_user — settings are root-only by design."""
    if current_user.user_role != UserRole.root:
        raise HTTPException(403, "Root role required")
    return current_user


class SettingsIn(BaseModel):
    order_notify_email: bool
    order_notify_telegram: bool
    # Legacy single list — kept so older clients still parse. New clients
    # send the two channel-specific lists below.
    order_recipient_ids: List[UUID] = []
    order_email_recipient_ids: List[UUID] = []
    order_telegram_recipient_ids: List[UUID] = []
    order_template_subject: str
    order_template_body: str


class SettingsOut(BaseModel):
    order_notify_email: bool
    order_notify_telegram: bool
    order_recipient_ids: List[UUID]
    order_email_recipient_ids: List[UUID]
    order_telegram_recipient_ids: List[UUID]
    order_template_subject: str
    order_template_body: str
    # Shipped to the client so the "Reset to default" button has something
    # to reset to without hardcoding the copy in the frontend.
    default_subject: str
    default_body: str


def _get_or_create(db: Session) -> NotificationSettings:
    s = db.get(NotificationSettings, 1)
    if not s:
        s = NotificationSettings(id=1)
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


def _to_out(s: NotificationSettings) -> SettingsOut:
    return SettingsOut(
        order_notify_email=s.order_notify_email,
        order_notify_telegram=s.order_notify_telegram,
        order_recipient_ids=[UUID(str(i)) for i in (s.order_recipient_ids or [])],
        order_email_recipient_ids=[
            UUID(str(i)) for i in (s.order_email_recipient_ids or [])
        ],
        order_telegram_recipient_ids=[
            UUID(str(i)) for i in (s.order_telegram_recipient_ids or [])
        ],
        order_template_subject=s.order_template_subject,
        order_template_body=s.order_template_body,
        default_subject=DEFAULT_ORDER_SUBJECT,
        default_body=DEFAULT_ORDER_BODY,
    )


@router.get("", response_model=SettingsOut)
def get_settings(
    db: Session = Depends(get_db),
    _: User = Depends(require_root),
):
    return _to_out(_get_or_create(db))


@router.put("", response_model=SettingsOut)
def update_settings(
    payload: SettingsIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_root),
):
    s = _get_or_create(db)
    s.order_notify_email = payload.order_notify_email
    s.order_notify_telegram = payload.order_notify_telegram
    s.order_recipient_ids = [str(i) for i in payload.order_recipient_ids]
    s.order_email_recipient_ids = [str(i) for i in payload.order_email_recipient_ids]
    s.order_telegram_recipient_ids = [
        str(i) for i in payload.order_telegram_recipient_ids
    ]
    s.order_template_subject = (
        payload.order_template_subject.strip() or DEFAULT_ORDER_SUBJECT
    )
    s.order_template_body = (
        payload.order_template_body.strip() or DEFAULT_ORDER_BODY
    )
    db.commit()
    db.refresh(s)
    return _to_out(s)

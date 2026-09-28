from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.admin import get_admin_user
from app.models.order_request import OrderRequest
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

# ── Manual resend / debug ─────────────────────────────────────────────
@router.post("/test-order/{order_id}")
async def resend_order_notification(
    order_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    """Manually fan out a new-order notification for debugging.

    Does NOT dedupe: calling this twice delivers twice. Returns a snapshot
    of what was resolved and scheduled so an admin can see why a live
    notification might have gone nowhere (empty recipient lists, users
    with preferences off, missing telegram chat ids).
    """
    from app.services import notification_service as svc

    order = db.get(OrderRequest, order_id)
    if not order:
        raise HTTPException(404, "Order not found")

    settings = svc.get_or_create_settings(db)
    email_recipients = svc.resolve_email_recipients(db, settings)
    telegram_recipients = svc.resolve_telegram_recipients(db, settings)

    # Snapshot per-recipient state so we can tell the admin exactly why
    # a particular user will or will not receive anything.
    def _u_brief(u: User) -> dict:
        prefs = svc.get_or_create_prefs(db, u)
        return {
            "id": str(u.id),
            "email": u.email,
            "email_enabled": prefs.email_enabled,
            "telegram_enabled": prefs.telegram_enabled,
            "telegram_chat_id": prefs.telegram_chat_id,
        }

    snapshot = {
        "order_id": str(order_id),
        "settings": {
            "order_notify_email": settings.order_notify_email,
            "order_notify_telegram": settings.order_notify_telegram,
            "order_email_recipient_ids": settings.order_email_recipient_ids,
            "order_telegram_recipient_ids": settings.order_telegram_recipient_ids,
            "order_recipient_ids_legacy": settings.order_recipient_ids,
        },
        "email_recipients": [_u_brief(u) for u in email_recipients],
        "telegram_recipients": [_u_brief(u) for u in telegram_recipients],
    }

    try:
        await svc.notify_new_order(db, order)
        dispatched = True
    except Exception as e:
        logger.exception("Manual notification failed for order %s", order_id)
        dispatched = False
        snapshot["error"] = f"{type(e).__name__}: {e}"

    return {"dispatched": dispatched, **snapshot}

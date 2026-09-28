import os
import secrets
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.notification import UserNotificationPreference
from app.models.user import User
from app.shared.auth import get_current_user
from database.cache import cache_client
from database.database import get_db

router = APIRouter(prefix="/me/notifications", tags=["notifications"])

LINK_TTL_SECONDS = 600  # 10 minutes

BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "").lstrip("@")


class PrefsOut(BaseModel):
    email_enabled: bool
    telegram_enabled: bool
    telegram_connected: bool
    telegram_username: Optional[str] = None
    bot_username: Optional[str] = None


class PrefsIn(BaseModel):
    email_enabled: bool
    telegram_enabled: bool


class ConnectCodeOut(BaseModel):
    code: str
    url: str
    expires_in: int


def _get_or_create(db: Session, user: User) -> UserNotificationPreference:
    p = db.get(UserNotificationPreference, user.id)
    if not p:
        p = UserNotificationPreference(user_id=user.id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def _to_out(prefs: UserNotificationPreference) -> PrefsOut:
    return PrefsOut(
        email_enabled=prefs.email_enabled,
        telegram_enabled=prefs.telegram_enabled,
        telegram_connected=bool(prefs.telegram_chat_id),
        telegram_username=prefs.telegram_username,
        bot_username=BOT_USERNAME or None,
    )


@router.get("", response_model=PrefsOut)
def get_prefs(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return _to_out(_get_or_create(db, user))


@router.put("", response_model=PrefsOut)
def update_prefs(
    payload: PrefsIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prefs = _get_or_create(db, user)
    prefs.email_enabled = payload.email_enabled
    prefs.telegram_enabled = payload.telegram_enabled
    db.commit()
    db.refresh(prefs)
    return _to_out(prefs)


@router.post("/telegram/connect-code", response_model=ConnectCodeOut)
def create_connect_code(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not BOT_USERNAME:
        raise HTTPException(503, "Telegram bot is not configured on this server")
    # Short, url-safe, single-use. Stored in Valkey with a TTL so an
    # intercepted code cannot be replayed after 10 minutes.
    code = secrets.token_urlsafe(12)[:16]
    cache_client.setex(f"tg-link:{code}", LINK_TTL_SECONDS, str(user.id))
    return ConnectCodeOut(
        code=code,
        url=f"https://t.me/{BOT_USERNAME}?start={code}",
        expires_in=LINK_TTL_SECONDS,
    )


@router.delete("/telegram")
def disconnect_telegram(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prefs = _get_or_create(db, user)
    prefs.telegram_chat_id = None
    prefs.telegram_username = None
    prefs.linked_at = None
    db.commit()
    return {"ok": True}

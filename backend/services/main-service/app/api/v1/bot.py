import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.notification import UserNotificationPreference
from database.cache import cache_client
from database.database import get_db

router = APIRouter(prefix="/bot", tags=["bot"])

# Shared secret between the tg-bot process and this service. Injected from
# .env; the bot must present it as `X-Bot-Secret` on every call.
BOT_SECRET = os.getenv("TELEGRAM_BOT_WEBHOOK_SECRET", "")


def require_bot(x_bot_secret: str = Header(...)):
    if not BOT_SECRET:
        raise HTTPException(503, "Bot bridge is not configured")
    if x_bot_secret != BOT_SECRET:
        raise HTTPException(403, "Invalid bot secret")


class LinkIn(BaseModel):
    code: str
    chat_id: str
    telegram_username: Optional[str] = None


class UnlinkIn(BaseModel):
    chat_id: str


@router.post("/link", dependencies=[Depends(require_bot)])
def link_chat(payload: LinkIn, db: Session = Depends(get_db)):
    key = f"tg-link:{payload.code}"
    user_id = cache_client.get(key)
    if not user_id:
        # 410 Gone: the code was valid but has expired or already been used.
        raise HTTPException(410, "Link code expired or invalid")

    prefs = db.get(UserNotificationPreference, user_id)
    if not prefs:
        prefs = UserNotificationPreference(user_id=user_id)
        db.add(prefs)

    prefs.telegram_chat_id = str(payload.chat_id)
    prefs.telegram_username = payload.telegram_username
    prefs.linked_at = datetime.utcnow()
    db.commit()

    # Single-use code — delete after successful link.
    cache_client.delete(key)
    return {"ok": True}


@router.post("/unlink", dependencies=[Depends(require_bot)])
def unlink_chat(payload: UnlinkIn, db: Session = Depends(get_db)):
    prefs = (
        db.query(UserNotificationPreference)
        .filter(UserNotificationPreference.telegram_chat_id == str(payload.chat_id))
        .first()
    )
    if prefs:
        prefs.telegram_chat_id = None
        prefs.telegram_username = None
        prefs.linked_at = None
        db.commit()
    return {"ok": True}


@router.post("/status", dependencies=[Depends(require_bot)])
def chat_status(payload: UnlinkIn, db: Session = Depends(get_db)):
    prefs = (
        db.query(UserNotificationPreference)
        .filter(UserNotificationPreference.telegram_chat_id == str(payload.chat_id))
        .first()
    )
    return {"connected": prefs is not None}

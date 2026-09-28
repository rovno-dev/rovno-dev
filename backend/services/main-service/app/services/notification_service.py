import os
import re
import logging
import asyncio
import smtplib
from email.message import EmailMessage
from email.utils import formataddr, make_msgid, formatdate
from typing import Any, Dict, Iterable, List
from uuid import UUID
import httpx
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.notification import (
    NotificationSettings,
    UserNotificationPreference,
    DEFAULT_ORDER_SUBJECT,
    DEFAULT_ORDER_BODY,
)
from app.models.order_request import OrderRequest
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)

_VAR_RE = re.compile(r"\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}")


def render_template(template: str, context: Dict[str, Any]) -> str:
    def repl(m: re.Match) -> str:
        return str(context.get(m.group(1), ""))
    return _VAR_RE.sub(repl, template)


def get_or_create_settings(db: Session) -> NotificationSettings:
    s = db.get(NotificationSettings, 1)
    if not s:
        s = NotificationSettings(id=1)
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


def get_or_create_prefs(db: Session, user: User) -> UserNotificationPreference:
    p = db.get(UserNotificationPreference, user.id)
    if not p:
        p = UserNotificationPreference(user_id=user.id)
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def _parse_ids(raw: Iterable | None) -> List[UUID]:
    """Tolerate the JSON column's contents being strings, UUIDs, or garbage.

    Old rows may hold strings, new rows hold UUIDs, and a hand-edited row
    could hold anything. Bad entries are skipped with a log line rather
    than taking the whole notification down.
    """
    out: List[UUID] = []
    for i in (raw or []):
        try:
            out.append(UUID(str(i)))
        except (ValueError, TypeError, AttributeError):
            logger.warning("Notification settings: skipping invalid recipient id %r", i)
    return out


def _resolve_recipients(db: Session, ids: Iterable | None, channel: str) -> List[User]:
    id_list = _parse_ids(ids)
    if id_list:
        users = db.query(User).filter(User.id.in_(id_list)).all()
        found = {u.id for u in users}
        missing = [str(i) for i in id_list if i not in found]
        if missing:
            logger.warning(
                "%s recipients: %d id(s) do not resolve to a user: %s",
                channel, len(missing), missing,
            )
        return [u for u in users if not u.blocked]
    # Fall back to every unblocked admin/root.
    users = (
        db.query(User)
        .filter(User.user_role.in_([UserRole.admin, UserRole.root]))
        .filter(User.blocked.is_(False))
        .all()
    )
    logger.info(
        "%s recipients: empty list — defaulting to %d admin/root user(s)",
        channel, len(users),
    )
    return users


def resolve_email_recipients(db: Session, settings: NotificationSettings) -> List[User]:
    ids = settings.order_email_recipient_ids
    if not ids:
        # Prefer the channel-specific list, fall back to the legacy one.
        ids = settings.order_recipient_ids
    return _resolve_recipients(db, ids, "Email")


def resolve_telegram_recipients(db: Session, settings: NotificationSettings) -> List[User]:
    ids = settings.order_telegram_recipient_ids
    if not ids:
        ids = settings.order_recipient_ids
    return _resolve_recipients(db, ids, "Telegram")


def build_order_context(db: Session, order: OrderRequest) -> Dict[str, str]:
    c = order.client
    company_name = ""
    if c and c.company_id:
        company = db.get(Company, c.company_id)
        if company:
            company_name = company.name or ""
    return {
        "order_id": str(order.id),
        "short_id": str(order.id)[:8],
        "created_at": order.created_at.strftime("%d.%m.%Y %H:%M") if order.created_at else "",
        "name": (getattr(c, "name", None) or ""),
        "phone": (getattr(c, "phone", None) or ""),
        "email": (getattr(c, "email", None) or ""),
        "telegram": (getattr(c, "telegram_username", None) or ""),
        "services": ", ".join(order.service_types_json or []),
        "budget": order.estimate_budget.value if order.estimate_budget else "",
        "deadline": order.estimate_deadline.value if order.estimate_deadline else "",
        "about": order.about or "",
        "naming_help": order.naming_help or "",
        "company_name": company_name,
        "files_count": str(len(order.files or [])),
        "status": order.status.value if order.status else "new",
    }


def _send_email_sync(to_email: str, subject: str, body: str) -> bool:
    sender = os.getenv("MAIL_SENDER")
    password = (os.getenv("MAIL_PASSWORD") or "").strip()
    server = os.getenv("MAIL_SERVER")
    try:
        port = int(os.getenv("MAIL_PORT", "587"))
    except ValueError:
        logger.error("MAIL_PORT is not a number")
        return False
    if not (sender and password and server):
        logger.error(
            "Email config incomplete — MAIL_SENDER=%r MAIL_SERVER=%r MAIL_PASSWORD=%s",
            sender, server, "set" if password else "MISSING",
        )
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = formataddr(("Rovno.dev", sender))
    msg["To"] = to_email
    msg["Message-ID"] = make_msgid(
        domain=sender.split("@")[-1] if "@" in sender else None
    )
    msg["Date"] = formatdate(localtime=True)
    msg["Auto-Submitted"] = "auto-generated"
    msg["X-Auto-Response-Suppress"] = "All"
    msg.set_content(body)

    try:
        if port == 465:
            with smtplib.SMTP_SSL(server, port, timeout=15) as s:
                s.ehlo(); s.login(sender, password); s.send_message(msg)
        else:
            with smtplib.SMTP(server, port, timeout=15) as s:
                s.ehlo(); s.starttls(); s.ehlo()
                s.login(sender, password); s.send_message(msg)
        logger.info("Email delivery OK → %s (subject=%r)", to_email, subject)
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(
            "Email auth FAILED for %s — server said %s %r. If this is "
            "Gmail/Yandex/Mail.ru, MAIL_PASSWORD must be an App Password.",
            sender, e.smtp_code, e.smtp_error,
        )
        return False
    except Exception as e:
        logger.error(
            "Email delivery FAILED → %s via %s:%s — %s: %s",
            to_email, server, port, type(e).__name__, e,
        )
        return False


async def _send_telegram(chat_id: str, text: str) -> bool:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.error("Telegram delivery SKIPPED — TELEGRAM_BOT_TOKEN not set in .env")
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "disable_web_page_preview": True,
    }
    # 3 attempts with exponential backoff. A single DNS hiccup on a cold
    # container used to kill the delivery outright; a couple of retries
    # turns that into a non-event.
    last_error: str = ""
    for attempt in range(1, 4):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.post(url, json=payload)
                if r.status_code == 200:
                    logger.info("Telegram delivery OK → chat %s", chat_id)
                    return True
                # 4xx is a client problem (bad token, user blocked bot) —
                # retrying won't help. Bail out.
                if 400 <= r.status_code < 500:
                    logger.error(
                        "Telegram delivery FAILED → chat %s — %s %s "
                        "(not retrying — client error)",
                        chat_id, r.status_code, r.text,
                    )
                    return False
                last_error = f"HTTP {r.status_code}: {r.text}"
        except Exception as e:
            last_error = f"{type(e).__name__}: {e}"

        if attempt < 3:
            backoff = 2 ** (attempt - 1)
            logger.warning(
                "Telegram delivery attempt %d/3 → chat %s failed (%s); "
                "retrying in %ds",
                attempt, chat_id, last_error, backoff,
            )
            await asyncio.sleep(backoff)

    logger.error(
        "Telegram delivery FAILED after 3 attempts → chat %s — %s",
        chat_id, last_error,
    )
    return False


async def notify_new_order(db: Session, order: OrderRequest) -> None:
    """Fan out a new-order notification to every subscribed recipient.

    Email and Telegram are independent channels with independent recipient
    lists. Per-user preferences gate each channel again. Every decision is
    logged so a failed delivery is diagnosable from the service logs alone.
    """
    logger.info("notify_new_order: order %s — building notification", order.id)

    settings = get_or_create_settings(db)
    logger.info(
        "notify_new_order: settings loaded — "
        "email_enabled=%s telegram_enabled=%s "
        "email_ids=%s telegram_ids=%s legacy_ids=%s",
        settings.order_notify_email,
        settings.order_notify_telegram,
        settings.order_email_recipient_ids,
        settings.order_telegram_recipient_ids,
        settings.order_recipient_ids,
    )

    email_recipients = (
        resolve_email_recipients(db, settings) if settings.order_notify_email else []
    )
    telegram_recipients = (
        resolve_telegram_recipients(db, settings) if settings.order_notify_telegram else []
    )

    logger.info(
        "notify_new_order: resolved %d email recipient(s) and %d telegram recipient(s)",
        len(email_recipients), len(telegram_recipients),
    )

    if not email_recipients and not telegram_recipients:
        logger.warning(
            "notify_new_order: NO recipients to notify for order %s — "
            "check the admin notifications page", order.id,
        )
        return

    context = build_order_context(db, order)
    subject = render_template(settings.order_template_subject, context)
    body = render_template(settings.order_template_body, context)

    email_ids = {u.id for u in email_recipients}
    telegram_ids = {u.id for u in telegram_recipients}
    by_id: Dict[Any, User] = {}
    for u in email_recipients + telegram_recipients:
        by_id[u.id] = u

    tasks: List = []
    for uid, user in by_id.items():
        prefs = get_or_create_prefs(db, user)

        if uid in email_ids:
            if prefs.email_enabled:
                tasks.append(
                    asyncio.to_thread(_send_email_sync, user.email, subject, body)
                )
            else:
                logger.info(
                    "notify_new_order: user %s opted OUT of email", user.email
                )

        if uid in telegram_ids:
            if not prefs.telegram_enabled:
                logger.info(
                    "notify_new_order: user %s opted OUT of telegram", user.email
                )
            elif not prefs.telegram_chat_id:
                logger.warning(
                    "notify_new_order: user %s has NO telegram_chat_id — "
                    "cannot deliver", user.email,
                )
            else:
                telegram_text = f"{subject}\n\n{body}"
                tasks.append(_send_telegram(prefs.telegram_chat_id, telegram_text))

    if not tasks:
        logger.warning(
            "notify_new_order: NO delivery tasks scheduled for order %s — "
            "check per-user preferences and chat ids", order.id,
        )
        return

    logger.info(
        "notify_new_order: dispatching %d task(s) for order %s",
        len(tasks), order.id,
    )
    results = await asyncio.gather(*tasks, return_exceptions=True)
    ok = sum(1 for r in results if r is True)
    logger.info(
        "notify_new_order: DONE for order %s — %d/%d delivered",
        order.id, ok, len(tasks),
    )

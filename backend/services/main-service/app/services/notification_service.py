import os
import re
import logging
import asyncio
import smtplib
from email.message import EmailMessage
from email.utils import formataddr, make_msgid, formatdate
from typing import Any, Dict, List

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

# `{{var}}` interpolation. Intentionally not Jinja2 — no filters, no loops,
# no expressions. Just named substitution.
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


def resolve_recipients(db: Session, settings: NotificationSettings) -> List[User]:
    """Explicit recipient list, else every unblocked admin/root."""
    ids = settings.order_recipient_ids or []
    if ids:
        users = (
            db.query(User)
            .filter(User.id.in_([str(i) for i in ids]))
            .all()
        )
        return [u for u in users if not u.blocked]
    return (
        db.query(User)
        .filter(User.user_role.in_([UserRole.admin, UserRole.root]))
        .filter(User.blocked.is_(False))
        .all()
    )


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
        logger.error("Email config incomplete for notification")
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
        with smtplib.SMTP(server, port, timeout=15) as s:
            s.ehlo()
            s.starttls()
            s.ehlo()
            s.login(sender, password)
            s.send_message(msg)
        return True
    except Exception as e:
        logger.error("Notification email to %s failed: %s", to_email, e, exc_info=True)
        return False


async def _send_telegram(chat_id: str, text: str) -> bool:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN not set — skipping telegram notification")
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "disable_web_page_preview": True,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(url, json=payload)
            if r.status_code != 200:
                logger.error(
                    "Telegram send failed to %s: %s %s",
                    chat_id, r.status_code, r.text,
                )
                return False
        return True
    except Exception as e:
        logger.error("Telegram send error: %s", e, exc_info=True)
        return False


async def notify_new_order(db: Session, order: OrderRequest) -> None:
    """Fan out a new-order notification to every subscribed recipient.

    Called from orders.create_order immediately after commit. Failures are
    logged and swallowed — the order has already been persisted, and a
    notification outage must not surface as a 500 to the customer.
    """
    settings = get_or_create_settings(db)
    recipients = resolve_recipients(db, settings)
    if not recipients:
        logger.info("Order %s: no notification recipients configured", order.id)
        return

    context = build_order_context(db, order)
    subject = render_template(settings.order_template_subject, context)
    body = render_template(settings.order_template_body, context)

    tasks = []
    for user in recipients:
        prefs = get_or_create_prefs(db, user)
        if settings.order_notify_email and prefs.email_enabled:
            tasks.append(asyncio.to_thread(_send_email_sync, user.email, subject, body))
        if (
            settings.order_notify_telegram
            and prefs.telegram_enabled
            and prefs.telegram_chat_id
        ):
            telegram_text = f"{subject}\n\n{body}"
            tasks.append(_send_telegram(prefs.telegram_chat_id, telegram_text))

    if not tasks:
        logger.info("Order %s: no delivery channels enabled", order.id)
        return

    results = await asyncio.gather(*tasks, return_exceptions=True)
    ok = sum(1 for r in results if r is True)
    logger.info(
        "Order %s notification: %d/%d delivered",
        order.id, ok, len(tasks),
    )

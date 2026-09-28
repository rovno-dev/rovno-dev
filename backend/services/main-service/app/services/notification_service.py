import os
import re
import html
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

# Template syntax:
#   {{var}}           → value, empty string when missing
#   {{var|fallback}}  → value, or `fallback` when the value is empty/missing
_VAR_RE = re.compile(
    r"\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\|\s*([^}]*?))?\s*\}\}"
)


def render_template(template: str, context: Dict[str, Any]) -> str:
    def repl(m: re.Match) -> str:
        key = m.group(1)
        fallback = m.group(2)
        value = context.get(key, "")
        if value in (None, ""):
            return (fallback or "").strip()
        return str(value)
    return _VAR_RE.sub(repl, template)


# ── Human-readable enum labels ────────────────────────────────────────
_DEADLINE_LABELS = {
    "asap": "Как можно скорее",
    "under_1_month": "До 1 месяца",
    "1_3_months": "1–3 месяца",
    "flexible": "Не горит",
}
_BUDGET_LABELS = {
    "30k_75k": "30 000 – 75 000 ₽",
    "75k_150k": "75 000 – 150 000 ₽",
    "150k_500k": "150 000 – 500 000 ₽",
    "500k_1kk": "500 000 – 1 000 000 ₽",
    "over_1kk": "Более 1 000 000 ₽",
    "need_consultation": "Нужна консультация",
}
_NAMING_LABELS = {
    "yes": "Нужно название",
    "no": "Уже есть",
    "discuss": "Хочет обсудить",
}


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
    out: List[UUID] = []
    for i in (raw or []):
        try:
            out.append(UUID(str(i)))
        except (ValueError, TypeError, AttributeError):
            logger.warning("Notification settings: invalid recipient id %r", i)
    return out


def _resolve_recipients(db: Session, ids: Iterable | None, channel: str) -> List[User]:
    id_list = _parse_ids(ids)
    if id_list:
        users = db.query(User).filter(User.id.in_(id_list)).all()
        found = {u.id for u in users}
        missing = [str(i) for i in id_list if i not in found]
        if missing:
            logger.warning("%s recipients: %d unknown user id(s): %s",
                           channel, len(missing), missing)
        return [u for u in users if not u.blocked]
    users = (
        db.query(User)
        .filter(User.user_role.in_([UserRole.admin, UserRole.root]))
        .filter(User.blocked.is_(False))
        .all()
    )
    logger.info("%s recipients: empty list — defaulting to %d admin/root user(s)",
                channel, len(users))
    return users


def resolve_email_recipients(db: Session, settings: NotificationSettings) -> List[User]:
    ids = settings.order_email_recipient_ids or settings.order_recipient_ids
    return _resolve_recipients(db, ids, "Email")


def resolve_telegram_recipients(db: Session, settings: NotificationSettings) -> List[User]:
    ids = settings.order_telegram_recipient_ids or settings.order_recipient_ids
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
        "telegram": (
            f"@{getattr(c, 'telegram_username', '').lstrip('@')}"
            if getattr(c, "telegram_username", None)
            else ""
        ),
        "services": ", ".join(order.service_types_json or []),
        "budget": (
            _BUDGET_LABELS.get(order.estimate_budget.value, order.estimate_budget.value)
            if order.estimate_budget else ""
        ),
        "deadline": (
            _DEADLINE_LABELS.get(order.estimate_deadline.value, order.estimate_deadline.value)
            if order.estimate_deadline else ""
        ),
        "naming_help": _NAMING_LABELS.get(order.naming_help or "", order.naming_help or ""),
        "about": order.about or "",
        "company_name": company_name,
        "files_count": str(len(order.files or [])),
        "status": order.status.value if order.status else "new",
    }


# ─────────────────────────────────────────────────────────────────────
# Telegram — plain text only, no parse_mode
# ─────────────────────────────────────────────────────────────────────

# Section header on its own line: **Title** → `─── Title ───`
_HEADER_RE = re.compile(r"^\*\*(.+?)\*\*\s*$", re.MULTILINE)
# Remaining inline bold and code markers get stripped.
_INLINE_BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
_INLINE_CODE_RE = re.compile(r"`([^`]+?)`")


def _render_telegram_plain(text: str) -> str:
    """Turn the shared template into a plain-text Telegram message.

    We deliberately do NOT set parse_mode. Plain text renders identically
    across every Telegram client, can't fail on an unescaped `<`, and
    survives any Unicode the customer types into the order form.

    Section headers get a light unicode rule so they still read as
    headers once the markdown markers are gone:

        **👤 Клиент**   →   ─── 👤 КЛИЕНТ ───
    """
    def repl_header(m: re.Match) -> str:
        title = m.group(1).strip().upper()
        return f"─── {title} ───"
    out = _HEADER_RE.sub(repl_header, text)
    # Any remaining inline markdown markers are dropped — the content stays.
    out = _INLINE_BOLD_RE.sub(r"\1", out)
    out = _INLINE_CODE_RE.sub(r"\1", out)
    return out


def _telegram_api_base() -> str:
    """Base URL for the Bot API. Override via TELEGRAM_API_BASE for a
    local proxy when the container's network can't reach Telegram directly.

    Default: https://api.telegram.org
    """
    return os.getenv("TELEGRAM_API_BASE", "https://api.telegram.org").rstrip("/")


async def _send_telegram(chat_id: str, text: str) -> bool:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.error("Telegram delivery SKIPPED — TELEGRAM_BOT_TOKEN not set")
        return False

    url = f"{_telegram_api_base()}/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": _render_telegram_plain(text),
        "disable_web_page_preview": True,
        # No parse_mode — plain text. Prevents any HTML-entity rejection.
    }

    last_error = ""
    for attempt in range(1, 4):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.post(url, json=payload)
                if r.status_code == 200:
                    logger.info("Telegram delivery OK → chat %s", chat_id)
                    return True
                if 400 <= r.status_code < 500:
                    logger.error(
                        "Telegram delivery FAILED → chat %s — %s %s "
                        "(client error, not retrying)",
                        chat_id, r.status_code, r.text,
                    )
                    return False
                last_error = f"HTTP {r.status_code}: {r.text}"
        except Exception as e:
            last_error = f"{type(e).__name__}: {e}"

        if attempt < 3:
            backoff = 2 ** (attempt - 1)
            logger.warning(
                "Telegram attempt %d/3 → chat %s failed (%s); retry in %ds",
                attempt, chat_id, last_error, backoff,
            )
            await asyncio.sleep(backoff)

    logger.error(
        "Telegram delivery FAILED after 3 attempts → chat %s — %s",
        chat_id, last_error,
    )
    return False


# ─────────────────────────────────────────────────────────────────────
# Email — plain text + styled HTML alternative
# ─────────────────────────────────────────────────────────────────────

_INLINE_BOLD_EMAIL = re.compile(r"\*\*(.+?)\*\*")
_INLINE_CODE_EMAIL = re.compile(r"`([^`]+?)`")


def _inline_md_to_html(text: str) -> str:
    out = html.escape(text, quote=False)
    out = _INLINE_BOLD_EMAIL.sub(
        r'<strong style="color:#ffffff;font-weight:600;">\1</strong>', out
    )
    out = _INLINE_CODE_EMAIL.sub(
        r'<code style="font-family:\'SF Mono\',Menlo,Consolas,monospace;'
        r'background:#1c1c23;padding:1px 5px;border-radius:4px;color:#a6bfff;">\1</code>',
        out,
    )
    return out


def _render_email_html(subject: str, body: str) -> str:
    """Render the shared plain-text template as a styled HTML card.

    Parses line-by-line so the template stays the single source of truth:
      - `**Heading**` on its own line → section header
      - `• ` lines                    → rows inside a bordered block
      - anything else                 → paragraphs
    """
    lines = body.split("\n")
    blocks: list[dict] = []
    rows: list[str] = []

    def flush_rows() -> None:
        nonlocal rows
        if rows:
            blocks.append({"type": "rows", "items": rows})
            rows = []

    for raw in lines:
        stripped = raw.rstrip().strip()
        if not stripped:
            flush_rows()
            continue
        if (
            stripped.startswith("**")
            and stripped.endswith("**")
            and stripped.count("**") == 2
            and len(stripped) > 4
        ):
            flush_rows()
            blocks.append({"type": "heading", "text": stripped[2:-2]})
            continue
        if stripped.startswith("• "):
            rows.append(_inline_md_to_html(stripped[2:]))
            continue
        flush_rows()
        blocks.append({"type": "paragraph", "html": _inline_md_to_html(stripped)})
    flush_rows()

    rendered_blocks: list[str] = []
    for b in blocks:
        if b["type"] == "heading":
            rendered_blocks.append(
                '<tr><td style="padding:22px 0 8px 0;">'
                '<div style="font-size:11px;letter-spacing:0.18em;'
                'text-transform:uppercase;color:#72727e;'
                'font-family:\'SF Mono\',Menlo,Consolas,monospace;">'
                f'{html.escape(b["text"])}'
                '</div></td></tr>'
            )
        elif b["type"] == "rows":
            row_html = "".join(
                '<tr><td style="padding:5px 0;font-size:14px;line-height:1.55;'
                f'color:#e2e2e6;">{item}</td></tr>'
                for item in b["items"]
            )
            rendered_blocks.append(
                '<tr><td style="padding:2px 0 6px 0;">'
                '<table role="presentation" cellspacing="0" cellpadding="0" '
                'border="0" width="100%" style="background:#0d0d11;'
                'border:1px solid #22222a;border-radius:12px;">'
                '<tr><td style="padding:12px 16px;">'
                '<table role="presentation" cellspacing="0" cellpadding="0" '
                f'border="0" width="100%">{row_html}</table>'
                '</td></tr></table></td></tr>'
            )
        elif b["type"] == "paragraph":
            rendered_blocks.append(
                '<tr><td style="padding:4px 0 6px 0;font-size:14px;'
                f'line-height:1.65;color:#e2e2e6;">{b["html"]}</td></tr>'
            )

    blocks_html = "".join(rendered_blocks) if rendered_blocks else (
        '<tr><td style="font-size:14px;color:#e2e2e6;">'
        + _inline_md_to_html(body)
        + '</td></tr>'
    )

    year = __import__("datetime").datetime.utcnow().year
    logo_url = os.getenv("MAIL_LOGO_URL", "https://rovno.dev/images/logotype-icon.png")

    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<title>{html.escape(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0d0d11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e2e6;">
<div style="display:none;font-size:1px;color:#0d0d11;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">{html.escape(subject)}</div>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0d0d11;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;">
<tr><td align="center" style="padding-bottom:24px;">
  <a href="https://rovno.dev" target="_blank" style="text-decoration:none;">
    <img src="{logo_url}" alt="Rovno.dev" width="56" height="56"
         style="display:block;border-radius:14px;border:0;outline:none;" />
  </a>
</td></tr>
<tr><td style="padding-bottom:18px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr>
<td style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#72727e;">Rovno.dev · Orders</td>
<td align="right" style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#336dff;">NEW</td>
</tr></table></td></tr>
<tr><td style="background:#141419;border:1px solid #22222a;border-radius:20px;padding:26px 26px 22px 26px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr><td style="font-size:20px;font-weight:600;line-height:1.3;color:#ffffff;padding-bottom:4px;">
{_inline_md_to_html(subject)}
</td></tr>
{blocks_html}
</table>
</td></tr>
<tr><td style="padding-top:22px;text-align:center;font-size:11px;letter-spacing:0.08em;color:#4d4d58;">
&copy; {year} Rovno.dev — автоматическое уведомление
</td></tr>
</table></td></tr></table>
</body>
</html>"""


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
    msg.add_alternative(_render_email_html(subject, body), subtype="html")

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


# ─────────────────────────────────────────────────────────────────────
# Orchestrator
# ─────────────────────────────────────────────────────────────────────

async def notify_new_order(db: Session, order: OrderRequest) -> None:
    logger.info("notify_new_order: order %s — building notification", order.id)

    settings = get_or_create_settings(db)
    logger.info(
        "notify_new_order: email_enabled=%s telegram_enabled=%s",
        settings.order_notify_email, settings.order_notify_telegram,
    )

    email_recipients = (
        resolve_email_recipients(db, settings) if settings.order_notify_email else []
    )
    telegram_recipients = (
        resolve_telegram_recipients(db, settings) if settings.order_notify_telegram else []
    )

    logger.info(
        "notify_new_order: resolved %d email / %d telegram recipient(s)",
        len(email_recipients), len(telegram_recipients),
    )

    if not email_recipients and not telegram_recipients:
        logger.warning("notify_new_order: NO recipients for order %s", order.id)
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
                logger.info("notify_new_order: user %s opted OUT of email", user.email)

        if uid in telegram_ids:
            if not prefs.telegram_enabled:
                logger.info("notify_new_order: user %s opted OUT of telegram", user.email)
            elif not prefs.telegram_chat_id:
                logger.warning("notify_new_order: user %s has NO telegram_chat_id", user.email)
            else:
                tasks.append(
                    _send_telegram(prefs.telegram_chat_id, f"{subject}\n\n{body}")
                )

    if not tasks:
        logger.warning("notify_new_order: NO delivery tasks scheduled for order %s", order.id)
        return

    logger.info("notify_new_order: dispatching %d task(s) for order %s", len(tasks), order.id)
    results = await asyncio.gather(*tasks, return_exceptions=True)
    ok = sum(1 for r in results if r is True)
    logger.info("notify_new_order: DONE for order %s — %d/%d delivered",
                order.id, ok, len(tasks))

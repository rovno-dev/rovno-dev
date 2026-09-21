import smtplib
import os
import logging
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr, make_msgid, formatdate

logger = logging.getLogger(__name__)

# Public URL used for the logo that renders at the top of every OTP email.
# Set MAIL_LOGO_URL in .env if you serve the site from a different host.
LOGO_URL = os.getenv("MAIL_LOGO_URL", "https://rovno.dev/images/logotype-icon.png")

STRINGS = {
    "ru": {
        "subject": "Код подтверждения · Rovno.dev",
        "kicker": "Rovno.dev · Безопасность",
        "tag": "2FA",
        "heading": "Подтвердите ваш email",
        "subtitle": "Введите этот код, чтобы завершить регистрацию:",
        "expiry": "Код действителен 5 минут.",
        "ignore": "Если вы не запрашивали этот код, просто проигнорируйте это письмо.",
        "hint": "Письмо попало в «Спам»? Отметьте его как «Не спам», чтобы получать наши коды во «Входящих».",
        "footer": "© {year} Rovno.dev — цифровое агентство полного цикла",
        "text": "Ваш код подтверждения: {code}\n\nКод действителен 5 минут.\nЕсли вы не запрашивали этот код, проигнорируйте письмо.\n\nПисьмо попало в «Спам»? Отметьте его как «Не спам».",
    },
    "en": {
        "subject": "Verification code · Rovno.dev",
        "kicker": "Rovno.dev · Security",
        "tag": "2FA",
        "heading": "Confirm your email",
        "subtitle": "Enter this code to finish creating your account:",
        "expiry": "This code is valid for 5 minutes.",
        "ignore": "If you didn't request this code, you can safely ignore this email.",
        "hint": 'Landed in Spam? Mark it as "Not spam" so our codes reach your inbox next time.',
        "footer": "© {year} Rovno.dev — full-cycle digital agency",
        "text": 'Your verification code: {code}\n\nThis code is valid for 5 minutes.\nIf you didn\'t request this code, you can safely ignore this email.\n\nLanded in Spam? Mark it as "Not spam".',
    },
}


def _render_html(code: str, lang: str) -> str:
    s = STRINGS[lang]
    year = datetime.utcnow().year
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<title>{s["subject"]}</title>
</head>
<body style="margin:0;padding:0;background:#0d0d11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e2e6;">
<div style="display:none;font-size:1px;color:#0d0d11;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">{s["subtitle"]} {code}</div>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0d0d11;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:520px;">
<!-- Sender logo. Doubles as the visual signature at the top of the email.
     Email clients that support image loading (Gmail, Apple Mail, Outlook.com)
     render this inline. Disabled-image clients fall back to the alt text. -->
<tr><td align="center" style="padding-bottom:28px;">
  <a href="https://rovno.dev" target="_blank" style="text-decoration:none;">
    <img src="{LOGO_URL}" alt="Rovno.dev" width="56" height="56"
         style="display:block;border-radius:14px;border:0;outline:none;text-decoration:none;" />
  </a>
</td></tr>
<tr><td style="padding-bottom:24px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr>
<td style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#72727e;">{s["kicker"]}</td>
<td align="right" style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#72727e;">{s["tag"]}</td>
</tr></table></td></tr>
<tr><td style="background:#141419;border:1px solid #22222a;border-radius:20px;padding:40px 32px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr><td style="font-size:22px;font-weight:600;line-height:1.25;color:#ffffff;padding-bottom:8px;">{s["heading"]}</td></tr>
<tr><td style="font-size:14px;line-height:1.5;color:#a9a9b2;padding-bottom:28px;">{s["subtitle"]}</td></tr>
<tr><td align="center" style="padding:4px 0 24px 0;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background:#0d0d11;border:1px solid #2b2b35;border-radius:14px;"><tr>
<td style="padding:22px 32px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:0.28em;color:#336dff;text-align:center;">{code}</td>
</tr></table></td></tr>
<tr><td style="font-size:12px;line-height:1.6;color:#72727e;padding-bottom:8px;">{s["expiry"]}</td></tr>
<tr><td style="font-size:12px;line-height:1.6;color:#72727e;">{s["ignore"]}</td></tr>
</table></td></tr>
<!-- Deliverability hint. Keeping this inside the email body is what nudges
     the recipient to whitelist us — it can't be done from the server side. -->
<tr><td style="padding-top:20px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#141419;border:1px solid #22222a;border-radius:12px;"><tr>
<td style="padding:14px 18px;font-size:12px;line-height:1.6;color:#a9a9b2;">{s["hint"]}</td>
</tr></table></td></tr>
<tr><td style="padding-top:24px;text-align:center;font-size:11px;letter-spacing:0.08em;color:#4d4d58;">{s["footer"].format(year=year)}</td></tr>
</table></td></tr></table>
</body>
</html>"""


async def send_email(email: str, code: str, lang: str = "ru") -> bool:
    sender_email = os.getenv("MAIL_SENDER")
    sender_password = os.getenv("MAIL_PASSWORD")
    mail_server = os.getenv("MAIL_SERVER")
    mail_port_raw = os.getenv("MAIL_PORT", "587")

    missing = [
        k
        for k, v in {
            "MAIL_SENDER": sender_email,
            "MAIL_PASSWORD": sender_password,
            "MAIL_SERVER": mail_server,
        }.items()
        if not v
    ]
    if missing:
        logger.error(f"Email config incomplete, missing: {', '.join(missing)}")
        return False

    try:
        mail_port = int(mail_port_raw)
    except ValueError:
        logger.error(f"MAIL_PORT is not a number: {mail_port_raw!r}")
        return False

    sender_password = sender_password.strip()
    if lang not in STRINGS:
        lang = "ru"
    s = STRINGS[lang]

    msg = EmailMessage()
    msg["Subject"] = s["subject"]
    # formataddr keeps the display name intact across email clients.
    msg["From"] = formataddr(("Rovno.dev", sender_email))
    # Reply-To goes to the human inbox — improves deliverability and, when
    # Gmail has the reply address in your contacts, sometimes pulls in an
    # avatar for the reply thread.
    msg["Reply-To"] = formataddr(("Rovno.dev", "rovno.dev@mail.ru"))
    msg["To"] = email
    # Unique Message-ID with the sending domain — spam filters use this to
    # check sender reputation per-domain.
    msg["Message-ID"] = make_msgid(
        domain=sender_email.split("@")[-1] if "@" in sender_email else None
    )
    msg["Date"] = formatdate(localtime=True)
    # A couple of "this is transactional, not marketing" hints.
    msg["Auto-Submitted"] = "auto-generated"
    msg["X-Auto-Response-Suppress"] = "All"
    msg["X-Entity-Ref-ID"] = code  # nonce to help clients group the thread

    msg.set_content(s["text"].format(code=code))
    msg.add_alternative(_render_html(code, lang), subtype="html")

    try:
        with smtplib.SMTP(mail_server, mail_port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        logger.info(f"Email sent to {email} (lang={lang}, msgid={msg['Message-ID']})")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(
            f"SMTP auth failed for {sender_email}. "
            f"If using Gmail, MAIL_PASSWORD must be a 16-char App Password "
            f"(not your account password). Server said: {e.smtp_code} {e.smtp_error!r}"
        )
        return False
    except Exception as e:
        logger.error(f"Email send error to {email}: {e}", exc_info=True)
        return False

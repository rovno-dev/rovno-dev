import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr, make_msgid, formatdate

sender = os.getenv("MAIL_SENDER")
pwd = (os.getenv("MAIL_PASSWORD") or "").strip()
server = os.getenv("MAIL_SERVER")
port = int(os.getenv("MAIL_PORT", "587"))
to = os.getenv("TEST_MAIL_TO") or sender

print(f"server={server!r} port={port} sender={sender!r} to={to!r}")
print(f"password_length={len(pwd)} has_spaces={' ' in pwd}")

msg = EmailMessage()
msg["Subject"] = "SMTP probe from main-service"
msg["From"] = formataddr(("Rovno.dev", sender))
msg["To"] = to
msg["Message-ID"] = make_msgid(domain=sender.split("@")[-1] if sender and "@" in sender else None)
msg["Date"] = formatdate(localtime=True)
msg.set_content("If you can read this, SMTP + login + relay all work.")

def try_plain_starttls():
    print("--- try: SMTP + starttls (ports 25/587) ---")
    with smtplib.SMTP(server, port, timeout=20) as s:
        s.ehlo()
        s.starttls()
        s.ehlo()
        s.login(sender, pwd)
        s.send_message(msg)

def try_ssl():
    print("--- try: SMTP_SSL (port 465) ---")
    with smtplib.SMTP_SSL(server, port, timeout=20) as s:
        s.ehlo()
        s.login(sender, pwd)
        s.send_message(msg)

try:
    if port == 465:
        try_ssl()
    else:
        try_plain_starttls()
    print("SENT OK")
except smtplib.SMTPAuthenticationError as e:
    print("AUTH FAILED:", e.smtp_code, e.smtp_error)
    print("Hint: Gmail/Yandex/Mail.ru require an APP PASSWORD, not the account password.")
except smtplib.SMTPException as e:
    print("SMTP ERROR:", type(e).__name__, e)
except OSError as e:
    print("NETWORK ERROR:", type(e).__name__, e, "(outbound SMTP likely blocked)")
except Exception as e:
    print("FAILED:", type(e).__name__, e)

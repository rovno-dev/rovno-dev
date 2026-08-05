import smtplib
from email.message import EmailMessage
import os
import logging

# Get the global logger (already configured in main.py)
logger = logging.getLogger(__name__)

async def send_email(email: str, subject: str, content: str) -> bool:
    sender_email = os.getenv("MAIL_SENDER")
    sender_password = os.getenv("MAIL_PASSWORD")
    mail_server = os.getenv("MAIL_SERVER")
    mail_port = int(os.getenv("MAIL_PORT")) if os.getenv("MAIL_PORT") else None
    receiver_email = email

    if not all([sender_email, sender_password, receiver_email, mail_port, mail_server]):
        logger.error("Email credentials missing: sender=%s, server=%s, port=%s", 
                     sender_email, mail_server, mail_port)
        return False

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg.set_content(content)

    logger.info("Sending email to %s with subject '%s' via %s:%s", 
                receiver_email, subject, mail_server, mail_port)

    try:
        with smtplib.SMTP(mail_server, mail_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            # Send the message and capture the response
            response = server.send_message(msg)
            logger.info("SMTP send response: %s", response)
            return True
    except smtplib.SMTPException as e:
        logger.error("SMTP error: %s", e)
        return False
    except Exception as e:
        logger.error("Unexpected email error: %s", e)
        return False

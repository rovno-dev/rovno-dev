import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


# Default template body. Kept here (not in the migration) so both the model
# default and the migration's seed row reference the same string.
DEFAULT_ORDER_SUBJECT = "🎯 Новый заказ #{{short_id}}"

DEFAULT_ORDER_BODY = """🎯 **Новый заказ #{{short_id}}**

**👤 Клиент**
• Имя: {{name}}
• Телефон: {{phone}}
• Email: {{email}}
• Telegram: {{telegram}}

**💼 Проект**
• Услуги: {{services}}
• Бюджет: {{budget|не указан}}
• Срок: {{deadline|не указан}}
• Нейминг: {{naming_help|—}}
• Компания: {{company_name|—}}

**📝 Описание**
{{about|—}}

📎 Файлов: {{files_count}}"""


class NotificationSettings(Base):
    """Global notification config. Singleton row, always id=1.

    Written only by root (see api/v1/admin_notifications.py). The recipient
    list is a JSON array of user UUID strings; when empty/null every
    admin/root user is notified.
    """
    __tablename__ = "notification_settings"
    id = Column(Integer, primary_key=True, default=1)

    order_notify_email = Column(Boolean, default=True, nullable=False)
    order_notify_telegram = Column(Boolean, default=True, nullable=False)

    # JSON array of user UUID strings. Empty list → all admins/roots.
    # Kept for backward compatibility; the two channel-specific lists
    # below are what the service actually reads now.
    order_recipient_ids = Column(JSON, nullable=True, default=list)
    # Per-channel recipient overrides. Both fall back to
    # `order_recipient_ids`, and then to "all admins/roots" when empty.
    order_email_recipient_ids = Column(JSON, nullable=True, default=list)
    order_telegram_recipient_ids = Column(JSON, nullable=True, default=list)

    order_template_subject = Column(
        String(200), nullable=False, default=DEFAULT_ORDER_SUBJECT
    )
    order_template_body = Column(
        Text, nullable=False, default=DEFAULT_ORDER_BODY
    )

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserNotificationPreference(Base):
    """Per-user delivery preference + Telegram chat binding.

    A row is created lazily on first read/write from the /me/notifications
    endpoints, so existing users don't need a backfill.
    """
    __tablename__ = "user_notification_preferences"
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )

    email_enabled = Column(Boolean, default=True, nullable=False)
    telegram_enabled = Column(Boolean, default=True, nullable=False)

    # Opt-in for non-transactional content: discounts, promotions,
    # special offers. Default off — transactional messages (order
    # notifications, verify codes) are governed by the channel master
    # switches above and are not affected by this flag.
    marketing_enabled = Column(
        Boolean, default=False, nullable=False, server_default="false"
    )

    # Set when the user links this account via /start <code> in the bot.
    # Unset (NULL) means no active binding.
    telegram_chat_id = Column(String, nullable=True)
    telegram_username = Column(String, nullable=True)
    linked_at = Column(DateTime, nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

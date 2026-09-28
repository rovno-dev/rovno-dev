"""add notification settings + user notification preferences

Revision ID: f5d6e7f8a9b0
Revises: b5e0f1a2c3d4
Create Date: 2026-10-02 00:00:00

Two tables:
  - notification_settings (singleton, id=1): root-editable order
    notification config — channel toggles, recipient user-id list, and
    the message template (subject + markdown body).
  - user_notification_preferences (per user_id): per-user email/telegram
    toggles plus the linked Telegram chat_id.

The singleton is seeded with the default template so the admin page has
something to load on first visit.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = "f5d6e7f8a9b0"
down_revision: Union[str, None] = "b5e0f1a2c3d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_DEFAULT_SUBJECT = "Новый заказ #{{short_id}}"
_DEFAULT_BODY = """**Новый заказ**

ID: `{{order_id}}`
Создан: {{created_at}}

**Клиент**
Имя: {{name}}
Телефон: {{phone}}
Email: {{email}}
Telegram: {{telegram}}

**Проект**
Услуги: {{services}}
Бюджет: {{budget}}
Срок: {{deadline}}
Нейминг: {{naming_help}}
Компания: {{company_name}}

**Описание**
{{about}}

**Файлов:** {{files_count}}"""


def upgrade() -> None:
    op.create_table(
        "notification_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "order_notify_email",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "order_notify_telegram",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column("order_recipient_ids", sa.JSON(), nullable=True),
        sa.Column(
            "order_template_subject",
            sa.String(200),
            nullable=False,
            server_default=_DEFAULT_SUBJECT,
        ),
        sa.Column(
            "order_template_body",
            sa.Text(),
            nullable=False,
            server_default=_DEFAULT_BODY,
        ),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    # Seed the singleton. Explicit id=1; the app's get_or_create reads by id.
    conn = op.get_bind()
    conn.execute(
        sa.text(
            "INSERT INTO notification_settings "
            "(id, order_notify_email, order_notify_telegram, order_recipient_ids, "
            " order_template_subject, order_template_body, updated_at) "
            "VALUES (1, true, true, '[]'::json, :subj, :body, now()) "
            "ON CONFLICT (id) DO NOTHING"
        ),
        {"subj": _DEFAULT_SUBJECT, "body": _DEFAULT_BODY},
    )

    op.create_table(
        "user_notification_preferences",
        sa.Column("user_id", UUID(as_uuid=True), nullable=False),
        sa.Column(
            "email_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "telegram_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column("telegram_chat_id", sa.String(), nullable=True),
        sa.Column("telegram_username", sa.String(), nullable=True),
        sa.Column("linked_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("user_id"),
    )
    # Reverse lookup: given a chat_id (inbound bot message) find the user.
    op.create_index(
        "ix_user_notif_prefs_chat_id",
        "user_notification_preferences",
        ["telegram_chat_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_user_notif_prefs_chat_id",
        table_name="user_notification_preferences",
    )
    op.drop_table("user_notification_preferences")
    op.drop_table("notification_settings")

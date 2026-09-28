"""split notification recipients into separate email + telegram lists

Revision ID: c4d5e6f7a8b9
Revises: b3c4d5e6f7a8
Create Date: 2026-10-07 00:00:00

The single `order_recipient_ids` array on notification_settings drove BOTH
email and telegram delivery — root had no way to route them differently.
Adds two dedicated arrays and backfills each from the old one, so deploy
behaviour is unchanged until an admin edits the settings.

The old column is kept (rather than dropped) so rolling back the service
code without rolling back the schema still reads sensibly.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "c4d5e6f7a8b9"
down_revision: Union[str, None] = "b3c4d5e6f7a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "notification_settings",
        sa.Column("order_email_recipient_ids", sa.JSON(), nullable=True),
    )
    op.add_column(
        "notification_settings",
        sa.Column("order_telegram_recipient_ids", sa.JSON(), nullable=True),
    )
    # Backfill both new lists from the shared old list so nothing changes
    # on deploy. An empty old list stays empty (both new lists fall back
    # to "all admins/roots" when empty — same as before).
    op.execute("""
        UPDATE notification_settings
        SET order_email_recipient_ids    = COALESCE(order_recipient_ids, '[]'::json),
            order_telegram_recipient_ids = COALESCE(order_recipient_ids, '[]'::json)
        WHERE id = 1
    """)


def downgrade() -> None:
    op.drop_column("notification_settings", "order_telegram_recipient_ids")
    op.drop_column("notification_settings", "order_email_recipient_ids")

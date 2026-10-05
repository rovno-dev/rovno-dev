"""add marketing_enabled to user_notification_preferences

Revision ID: e6f7a8b9c0d1
Revises: c4d5e6f7a8b9
Create Date: 2026-10-08 00:00:00

The notifications preference table has always been scoped to order
alerts — master channel toggles plus the Telegram chat binding. This
adds a per-user opt-in for marketing content (discounts, promotions,
special offers). Default false because the standard for a
non-transactional message is explicit consent: a user who never
touches this row is opted out until they say otherwise.

Transactional categories (order confirmations, verify-email codes,
password resets) remain governed by the channel master switches and
are not affected by this flag.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "e6f7a8b9c0d1"
down_revision: Union[str, None] = "c4d5e6f7a8b9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Default false — opt-in semantics. Existing rows are unaffected
    # behaviourally (they were not receiving marketing before either).
    op.add_column(
        "user_notification_preferences",
        sa.Column(
            "marketing_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("user_notification_preferences", "marketing_enabled")

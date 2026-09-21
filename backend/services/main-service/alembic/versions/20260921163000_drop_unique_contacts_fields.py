"""drop unique constraints on contacts phone/email/telegram

Revision ID: d4f8a2c1b7e9
Revises: 2a71877d2db6
Create Date: 2026-09-21 16:30:00

The unique constraints added by 2a71877d2db6 were created without explicit names,
so PostgreSQL auto-generated them as <table>_<column>_key. Drop them so a single
contact can be reused across orders without a unique-violation failure.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "d4f8a2c1b7e9"
down_revision: Union[str, None] = "2a71877d2db6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("contacts_telegram_username_key", "contacts", type_="unique")
    op.drop_constraint("contacts_email_key", "contacts", type_="unique")
    op.drop_constraint("contacts_phone_key", "contacts", type_="unique")


def downgrade() -> None:
    op.create_unique_constraint("contacts_telegram_username_key", "contacts", ["telegram_username"])
    op.create_unique_constraint("contacts_email_key", "contacts", ["email"])
    op.create_unique_constraint("contacts_phone_key", "contacts", ["phone"])

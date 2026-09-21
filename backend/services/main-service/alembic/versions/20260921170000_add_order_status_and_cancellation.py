"""add status and cancellation_reason to order_requests

Revision ID: 8f2c1a9b3d0e
Revises: d4f8a2c1b7e9
Create Date: 2026-09-21 17:00:00
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "8f2c1a9b3d0e"
down_revision: Union[str, None] = "d4f8a2c1b7e9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    order_status = sa.Enum(
        "new", "negotiating", "work", "done", "canceled",
        name="order_status",
    )
    order_status.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "order_requests",
        sa.Column("status", order_status, nullable=False, server_default="new"),
    )
    op.add_column(
        "order_requests",
        sa.Column("cancellation_reason", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("order_requests", "cancellation_reason")
    op.drop_column("order_requests", "status")
    sa.Enum(name="order_status").drop(op.get_bind(), checkfirst=True)

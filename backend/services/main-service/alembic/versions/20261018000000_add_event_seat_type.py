"""add seat_type to events
Revision ID: h4d5e6f7a8b9
Revises: f9c4d5e6a7b8
Create Date: 2026-10-18 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
revision: str = "h4d5e6f7a8b9"
down_revision: Union[str, None] = "e6f7a8b9c0d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
def upgrade() -> None:
    op.add_column("events", sa.Column("seat_type", sa.String(), nullable=True, server_default="мест"))
def downgrade() -> None:
    op.drop_column("events", "seat_type")

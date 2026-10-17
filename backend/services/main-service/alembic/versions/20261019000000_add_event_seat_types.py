"""add seat_types json array to events
Revision ID: g5e6f7a8b9c0
Revises: h4d5e6f7a8b9
Create Date: 2026-10-19 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
revision: str = "g5e6f7a8b9c0"
down_revision: Union[str, None] = "h4d5e6f7a8b9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
def upgrade() -> None:
    op.add_column("events", sa.Column("seat_types", sa.JSON(), nullable=True, server_default='[]'))
    op.drop_column("events", "capacity")
    op.drop_column("events", "seat_type")
def downgrade() -> None:
    op.add_column("events", sa.Column("seat_type", sa.String(), nullable=True, server_default="мест"))
    op.add_column("events", sa.Column("capacity", sa.Integer(), nullable=True))
    op.drop_column("events", "seat_types")

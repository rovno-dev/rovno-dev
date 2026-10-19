"""add can_create_articles to users
Revision ID: g6f7a8b9c0d1
Revises: g5e6f7a8b9c0
Create Date: 2026-10-20 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "g6f7a8b9c0d1"
down_revision: Union[str, None] = "g5e6f7a8b9c0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column("users", sa.Column("can_create_articles", sa.Boolean(), nullable=False, server_default="false"))

def downgrade() -> None:
    op.drop_column("users", "can_create_articles")

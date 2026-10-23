"""add theme to presentation_slides
Revision ID: k0j1a2b3c4d5
Revises: j9i0a1b2c3d4
Create Date: 2026-10-24 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "k0j1a2b3c4d5"
down_revision: Union[str, None] = "j9i0a1b2c3d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column("presentation_slides", sa.Column("theme", sa.JSON(), nullable=True))

def downgrade() -> None:
    op.drop_column("presentation_slides", "theme")

"""add custom_tsx to presentations
Revision ID: l1k2j3a4b5c6
Revises: k0j1a2b3c4d5
Create Date: 2026-10-25 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "l1k2j3a4b5c6"
down_revision: Union[str, None] = "k0j1a2b3c4d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column("presentations", sa.Column("custom_tsx", sa.Text(), nullable=True))

def downgrade() -> None:
    op.drop_column("presentations", "custom_tsx")

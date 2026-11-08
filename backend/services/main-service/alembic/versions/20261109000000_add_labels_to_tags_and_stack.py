"""add labels to tags and stack items
Revision ID: q1w2e3r4t5y6
Revises: p4q5r6s7t8u9
Create Date: 2026-11-09 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "q1w2e3r4t5y6"
down_revision: Union[str, None] = "p4q5r6s7t8u9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column("tags", sa.Column("labels", sa.JSON(), nullable=True))
    op.add_column("stack_items", sa.Column("labels", sa.JSON(), nullable=True))

    # Backfill existing rows with {"en": name}
    op.execute("UPDATE tags SET labels = json_build_object('en', name) WHERE labels IS NULL")
    op.execute("UPDATE stack_items SET labels = json_build_object('en', name) WHERE labels IS NULL")

def downgrade() -> None:
    op.drop_column("stack_items", "labels")
    op.drop_column("tags", "labels")

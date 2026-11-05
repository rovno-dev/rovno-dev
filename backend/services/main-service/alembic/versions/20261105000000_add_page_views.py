"""add page_views counter table
Revision ID: p4q5r6s7t8u9
Revises: n3o4p5q6r7s8
Create Date: 2026-11-05 00:00:00

One row per (entity_type, entity_id). Read + incremented by
/api/v1/views/*. Kept as its own table instead of a `views` column on
projects/articles/events so the same counter works for any future entity
without another ALTER, and so a hot counter row never touches the
entity's own row (avoids write amplification on content tables).
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "p4q5r6s7t8u9"
down_revision: Union[str, None] = "n3o4p5q6r7s8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "page_views",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("entity_type", sa.String(20), nullable=False),
        sa.Column("entity_id", sa.String(120), nullable=False),
        sa.Column("view_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "entity_type", "entity_id", name="page_views_entity_key"
        ),
    )
    op.create_index(
        "ix_page_views_entity", "page_views", ["entity_type", "entity_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_page_views_entity", table_name="page_views")
    op.drop_table("page_views")

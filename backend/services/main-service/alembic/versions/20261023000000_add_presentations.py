"""add presentations tables
Revision ID: j9i0a1b2c3d4
Revises: i8h9a0b1c2d3
Create Date: 2026-10-23 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "j9i0a1b2c3d4"
down_revision: Union[str, None] = "i8h9a0b1c2d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "presentations",
        sa.Column("id", sa.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("event_id", sa.String(), nullable=True),
        sa.Column("starts_at", sa.DateTime(), nullable=True),
        sa.Column("ends_at", sa.DateTime(), nullable=True),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_presentations_slug"), "presentations", ["slug"], unique=True)

    op.create_table(
        "presentation_slides",
        sa.Column("id", sa.UUID(as_uuid=True), nullable=False),
        sa.Column("presentation_id", sa.UUID(as_uuid=True), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("content", sa.JSON(), nullable=False),
        sa.Column("notes", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["presentation_id"], ["presentations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_presentation_slides_presentation_id"), "presentation_slides", ["presentation_id"], unique=False)

def downgrade() -> None:
    op.drop_index(op.f("ix_presentation_slides_presentation_id"), table_name="presentation_slides")
    op.drop_table("presentation_slides")
    op.drop_index(op.f("ix_presentations_slug"), table_name="presentations")
    op.drop_table("presentations")

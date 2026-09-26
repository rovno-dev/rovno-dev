"""events + event_requests tables

Revision ID: f9c4d5e6a7b8
Revises: e8b3c4d5f6a7
Create Date: 2026-10-05 00:00:00

Two tables:
  events          — like projects, but event-specific fields (start_at,
                    location, price, registration_url, capacity).
  event_requests  — registrations submitted through an event landing page.
                    Core identity fields are columns; anything else lives
                    in a `meta` JSON blob (pattern mirrors Twenty CRM's
                    custom-field approach — the schema doesn't need to grow
                    every time a form adds a field).
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "f9c4d5e6a7b8"
down_revision: Union[str, None] = "e8b3c4d5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "events",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("short_description", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("cover_image_src", sa.String(), nullable=False, server_default=""),
        sa.Column("cover_video_src", sa.String(), nullable=True),
        sa.Column("start_at", sa.DateTime(), nullable=True),
        sa.Column("end_at", sa.DateTime(), nullable=True),
        sa.Column("location_name", sa.String(), nullable=True),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("metro", sa.String(), nullable=True),
        sa.Column("city", sa.String(), nullable=True, server_default="Москва"),
        sa.Column("price", sa.String(), nullable=True),
        sa.Column("registration_url", sa.String(), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("custom_page", sa.String(60), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("publication_status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("mdx_content", sa.Text(), nullable=True),
        sa.Column("seo_title", sa.String(), nullable=True),
        sa.Column("meta_description", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_unique_constraint("events_slug_key", "events", ["slug"])
    op.create_index("ix_events_slug", "events", ["slug"])
    op.create_index("ix_events_start_at", "events", ["start_at"])

    # Event ↔ tags (reuse the tags table, new join).
    op.create_table(
        "event_tags",
        sa.Column("event_id", sa.String(), nullable=False),
        sa.Column("tag_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("event_id", "tag_id"),
    )

    # Registrations.
    op.create_table(
        "event_requests",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("surname", sa.String(), nullable=True),
        sa.Column("patronymic", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("telegram_username", sa.String(), nullable=True),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="new"),
        sa.Column("decline_reason", sa.String(), nullable=True),
        sa.Column("meta", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_event_requests_event_id", "event_requests", ["event_id"])
    op.create_index("ix_event_requests_status", "event_requests", ["status"])
    op.create_index("ix_event_requests_created_at", "event_requests", ["created_at"])


def downgrade() -> None:
    op.drop_table("event_requests")
    op.drop_table("event_tags")
    op.drop_table("events")

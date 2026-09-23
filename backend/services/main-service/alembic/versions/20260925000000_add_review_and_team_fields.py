"""add article review workflow + team member profile fields

Revision ID: c9e4f5a6b7d8
Revises: b8d3e4f5a6c7
Create Date: 2026-09-25 00:00:00

1. Article review workflow
   - Adds 'pending_review' to the publication_status enum
   - Adds review_note / reviewed_by_id / reviewed_at to articles
2. Profile fields
   - users.bio (VARCHAR(64))  — short bio for author bylines
   - team_members.bio (TEXT) — long professional bio for the expert page
   - team_members.cover_url (VARCHAR) — 21:8 banner for the expert hero
   - team_members.is_active — soft-remove without losing historical attribution
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "c9e4f5a6b7d8"
down_revision: Union[str, None] = "b8d3e4f5a6c7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- 1. Review workflow ---
    # Postgres 12+ allows ADD VALUE inside a transaction; the new value just
    # cannot be USED in the same transaction. Alembic commits between each
    # DDL statement, so this is safe.
    op.execute("ALTER TYPE publication_status ADD VALUE IF NOT EXISTS 'pending_review'")

    op.add_column("articles", sa.Column("review_note", sa.Text(), nullable=True))
    op.add_column(
        "articles",
        sa.Column("reviewed_by_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column("articles", sa.Column("reviewed_at", sa.DateTime(), nullable=True))
    op.create_foreign_key(
        "articles_reviewed_by_id_fkey",
        "articles",
        "users",
        ["reviewed_by_id"],
        ["id"],
    )

    # --- 2. Profile fields ---
    op.add_column("users", sa.Column("bio", sa.String(64), nullable=True))

    op.add_column("team_members", sa.Column("bio", sa.Text(), nullable=True))
    op.add_column("team_members", sa.Column("cover_url", sa.String(), nullable=True))
    op.add_column(
        "team_members",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
    )


def downgrade() -> None:
    op.drop_column("team_members", "is_active")
    op.drop_column("team_members", "cover_url")
    op.drop_column("team_members", "bio")
    op.drop_column("users", "bio")

    op.drop_constraint("articles_reviewed_by_id_fkey", "articles", type_="foreignkey")
    op.drop_column("articles", "reviewed_at")
    op.drop_column("articles", "reviewed_by_id")
    op.drop_column("articles", "review_note")
    # Cannot remove an enum value in Postgres without recreating the type;
    # leaving 'pending_review' in the enum on downgrade is harmless.

"""add content_json to articles, projects, events

Revision ID: n3o4p5q6r7s8
Revises: m2n3o4p5q6r7
Create Date: 2026-10-27 00:00:00

Stores the Tiptap / Novel JSON document that replaces `mdx_content`.
`mdx_content` is kept as a legacy fallback for rows authored before the
switch and is no longer written by the editor.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "n3o4p5q6r7s8"
down_revision: Union[str, None] = "m2n3o4p5q6r7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("articles", sa.Column("content_json", sa.JSON(), nullable=True))
    op.add_column("projects", sa.Column("content_json", sa.JSON(), nullable=True))
    op.add_column("events", sa.Column("content_json", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("events", "content_json")
    op.drop_column("projects", "content_json")
    op.drop_column("articles", "content_json")

"""add custom_page to projects

Revision ID: d7a2b3c4e5f6
Revises: c6f1a2b3d4e5
Create Date: 2026-10-03 00:00:00

A nullable `custom_page` string that names which bespoke case-study renderer
to use for a project. The value is a free-form key (e.g. "alx", "bread");
the frontend owns the list of valid keys in `custom-pages-meta.ts` and
routes on it in `[slug]/page.tsx`. Null means "use the shared layout".

Stored as a plain string rather than an enum because the registry is code-
defined on the frontend — adding a new bespoke page shouldn't require a
migration.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "d7a2b3c4e5f6"
down_revision: Union[str, None] = "c6f1a2b3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "projects",
        sa.Column("custom_page", sa.String(60), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("projects", "custom_page")

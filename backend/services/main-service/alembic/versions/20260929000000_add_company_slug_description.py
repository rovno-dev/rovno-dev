"""add slug + description to companies

Revision ID: f3c8d9e0a1b2
Revises: f2b7c8d9e0a1
Create Date: 2026-09-29 00:00:00

- `slug` — URL-safe identifier for the public /clients/<slug> profile page.
  Backfilled from existing name via the shared transliterating slugify.
- `description` — short blurb rendered on the profile page header.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.shared.slugify import slugify


revision: str = "f3c8d9e0a1b2"
down_revision: Union[str, None] = "f2b7c8d9e0a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("companies", sa.Column("slug", sa.String(), nullable=True))
    op.add_column("companies", sa.Column("description", sa.Text(), nullable=True))

    conn = op.get_bind()
    rows = conn.execute(sa.text("SELECT id, name FROM companies")).fetchall()
    used: set[str] = set()
    for row_id, name in rows:
        base = slugify(name or "", max_len=60, fallback="client")
        slug, n = base, 2
        while slug in used:
            slug = f"{base}-{n}"
            n += 1
        used.add(slug)
        conn.execute(
            sa.text("UPDATE companies SET slug = :s WHERE id = :i"),
            {"s": slug, "i": row_id},
        )

    op.alter_column("companies", "slug", nullable=False)
    op.create_unique_constraint("companies_slug_key", "companies", ["slug"])
    op.create_index("ix_companies_slug", "companies", ["slug"])


def downgrade() -> None:
    op.drop_index("ix_companies_slug", table_name="companies")
    op.drop_constraint("companies_slug_key", "companies", type_="unique")
    op.drop_column("companies", "description")
    op.drop_column("companies", "slug")

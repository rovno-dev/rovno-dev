"""backfill any companies left with a NULL slug

Revision ID: a1b2c3d4e5f6
Revises: f5d6e7f8a9b0
Create Date: 2026-10-03 00:00:00

Defensive backfill. Before 20260929000000 added `slug NOT NULL`, the
orders.create_order path created companies with only a name — no slug.
That path was fixed in the same commit that added notifications, but any
row that slipped through while a container was running pre-fix code will
still have NULL. Rewrites those names through the shared transliterator.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.shared.slugify import slugify


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "f5d6e7f8a9b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    rows = conn.execute(
        sa.text("SELECT id, name FROM companies WHERE slug IS NULL OR slug = ''")
    ).fetchall()
    if not rows:
        return

    used: set[str] = {
        r[0] for r in conn.execute(
            sa.text("SELECT slug FROM companies WHERE slug IS NOT NULL AND slug <> ''")
        ).fetchall()
    }
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
    print(f"[backfill_null_company_slugs] rewrote {len(rows)} row(s)")


def downgrade() -> None:
    # Not reversible — the original NULLs were never meaningful.
    pass

"""rewrite any non-ASCII slugs on projects, articles, tags

Revision ID: f2b7c8d9e0a1
Revises: e1a6b7c8d9f0
Create Date: 2026-09-28 00:00:00

Before the shared slugify was wired in, each endpoint had its own
implementation that used `\\w` with re.UNICODE — which keeps Cyrillic
letters. Rows created through those paths ended up with slugs like "хуй".
That makes URLs fragile: they get percent-encoded, cached differently by
each layer, and case sensitivity becomes a landmine.

This migration rewrites every non-ASCII slug through the shared slugify,
handling collisions by appending -2, -3, … as needed.

Safe to run multiple times: the WHERE clause only matches rows whose slug
contains a non-[a-z0-9-] character, so already-clean rows are skipped.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.shared.slugify import slugify


revision: str = "f2b7c8d9e0a1"
down_revision: Union[str, None] = "e1a6b7c8d9f0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Matches any slug that isn't pure a-z, 0-9, hyphen.
_NON_ASCII_SLUG = "slug !~ '^[a-z0-9-]+$'"


def _rewrite_table(conn, table: str, id_col: str = "id", max_len: int = 80) -> int:
    """Rewrite every non-ASCII slug in `table`. Returns rows changed."""
    rows = conn.execute(
        sa.text(f"SELECT {id_col}, slug FROM {table} WHERE {_NON_ASCII_SLUG}")
    ).fetchall()

    changed = 0
    for row_id, old_slug in rows:
        base = slugify(old_slug, max_len=max_len, fallback="item")
        candidate = base
        suffix = 2
        # Resolve collisions against rows we haven't touched yet.
        while conn.execute(
            sa.text(
                f"SELECT 1 FROM {table} "
                f"WHERE slug = :s AND {id_col} <> :i"
            ),
            {"s": candidate, "i": row_id},
        ).first():
            candidate = f"{base}-{suffix}"
            suffix += 1

        conn.execute(
            sa.text(f"UPDATE {table} SET slug = :s WHERE {id_col} = :i"),
            {"s": candidate, "i": row_id},
        )
        changed += 1
    return changed


def upgrade() -> None:
    conn = op.get_bind()
    total = 0
    total += _rewrite_table(conn, "projects",   max_len=80)
    total += _rewrite_table(conn, "articles",   max_len=80)
    total += _rewrite_table(conn, "tags",       max_len=60)
    print(f"[transliterate_slugs] rewrote {total} slug(s) across projects/articles/tags")


def downgrade() -> None:
    # Slug rewrite is not reversible — the original Cyrillic strings are
    # gone. Leaving this as a no-op is intentional: rolling back the schema
    # is fine, but we don't want to resurrect broken URLs.
    pass

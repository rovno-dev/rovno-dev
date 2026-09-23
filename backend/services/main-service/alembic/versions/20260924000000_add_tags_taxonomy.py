"""add tags taxonomy: table + article_tags + backfill + drop articles.tags
Revision ID: b8d3e4f5a6c7
Revises: a7c2f1b8d5e4
Create Date: 2026-09-24 00:00:00

Replaces the free-form `articles.tags` JSON array and the barely-used
`article_categories` FK with a proper many-to-many `tags` taxonomy.

- `tags` (id, name, slug, created_at) with case-insensitive unique name.
- `article_tags` join table.
- Backfill: parse every article's JSON tags array, upsert into `tags`,
  insert associations.
- Drop `articles.tags`. `article_categories` and `articles.category_id`
  are left in place (unused by the API) — dropping those is a separate,
  riskier migration.
"""
import json
import re
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "b8d3e4f5a6c7"
down_revision: Union[str, None] = "a7c2f1b8d5e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_SLUG_RE = re.compile(r"[^\w\s-]+", re.UNICODE)
_SLUG_WS = re.compile(r"[\s_]+", re.UNICODE)


def _slugify(text: str) -> str:
    text = text.strip().lower()
    text = _SLUG_RE.sub("", text)
    text = _SLUG_WS.sub("-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:60] or "tag"


def upgrade() -> None:
    # --- Tables ---------------------------------------------------------
    op.create_table(
        "tags",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    # Raw SQL for both indexes so alembic doesn't try to auto-name them and
    # so we can express `lower(name)` — a functional unique index.
    op.execute("CREATE UNIQUE INDEX ix_tags_slug ON tags (slug)")
    op.execute("CREATE UNIQUE INDEX ix_tags_name_lower ON tags (lower(name))")

    op.create_table(
        "article_tags",
        sa.Column("article_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["article_id"], ["articles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("article_id", "tag_id"),
    )

    # --- Backfill -------------------------------------------------------
    conn = op.get_bind()
    rows = conn.execute(sa.text("SELECT id, tags FROM articles")).fetchall()
    # Cache lower(name) -> tag UUID within this run so we don't re-query.
    tag_ids: dict[str, uuid.UUID] = {}

    for article_id, tags_json in rows:
        if not tags_json:
            continue
        if isinstance(tags_json, str):
            try:
                names = json.loads(tags_json)
            except Exception:
                continue
        else:
            names = tags_json
        if not isinstance(names, list):
            continue

        for raw in names:
            name = str(raw).strip() if raw else ""
            if not name:
                continue
            key = name.lower()
            tid = tag_ids.get(key)
            if tid is None:
                existing = conn.execute(
                    sa.text("SELECT id FROM tags WHERE lower(name) = :n"),
                    {"n": key},
                ).scalar()
                if existing:
                    tid = existing
                else:
                    tid = uuid.uuid4()
                    slug = _slugify(name)
                    base, n = slug, 2
                    while conn.execute(
                        sa.text("SELECT 1 FROM tags WHERE slug = :s"), {"s": slug}
                    ).first():
                        slug = f"{base}-{n}"
                        n += 1
                    conn.execute(
                        sa.text(
                            "INSERT INTO tags (id, name, slug, created_at) "
                            "VALUES (:id, :n, :s, now())"
                        ),
                        {"id": tid, "n": name, "s": slug},
                    )
                tag_ids[key] = tid

            conn.execute(
                sa.text(
                    "INSERT INTO article_tags (article_id, tag_id) "
                    "VALUES (:a, :t) ON CONFLICT DO NOTHING"
                ),
                {"a": article_id, "t": tid},
            )

    op.drop_column("articles", "tags")


def downgrade() -> None:
    # Re-add the JSON column and round-trip the data back. Casing is
    # preserved on the round-trip because we join through `tags.name`.
    op.add_column("articles", sa.Column("tags", sa.JSON(), nullable=True))

    conn = op.get_bind()
    rows = conn.execute(
        sa.text(
            "SELECT at.article_id, t.name "
            "FROM article_tags at JOIN tags t ON t.id = at.tag_id "
            "ORDER BY at.article_id, t.name"
        )
    ).fetchall()

    by_article: dict[uuid.UUID, list[str]] = {}
    for article_id, name in rows:
        by_article.setdefault(article_id, []).append(name)

    for article_id, names in by_article.items():
        conn.execute(
            sa.text("UPDATE articles SET tags = CAST(:j AS JSON) WHERE id = :id"),
            {"j": json.dumps(names), "id": article_id},
        )

    op.drop_table("article_tags")
    op.drop_index("ix_tags_name_lower", table_name="tags")
    op.drop_index("ix_tags_slug", table_name="tags")
    op.drop_table("tags")

"""add kind to tags; migrate article_categories into tags(kind='category')

Revision ID: e1a6b7c8d9f0
Revises: d0f5a6b7c8e9
Create Date: 2026-09-27 00:00:00

- Adds a `kind` column to `tags` (tag | category | brand).
- Replaces the global lower(name) uniqueness with per-kind uniqueness, so
  "Design" can exist as a category AND as a tag without colliding.
- Backfills every `article_categories` row into `tags` with kind='category',
  and creates article_tags associations for every article that pointed at
  one. `article_categories` and `articles.category_id` are left in place —
  they're ignored by the API now, dropping them is a separate migration.
- Also adds `attachments` JSON to `articles` for the media gallery.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "e1a6b7c8d9f0"
down_revision: Union[str, None] = "d0f5a6b7c8e9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- 1. kind column --------------------------------------------------
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tag_kind') THEN
                CREATE TYPE tag_kind AS ENUM ('tag', 'category', 'brand');
            END IF;
        END $$;
    """)
    op.execute("""
        ALTER TABLE tags
        ADD COLUMN IF NOT EXISTS kind tag_kind NOT NULL DEFAULT 'tag';
    """)

    # Drop the global uniqueness; replace with per-kind.
    op.execute("DROP INDEX IF EXISTS ix_tags_name_lower;")
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS ix_tags_kind_name_lower
        ON tags (kind, lower(name));
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_tags_kind ON tags (kind);")

    # --- 2. Migrate article_categories → tags(kind=category) -------------
    op.execute("""
        INSERT INTO tags (id, name, slug, kind, created_at)
        SELECT id, label, code, 'category', now()
        FROM article_categories
        ON CONFLICT DO NOTHING;
    """)
    op.execute("""
        INSERT INTO article_tags (article_id, tag_id)
        SELECT a.id, a.category_id
        FROM articles a
        WHERE a.category_id IS NOT NULL
        ON CONFLICT DO NOTHING;
    """)

    # --- 3. Article attachments ------------------------------------------
    op.add_column("articles", sa.Column("attachments", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("articles", "attachments")
    op.execute("DROP INDEX IF EXISTS ix_tags_kind;")
    op.execute("DROP INDEX IF EXISTS ix_tags_kind_name_lower;")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_tags_name_lower ON tags (lower(name));")
    op.execute("ALTER TABLE tags DROP COLUMN IF EXISTS kind;")
    op.execute("DROP TYPE IF EXISTS tag_kind;")

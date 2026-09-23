"""add raw_json and repoint article author to users
Revision ID: a7c2f1b8d5e4
Revises: 8f2c1a9b3d0e
Create Date: 2026-09-23 12:00:00

LLM context:
- articles.raw_json: optional JSON blob pasted from an AI tool, stored verbatim.
- articles.author_id: was FK -> team_members.id. Blog authors are now Users
  (they register via /register/email). The table has no production rows (the
  blog was served from hardcoded frontend data), so a straight constraint swap
  is safe. Postgres auto-names the original constraint articles_author_id_fkey.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
revision: str = "a7c2f1b8d5e4"
down_revision: Union[str, None] = "8f2c1a9b3d0e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None
def upgrade() -> None:
    op.add_column("articles", sa.Column("raw_json", sa.JSON(), nullable=True))
    # Repoint the FK. Use a defensive drop so a differently-named constraint
    # (older Postgres, manual creation) doesn't break the migration.
    op.execute("""
        DO $$
        DECLARE cname text;
        BEGIN
            SELECT conname INTO cname
            FROM pg_constraint
            WHERE conrelid = 'articles'::regclass
              AND contype = 'f'
              AND conkey = ARRAY[
                  (SELECT attnum FROM pg_attribute
                   WHERE attrelid = 'articles'::regclass AND attname = 'author_id')
              ];
            IF cname IS NOT NULL THEN
                EXECUTE 'ALTER TABLE articles DROP CONSTRAINT ' || quote_ident(cname);
            END IF;
        END $$;
    """)
    op.create_foreign_key("articles_author_id_fkey", "articles", "users", ["author_id"], ["id"])
def downgrade() -> None:
    op.drop_constraint("articles_author_id_fkey", "articles", type_="foreignkey")
    op.create_foreign_key("articles_author_id_fkey", "articles", "team_members", ["author_id"], ["id"])
    op.drop_column("articles", "raw_json")

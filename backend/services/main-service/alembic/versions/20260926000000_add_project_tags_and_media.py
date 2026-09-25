"""add project_tags + project_media tables

Revision ID: d0f5a6b7c8e9
Revises: c9e4f5a6b7d8
Create Date: 2026-09-26 00:00:00

Adds two per-project structures:
  - project_tags: heterogeneous badges with a `kind` discriminator.
  - project_media: ordered gallery of images/videos.

Every CREATE is guarded (DO block for types, IF NOT EXISTS for tables and
indexes) so a partially-applied prior attempt can be safely re-run without
the container wedging itself in a restart loop.
"""
from typing import Sequence, Union
from alembic import op

revision: str = "d0f5a6b7c8e9"
down_revision: Union[str, None] = "c9e4f5a6b7d8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Enum types ------------------------------------------------------
    # Postgres has no CREATE TYPE IF NOT EXISTS. Wrap in a DO block that
    # consults pg_type first.
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_tag_kind') THEN
                CREATE TYPE project_tag_kind AS ENUM ('from_chief', 'license', 'github', 'custom');
            END IF;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_media_type') THEN
                CREATE TYPE project_media_type AS ENUM ('image', 'video');
            END IF;
        END $$;
    """)

    # --- Tables ----------------------------------------------------------
    op.execute("""
        CREATE TABLE IF NOT EXISTS project_tags (
            id uuid NOT NULL,
            project_id varchar NOT NULL,
            kind project_tag_kind NOT NULL,
            label varchar NOT NULL,
            value json,
            sort_order integer NOT NULL DEFAULT 0,
            PRIMARY KEY (id),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
    """)
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_project_tags_project_id ON project_tags (project_id);"
    )

    op.execute("""
        CREATE TABLE IF NOT EXISTS project_media (
            id uuid NOT NULL,
            project_id varchar NOT NULL,
            type project_media_type NOT NULL,
            url varchar NOT NULL,
            thumbnail_url varchar,
            caption varchar,
            sort_order integer NOT NULL DEFAULT 0,
            created_at timestamp,
            PRIMARY KEY (id),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
    """)
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_project_media_project_id ON project_media (project_id);"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_project_media_project_id;")
    op.execute("DROP TABLE IF EXISTS project_media;")
    op.execute("DROP INDEX IF EXISTS ix_project_tags_project_id;")
    op.execute("DROP TABLE IF EXISTS project_tags;")
    op.execute("DROP TYPE IF EXISTS project_media_type;")
    op.execute("DROP TYPE IF EXISTS project_tag_kind;")

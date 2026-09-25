"""add avatar_url and status to clients

Revision ID: c6f1a2b3d4e5
Revises: b5e0f1a2c3d4
Create Date: 2026-10-02 00:00:00

Two additive columns on the `clients` table:

  - `avatar_url` — optional image for the admin clients list.
  - `status`     — enum describing how the client entered the system.
      from_order  auto-created the first time someone submits an order.
      manual      added by an admin.
      partner     admin-marked partner.

server_default='manual' so any pre-existing row is classified correctly
without a data backfill.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "c6f1a2b3d4e5"
down_revision: Union[str, None] = "b5e0f1a2c3d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Guard the type creation so a partially-applied prior attempt can be
    # safely re-run — Postgres has no CREATE TYPE IF NOT EXISTS.
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_status') THEN
                CREATE TYPE client_status AS ENUM ('from_order', 'manual', 'partner');
            END IF;
        END $$;
    """)

    # Column adds are idempotent via IF NOT EXISTS.
    op.execute("""
        ALTER TABLE clients
        ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;
    """)
    op.execute("""
        ALTER TABLE clients
        ADD COLUMN IF NOT EXISTS status client_status NOT NULL DEFAULT 'manual';
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE clients DROP COLUMN IF EXISTS status;")
    op.execute("ALTER TABLE clients DROP COLUMN IF EXISTS avatar_url;")
    op.execute("DROP TYPE IF EXISTS client_status;")

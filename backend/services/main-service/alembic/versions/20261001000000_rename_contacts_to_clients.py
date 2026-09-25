"""rename contacts -> clients, order_requests.contact_id -> client_id

Revision ID: b5e0f1a2c3d4
Revises: a4d9e0f1b2c3
Create Date: 2026-10-01 00:00:00

The `contacts` table has always held the people who submit orders — i.e. the
agency's clients. `companies` holds the organizations we build projects for.
The names were swapped in the UI. This migration aligns the database with the
actual meaning, so nothing downstream has to guess.

NOTE: existing indexes on the renamed table keep their old names (e.g.
ix_contacts_phone). That's cosmetic — Postgres resolves them by OID, not
name, and the app never references indexes by name. Renaming them would
require a fragile PL/pgSQL loop and buys nothing.
"""
from typing import Sequence, Union
from alembic import op


revision: str = "b5e0f1a2c3d4"
down_revision: Union[str, None] = "a4d9e0f1b2c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Table rename. Postgres preserves the PK, FKs, indexes, and constraints
    # — only their names change.
    op.execute("ALTER TABLE contacts RENAME TO clients")

    # FK column rename on the dependent table. The constraint keeps its
    # auto-generated name (order_requests_contact_id_fkey); the ORM doesn't
    # care what the constraint is called.
    op.execute("ALTER TABLE order_requests RENAME COLUMN contact_id TO client_id")


def downgrade() -> None:
    op.execute("ALTER TABLE order_requests RENAME COLUMN client_id TO contact_id")
    op.execute("ALTER TABLE clients RENAME TO contacts")

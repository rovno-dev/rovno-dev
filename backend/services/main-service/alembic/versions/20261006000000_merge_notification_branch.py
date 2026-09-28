"""merge notification backfill branch back into main chain

Revision ID: b3c4d5e6f7a8
Revises: a1b2c3d4e5f6, 65d03b7c1703
Create Date: 2026-10-06

Two heads existed in the graph:

  1. a1b2c3d4e5f6 (backfill_null_company_slugs) — child of f5d6e7f8a9b0.
  2. 65d03b7c1703 (merge_notification_settings_into_main) — declared parents
     (f5d6e7f8a9b0, f9c4d5e6a7b8). But f5d6e7f8a9b0 was no longer a head
     because a1b2c3d4e5f6 branched off it afterwards — so 65d03b7c1703 was
     only merging half of the divergence.

This no-op revision joins the two remaining heads, giving `alembic upgrade
head` a single target. Nothing to apply — the DDL is already on both sides.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b3c4d5e6f7a8"
down_revision: Union[str, Sequence[str], None] = ("a1b2c3d4e5f6", "65d03b7c1703")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Both branches already applied their own schema changes. A merge
    # revision only rewires the graph.
    pass


def downgrade() -> None:
    # Splitting a merge is a no-op — the two heads it joined still exist
    # in the version table.
    pass

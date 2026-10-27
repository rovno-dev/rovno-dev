"""add expert fields to team_members

Revision ID: m2n3o4p5q6r7
Revises: l1k2j3a4b5c6
Create Date: 2026-10-26 00:00:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "m2n3o4p5q6r7"
down_revision: Union[str, None] = "l1k2j3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS location VARCHAR")
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS expert_tags JSON")
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS expert_socials JSON")
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS expert_stats JSON")
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS expert_skills JSON")
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS expert_milestones JSON")

def downgrade() -> None:
    pass

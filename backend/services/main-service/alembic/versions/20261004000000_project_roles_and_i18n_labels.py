"""project_roles table + labels JSON on project_categories

Revision ID: e8b3c4d5f6a7
Revises: d7a2b3c4e5f6
Create Date: 2026-10-04 00:00:00

Introduces a managed taxonomy for the "role on project" field, parallel to
the existing project_categories. Both now carry a `labels` JSON so an admin
can supply per-language display strings ("en" is required, others optional).

- project_categories.labels  — backfilled from the existing `label` column,
  which is kept for backwards compat and treated as `labels['en']`.
- project_roles              — new, same shape.
- project_team_assignments.role_id  — nullable FK to project_roles. The old
  string column `role_on_project` is retained so rows pinned before this
  migration keep working; new assignments prefer role_id.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "e8b3c4d5f6a7"
down_revision: Union[str, None] = "d7a2b3c4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- project_categories.labels --------------------------------------
    op.add_column("project_categories", sa.Column("labels", sa.JSON(), nullable=True))
    # Backfill from the legacy single-language `label` column.
    op.execute("""
        UPDATE project_categories
        SET labels = json_build_object('en', label)
        WHERE labels IS NULL AND label IS NOT NULL;
    """)

    # --- project_roles --------------------------------------------------
    op.create_table(
        "project_roles",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(60), nullable=False),
        sa.Column("labels", sa.JSON(), nullable=False, server_default=sa.text("'{\"en\": \"\"}'::json")),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute("CREATE UNIQUE INDEX ix_project_roles_code ON project_roles (code)")

    # --- project_team_assignments.role_id -------------------------------
    op.add_column(
        "project_team_assignments",
        sa.Column("role_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "project_team_assignments_role_id_fkey",
        "project_team_assignments",
        "project_roles",
        ["role_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        "ix_project_team_assignments_role_id",
        "project_team_assignments",
        ["role_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_project_team_assignments_role_id", table_name="project_team_assignments")
    op.drop_constraint(
        "project_team_assignments_role_id_fkey",
        "project_team_assignments",
        type_="foreignkey",
    )
    op.drop_column("project_team_assignments", "role_id")
    op.drop_index("ix_project_roles_code", table_name="project_roles")
    op.drop_table("project_roles")
    op.drop_column("project_categories", "labels")

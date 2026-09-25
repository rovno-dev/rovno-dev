"""stack_items table + project_stack_items join

Revision ID: a4d9e0f1b2c3
Revises: f3c8d9e0a1b2
Create Date: 2026-09-30 00:00:00

Replaces the freeform `projects.tech_stack` JSON array with a proper
relational stack. Backfills every distinct string from the JSON arrays into
`stack_items`, then populates `project_stack_items`.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.shared.slugify import slugify


revision: str = "a4d9e0f1b2c3"
down_revision: Union[str, None] = "f3c8d9e0a1b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "stack_items",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(60), nullable=False),
        sa.Column("slug", sa.String(60), nullable=False),
        sa.Column("icon_url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.execute("CREATE UNIQUE INDEX ix_stack_items_slug ON stack_items (slug)")
    op.execute("CREATE UNIQUE INDEX ix_stack_items_name_lower ON stack_items (lower(name))")

    op.create_table(
        "project_stack_items",
        sa.Column("project_id", sa.String(), nullable=False),
        sa.Column("stack_item_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["stack_item_id"], ["stack_items.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("project_id", "stack_item_id"),
    )

    # Backfill from the old JSON array.
    conn = op.get_bind()
    rows = conn.execute(sa.text("SELECT id, tech_stack FROM projects")).fetchall()
    import json, uuid
    seen: dict[str, str] = {}  # lower(name) -> stack_item id
    for project_id, ts in rows:
        if not ts:
            continue
        if isinstance(ts, str):
            try:
                names = json.loads(ts)
            except Exception:
                continue
        else:
            names = ts
        if not isinstance(names, list):
            continue
        for raw in names:
            name = str(raw).strip()
            if not name:
                continue
            key = name.lower()
            item_id = seen.get(key)
            if not item_id:
                existing = conn.execute(
                    sa.text("SELECT id FROM stack_items WHERE lower(name) = :n"),
                    {"n": key},
                ).scalar()
                if existing:
                    item_id = str(existing)
                else:
                    item_id = str(uuid.uuid4())
                    base = slugify(name, max_len=60, fallback="stack")
                    slug, n = base, 2
                    while conn.execute(
                        sa.text("SELECT 1 FROM stack_items WHERE slug = :s"), {"s": slug}
                    ).first():
                        slug = f"{base}-{n}"
                        n += 1
                    conn.execute(
                        sa.text(
                            "INSERT INTO stack_items (id, name, slug, created_at) "
                            "VALUES (:id, :n, :s, now())"
                        ),
                        {"id": item_id, "n": name, "s": slug},
                    )
                seen[key] = item_id
            conn.execute(
                sa.text(
                    "INSERT INTO project_stack_items (project_id, stack_item_id) "
                    "VALUES (:p, :s) ON CONFLICT DO NOTHING"
                ),
                {"p": project_id, "s": item_id},
            )

    op.drop_column("projects", "tech_stack")


def downgrade() -> None:
    op.add_column("projects", sa.Column("tech_stack", sa.JSON(), nullable=True))

    conn = op.get_bind()
    rows = conn.execute(
        sa.text(
            "SELECT psi.project_id, si.name FROM project_stack_items psi "
            "JOIN stack_items si ON si.id = psi.stack_item_id "
            "ORDER BY psi.project_id, si.name"
        )
    ).fetchall()
    import json
    by_project: dict[str, list[str]] = {}
    for pid, name in rows:
        by_project.setdefault(pid, []).append(name)
    for pid, names in by_project.items():
        conn.execute(
            sa.text("UPDATE projects SET tech_stack = CAST(:j AS JSON) WHERE id = :i"),
            {"j": json.dumps(names), "i": pid},
        )

    op.drop_table("project_stack_items")
    op.execute("DROP INDEX IF EXISTS ix_stack_items_name_lower")
    op.execute("DROP INDEX IF EXISTS ix_stack_items_slug")
    op.drop_table("stack_items")

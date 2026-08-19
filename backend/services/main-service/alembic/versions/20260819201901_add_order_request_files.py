"""add order_request_files

Revision ID: 525845b7379c
Revises: $(head -1 backend/services/main-service/alembic/versions/*_add_categories_tables.py | grep -o '[0-9a-f]*' | head -1)
Create Date: $(date -I)
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "525845b7379c"
down_revision: Union[str, None] = "65dd6cb7b790"  # last migration
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "order_request_files",
        sa.Column("id", UUID(as_uuid=True), nullable=False),
        sa.Column("order_request_id", UUID(as_uuid=True), nullable=False),
        sa.Column("file_path", sa.String(), nullable=False),
        sa.Column("filename", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["order_request_id"],
            ["order_requests.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("order_request_files")

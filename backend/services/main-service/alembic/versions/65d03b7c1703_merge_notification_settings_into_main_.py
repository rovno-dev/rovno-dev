"""merge notification settings into main chain

Revision ID: 65d03b7c1703
Revises: f5d6e7f8a9b0, f9c4d5e6a7b8
Create Date: 2026-09-28 11:01:34.639370

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '65d03b7c1703'
down_revision: Union[str, None] = ('f5d6e7f8a9b0', 'f9c4d5e6a7b8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

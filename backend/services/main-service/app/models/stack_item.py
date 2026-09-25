import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Table, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


project_stack_items = Table(
    "project_stack_items",
    Base.metadata,
    Column("project_id", String, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("stack_item_id", UUID(as_uuid=True), ForeignKey("stack_items.id", ondelete="CASCADE"), primary_key=True),
)


class StackItem(Base):
    __tablename__ = "stack_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(60), nullable=False)
    slug = Column(String(60), nullable=False, index=True)
    icon_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


class PageView(Base):
    """A counter row per (entity_type, entity_id).

    `entity_type` is a short discriminator ("project" | "article" | "event")
    rather than an FK, so adding a new countable entity is a code change,
    not a migration. `entity_id` is the public slug the detail route uses,
    which makes the client call self-describing and means a renamed slug
    starts a fresh counter instead of silently inheriting the old one.
    """

    __tablename__ = "page_views"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(20), nullable=False)
    entity_id = Column(String(120), nullable=False)
    view_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

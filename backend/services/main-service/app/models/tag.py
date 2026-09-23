import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Table, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base

# Many-to-many: an article can have any number of tags, a tag can be on any
# number of articles. Association table is the source of truth for "is this
# tag currently in use"; the tag row itself stays around even when its
# article count drops to zero, so the autocomplete can still suggest it.
article_tags = Table(
    "article_tags",
    Base.metadata,
    Column("article_id", UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class Tag(Base):
    __tablename__ = "tags"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    # slug is URL-safe and unique. `name` is unique under lower() — see the
    # migration for the functional index that enforces this.
    slug = Column(String, nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

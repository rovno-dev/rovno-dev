import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Table, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


class TagKind(str, enum.Enum):
    tag = "tag"
    category = "category"
    brand = "brand"


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
    slug = Column(String, nullable=False, index=True)
    kind = Column(Enum(TagKind, name="tag_kind"), nullable=False, default=TagKind.tag)
    created_at = Column(DateTime, default=datetime.utcnow)

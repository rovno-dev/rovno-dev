import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base
from app.models.article_category import ArticleCategory
from sqlalchemy.orm import relationship
from .project import PublicationStatus

class Article(Base):
    __tablename__ = "articles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    tags = Column(JSON, nullable=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("team_members.id"))
    mdx_content = Column(Text, nullable=False)
    seo_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)
    publication_status = Column(Enum(PublicationStatus, name="publication_status"), default=PublicationStatus.draft)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    category_id = Column(UUID(as_uuid=True), ForeignKey("article_categories.id"), nullable=True)
    category = relationship("ArticleCategory", lazy="joined")

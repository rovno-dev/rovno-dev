import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.database import Base
from .project import PublicationStatus

class Article(Base):
    __tablename__ = "articles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False, default="")
    image_url = Column(String, nullable=False, default="")
    date = Column(DateTime, nullable=False, default=datetime.utcnow)

    # LLM context: author is a User (blog authors sign up via /register), not a
    # TeamMember. Blog-authors who want to appear must have a user account.
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    mdx_content = Column(Text, nullable=False, default="")

    # Unstructured payload the author pastes in from an AI tool. Persisted
    # verbatim so it can be re-applied later or audited, but never rendered.
    raw_json = Column(JSON, nullable=True)

    seo_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)
    publication_status = Column(Enum(PublicationStatus, name="publication_status"), default=PublicationStatus.draft)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Deprecated: article_categories is unused. Kept so the FK doesn't break
    # the existing article_categories table; the API does not surface it.
    category_id = Column(UUID(as_uuid=True), ForeignKey("article_categories.id"), nullable=True)

    author = relationship("User", lazy="joined")
    category = relationship("ArticleCategory", lazy="joined")
    # selectin avoids N+1 on list endpoints. order_by keeps the render order
    # deterministic between requests (alphabetical by name).
    tags = relationship("Tag", secondary="article_tags", lazy="selectin", order_by="Tag.name")

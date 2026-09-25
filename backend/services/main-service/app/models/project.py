import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, Boolean, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base
from app.models.project_category import ProjectCategory
from sqlalchemy.orm import relationship
import enum

class PublicationStatus(str, enum.Enum):
    draft = "draft"
    # Submitted by the author, awaiting admin review. Only non-team authors
    # land here — team members publish directly.
    pending_review = "pending_review"
    published = "published"
    rejected = "rejected"
    deleted = "deleted"

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True)  # short code identifier like 'alx'
    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    platform = Column(String, nullable=True)
    period = Column(String, nullable=True)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    cover_image_src = Column(String, nullable=False)
    cover_video_src = Column(String, nullable=True)
    href = Column(String, nullable=True)
    seo_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)
    mdx_content = Column(Text, nullable=True)
    is_featured = Column(Boolean, default=False)
    publication_status = Column(Enum(PublicationStatus, name="publication_status"), default=PublicationStatus.draft)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    category_id = Column(UUID(as_uuid=True), ForeignKey("project_categories.id"), nullable=True)
    category = relationship("ProjectCategory", lazy="joined")
    # Eager-loaded so ProjectDetail can return the client inline
    # without an N+1 on list endpoints.
    client = relationship("Company", lazy="joined")
    stack_items = relationship(
        "StackItem",
        secondary="project_stack_items",
        lazy="selectin",
        order_by="StackItem.name",
    )
    tag_records = relationship(
        "ProjectTag",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ProjectTag.sort_order",
    )
    media = relationship(
        "ProjectMedia",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ProjectMedia.sort_order",
    )

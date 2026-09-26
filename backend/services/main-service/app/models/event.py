import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, Boolean, Integer, Enum, Table, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.database import Base
from app.models.project import PublicationStatus  # reuse the enum


event_tags = Table(
    "event_tags",
    Base.metadata,
    Column("event_id", String, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    cover_image_src = Column(String, nullable=False, default="")
    cover_video_src = Column(String, nullable=True)

    # When it happens.
    start_at = Column(DateTime, nullable=True, index=True)
    end_at = Column(DateTime, nullable=True)

    # Where it happens.
    location_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    metro = Column(String, nullable=True)
    city = Column(String, nullable=True, default="Москва")

    # Commercials & capacity.
    price = Column(String, nullable=True)
    registration_url = Column(String, nullable=True)
    capacity = Column(Integer, nullable=True)

    # Which bespoke renderer to use, if any.
    custom_page = Column(String(60), nullable=True)

    is_featured = Column(Boolean, default=False, nullable=False)
    publication_status = Column(
        Enum(PublicationStatus, name="publication_status", create_type=False),
        default=PublicationStatus.draft,
        nullable=False,
    )

    mdx_content = Column(Text, nullable=True)
    seo_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tags = relationship("Tag", secondary=event_tags, lazy="selectin")
    requests = relationship("EventRequest", back_populates="event", cascade="all, delete-orphan")

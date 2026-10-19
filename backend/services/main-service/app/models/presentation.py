import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, JSON, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.database import Base

class Presentation(Base):
    __tablename__ = "presentations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    event_id = Column(String, ForeignKey("events.id", ondelete="SET NULL"), nullable=True)
    
    # Time-gating (if set, presentation is only visible between these times)
    starts_at = Column(DateTime, nullable=True)
    ends_at = Column(DateTime, nullable=True)
    
    is_published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    slides = relationship("PresentationSlide", back_populates="presentation", cascade="all, delete-orphan", order_by="PresentationSlide.order")

class PresentationSlide(Base):
    __tablename__ = "presentation_slides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    presentation_id = Column(UUID(as_uuid=True), ForeignKey("presentations.id", ondelete="CASCADE"), nullable=False, index=True)
    order = Column(Integer, default=0, nullable=False)
    
    # Type of block: 'cover', 'text', 'image', 'question', 'quote'
    type = Column(String, nullable=False)
    
    # JSON content: { title, subtitle, text, image_url, bg_color, text_color }
    content = Column(JSON, default=dict, nullable=False)
    notes = Column(String, nullable=True)

    presentation = relationship("Presentation", back_populates="slides")

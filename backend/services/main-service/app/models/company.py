import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


class LifecycleStage(str, enum.Enum):
    lead = "lead"
    prospect = "prospect"
    customer = "customer"
    regular = "regular"


class Company(Base):
    __tablename__ = "companies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    # URL-safe identifier for /clients/<slug>. Unique, transliterated at
    # creation time.
    slug = Column(String, nullable=False, unique=True, index=True)
    website = Column(String, nullable=True)
    logotype_url = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    # Short blurb shown on the public profile page header.
    description = Column(Text, nullable=True)
    lifecycle_stage = Column(Enum(LifecycleStage, name="lifecycle_stage"), default=LifecycleStage.lead)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

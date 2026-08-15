import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base
import enum

class LifecycleStage(str, enum.Enum):
    lead = "lead"
    prospect = "prospect"
    customer = "customer"
    regular = "regular"

class Company(Base):
    __tablename__ = "companies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    website = Column(String, nullable=True)
    logotype_url = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    lifecycle_stage = Column(Enum(LifecycleStage, name="lifecycle_stage"), default=LifecycleStage.lead)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

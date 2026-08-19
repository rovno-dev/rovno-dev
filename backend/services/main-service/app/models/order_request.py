from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base
import enum

class EstimateDeadline(str, enum.Enum):
    asap = "asap"
    under_1_month = "under_1_month"
    under_3_month = "1_3_months"
    flexible = "flexible"

class EstimateBudget(str, enum.Enum):
    budget_30k_75k = "30k_75k"
    budget_75k_150k = "75k_150k"
    budget_150k_500k = "150k_500k"
    budget_500k_1kk = "500k_1kk"
    budget_over_1kk = "over_1kk"
    budget_need_consultation = "need_consultation"

class OrderRequest(Base):
    files = relationship("OrderRequestFile", back_populates="order_request", cascade="all, delete-orphan")
    files = relationship("OrderRequestFile", back_populates="order_request", cascade="all, delete-orphan")
    files = relationship("OrderRequestFile", back_populates="order_request", cascade="all, delete-orphan")
    files = relationship("OrderRequestFile", back_populates="order_request", cascade="all, delete-orphan")
    __tablename__ = "order_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"))
    service_types_json = Column(JSON, nullable=True)
    about = Column(String, nullable=True)
    estimate_deadline = Column(Enum(EstimateDeadline, name="estimate_deadline"), nullable=True)
    estimate_budget = Column(Enum(EstimateBudget, name="estimate_budget"), nullable=True)
    naming_help = Column(String, nullable=True)  # NEW: stores the naming preference
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

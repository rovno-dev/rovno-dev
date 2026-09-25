import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.database import Base


class Client(Base):
    """A person or representative who submits an order.

    This is the CRM-side "client" — the record that appears in the admin
    panel next to their order history. Distinct from `Company`, which is
    the organization the agency builds a project for.
    """
    __tablename__ = "clients"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    role_title = Column(String, nullable=True)
    # Lookup-or-reuse happens in the order endpoint. Values are not unique —
    # two people at the same org can share a company inbox.
    phone = Column(String, nullable=True)
    telegram_username = Column(String, nullable=True)
    email = Column(String, nullable=True)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order_requests = relationship("OrderRequest", back_populates="client")

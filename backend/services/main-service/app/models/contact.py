import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.database import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    role_title = Column(String, nullable=True)
    # ponytail: contacts are leads, not identities. Multiple orders (or different
    # people sharing a company inbox / phone) can legitimately repeat these values,
    # so they are NOT unique. Lookup-or-reuse happens in the order endpoint.
    phone = Column(String, nullable=True)
    telegram_username = Column(String, nullable=True)
    email = Column(String, nullable=True)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    order_requests = relationship("OrderRequest", back_populates="contact")

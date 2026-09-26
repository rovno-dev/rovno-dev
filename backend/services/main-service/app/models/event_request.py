import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.database import Base


class EventRequest(Base):
    """A registration submitted for an event.

    Core identity fields are columns so the admin list is fast to sort and
    filter. Every other field the landing form sends lands in `meta` as a
    JSON blob — this mirrors how Twenty CRM handles custom fields, and it
    means adding a new form field doesn't require a migration.
    """
    __tablename__ = "event_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(String, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)

    name = Column(String, nullable=True)
    surname = Column(String, nullable=True)
    patronymic = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    telegram_username = Column(String, nullable=True)
    age = Column(Integer, nullable=True)

    # new | approved | declined | canceled
    status = Column(String(20), nullable=False, default="new")
    decline_reason = Column(String, nullable=True)

    # Everything else. Free-form.
    meta = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    event = relationship("Event", back_populates="requests")

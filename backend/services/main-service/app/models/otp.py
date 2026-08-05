import uuid

from sqlalchemy import Column, UUID, String, ForeignKey, Boolean, DateTime, DECIMAL
from sqlalchemy.orm import relationship, foreign
from database.database import Base
from datetime import datetime

class Otp(Base):
    __tablename__ = "otps"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID, ForeignKey("users.id"))
    user = relationship("User")

    code = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
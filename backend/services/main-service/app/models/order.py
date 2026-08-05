import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    services = Column(JSON, nullable=False) # List of types
    company_name = Column(String, nullable=True)
    naming_help = Column(String, nullable=True) # Yes/No/Already have
    description = Column(Text, nullable=False)
    deadline = Column(String, nullable=True)
    budget = Column(String, nullable=True)
    user_name = Column(String, nullable=False)
    user_contact = Column(String, nullable=False)
    user_email = Column(String, nullable=True)
    references = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class OrderFile(Base):
    __tablename__ = "order_files"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), index=True)
    file_path = Column(String, nullable=False)
    filename = Column(String, nullable=False)

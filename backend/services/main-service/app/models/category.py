import uuid
from sqlalchemy import Column, UUID, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.database import Base
from datetime import datetime

class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    slug = Column(String, nullable=False, unique=True, index=True)
    description = Column(String)
    parent_id = Column(UUID, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    parent = relationship("Category", remote_side=[id], backref="children")
    products = relationship("Product", back_populates="category")

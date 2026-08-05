import uuid
from sqlalchemy import Column, UUID, String, ForeignKey, Boolean, DateTime, DECIMAL, Enum
from sqlalchemy.orm import relationship
from database.database import Base
from datetime import datetime
import enum

class ProductStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    price = Column(DECIMAL, index=True, nullable=False)
    status = Column(Enum(ProductStatus), default=ProductStatus.DRAFT)
    category_id = Column(UUID, ForeignKey("categories.id"), nullable=True)
    created_by = Column(UUID, ForeignKey("users.id"), nullable=False)

    creator = relationship("User")
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

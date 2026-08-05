import uuid
from sqlalchemy import Column, UUID, String, ForeignKey, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from database.database import Base
from datetime import datetime

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(UUID, primary_key=True, default=uuid.uuid4, index=True)
    product_id = Column(UUID, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    is_cover = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product", back_populates="images")

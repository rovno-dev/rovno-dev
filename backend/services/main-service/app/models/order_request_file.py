from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base

class OrderRequestFile(Base):
    order_request = relationship("OrderRequest", back_populates="files")
    __tablename__ = "order_request_files"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_request_id = Column(UUID(as_uuid=True), ForeignKey("order_requests.id"), nullable=False)
    file_path = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

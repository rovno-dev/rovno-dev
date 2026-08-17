import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base

class ArticleCategory(Base):
    __tablename__ = "article_categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False)
    label = Column(String, nullable=False)

import uuid
from datetime import datetime
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base

class UserRole(str, enum.Enum):
    client = "client"
    user = "user"
    admin = "admin"
    root = "root"

class UserStatus(str, enum.Enum):
    pending_verification = "pending_verification"
    verificated = "verificated"
    blocked = "blocked"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=True)
    surname = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, nullable=True)
    password = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    telegram_username = Column(String, unique=True, nullable=True)
    linkedin_username = Column(String, unique=True, nullable=True)
    github_username = Column(String, unique=True, nullable=True)
    behance_username = Column(String, unique=True, nullable=True)
    youtube_username = Column(String, unique=True, nullable=True)
    vk_username = Column(String, unique=True, nullable=True)
    telegram_channel_username = Column(String, unique=True, nullable=True)
    vk_public_username = Column(String, unique=True, nullable=True)
    user_role = Column(Enum(UserRole, name="user_role"), default=UserRole.user)
    user_status = Column(Enum(UserStatus, name="user_status"), default=UserStatus.pending_verification)
    other_socials_json = Column(JSON, nullable=True)
    tags_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # existing fields:
    blocked = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)

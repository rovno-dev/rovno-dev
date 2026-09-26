import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


class ProjectRole(Base):
    """A team member's role on a specific project ("Art Direction", "Backend").

    Parallel to ProjectCategory in shape and lifecycle. Managed by admins.
    `labels` is a {lang_code: display_string} map; `en` is the required key.
    """
    __tablename__ = "project_roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(60), nullable=False, unique=True, index=True)
    labels = Column(JSON, nullable=False, default=lambda: {"en": ""})
    created_at = Column(DateTime, default=datetime.utcnow)

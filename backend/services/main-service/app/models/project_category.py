import uuid
from sqlalchemy import Column, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


class ProjectCategory(Base):
    """Category shown on project cards and used for filtering the /projects list.

    `labels` is a {lang_code: display_string} map. English is the required key;
    the frontend falls back to `labels.en` when the active language is missing.
    The legacy `label` column is kept in sync with `labels['en']` on write.
    """
    __tablename__ = "project_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False)
    label = Column(String, nullable=False)
    labels = Column(JSON, nullable=True)

import uuid
import enum
from sqlalchemy import Column, String, Integer, JSON, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.database import Base


class ProjectTagKind(str, enum.Enum):
    # "From Chief" — someone's personal side project.
    from_chief = "from_chief"
    # License info (MIT, Apache-2.0, …). value = { type, url? }.
    license = "license"
    # GitHub repo. value = { repo: "owner/name", branch? }.
    github = "github"
    # Any plain label the admin types.
    custom = "custom"


class ProjectTag(Base):
    __tablename__ = "project_tags"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    kind = Column(Enum(ProjectTagKind, name="project_tag_kind"), nullable=False)
    label = Column(String, nullable=False)
    # Shape depends on kind — see ProjectTagKind docs.
    value = Column(JSON, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    project = relationship("Project", back_populates="tag_records")

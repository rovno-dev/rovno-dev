from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.database import Base


class ProjectTeamAssignment(Base):
    __tablename__ = "project_team_assignments"

    project_id = Column(String, ForeignKey("projects.id"), primary_key=True)
    team_member_id = Column(UUID(as_uuid=True), ForeignKey("team_members.id"), primary_key=True)

    # Legacy free-text role. Retained so assignments pinned before the
    # project_roles migration keep their label. New assignments set role_id.
    role_on_project = Column(String, nullable=True)

    # Managed role taxonomy. When set, the display label is resolved via
    # ProjectRole.labels[lang]; role_on_project is ignored.
    role_id = Column(
        UUID(as_uuid=True),
        ForeignKey("project_roles.id", ondelete="SET NULL"),
        nullable=True,
    )

    role = relationship("ProjectRole", lazy="joined")

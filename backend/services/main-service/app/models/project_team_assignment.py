from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base

class ProjectTeamAssignment(Base):
    __tablename__ = "project_team_assignments"
    project_id = Column(String, ForeignKey("projects.id"), primary_key=True)
    team_member_id = Column(UUID(as_uuid=True), ForeignKey("team_members.id"), primary_key=True)
    role_on_project = Column(String, nullable=True)

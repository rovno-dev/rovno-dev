"""Public team member info + their linked projects, looked up by username."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from app.models.project import Project, PublicationStatus
from app.models.project_team_assignment import ProjectTeamAssignment
from app.models.team_member import TeamMember
from app.models.user import User
from app.schemas.team.responses import TeamMemberPublic
from database.database import get_db

router = APIRouter(prefix="/team", tags=["team"])


class TeamProjectRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    slug: str
    title: str
    short_description: Optional[str] = None
    cover_image_src: str
    cover_video_src: Optional[str] = None
    period: Optional[str] = None
    role_on_project: Optional[str] = None
    category_label: Optional[str] = None


def _resolve_member(db: Session, username: str) -> tuple[User, TeamMember]:
    """Return the user and their active team record, or raise 404."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    tm = (
        db.query(TeamMember)
        .filter(TeamMember.user_id == user.id, TeamMember.is_active.is_(True))
        .first()
    )
    if not tm:
        raise HTTPException(404, "Not a team member")
    return user, tm


@router.get("/by-username/{username}", response_model=TeamMemberPublic)
def get_team_member_by_username(
    username: str,
    db: Session = Depends(get_db),
):
    _, tm = _resolve_member(db, username)
    return tm


@router.get(
    "/by-username/{username}/projects",
    response_model=List[TeamProjectRef],
)
def get_team_member_projects(
    username: str,
    db: Session = Depends(get_db),
):
    """Projects this member is pinned to, newest first. Only published ones."""
    _, tm = _resolve_member(db, username)
    rows = (
        db.query(ProjectTeamAssignment, Project)
        .join(Project, Project.id == ProjectTeamAssignment.project_id)
        .filter(ProjectTeamAssignment.team_member_id == tm.id)
        .filter(Project.publication_status == PublicationStatus.published)
        .order_by(Project.updated_at.desc())
        .all()
    )
    return [
        TeamProjectRef(
            id=proj.id,
            slug=proj.slug,
            title=proj.title,
            short_description=proj.short_description,
            cover_image_src=proj.cover_image_src,
            cover_video_src=proj.cover_video_src,
            period=proj.period,
            role_on_project=asg.role_on_project,
            category_label=(proj.category.label if proj.category else None),
        )
        for asg, proj in rows
    ]

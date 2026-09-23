"""Public team member info, looked up by the user's username (the expert slug)."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.team_member import TeamMember
from app.models.user import User
from app.schemas.team.responses import TeamMemberPublic
from database.database import get_db

router = APIRouter(prefix="/team", tags=["team"])


@router.get("/by-username/{username}", response_model=TeamMemberPublic)
def get_team_member_by_username(
    username: str,
    db: Session = Depends(get_db),
):
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
    return tm

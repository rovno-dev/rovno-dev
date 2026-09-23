from typing import Optional
from sqlalchemy.orm import Session
from app.models.team_member import TeamMember
from app.models.user import User


def get_active_team_member(db: Session, user_id) -> Optional[TeamMember]:
    """Return the user's active team_member row, or None.

    Soft-removed rows (is_active=False) are ignored — they still exist so
    historical attributions survive, but they don't grant review bypass.
    """
    if user_id is None:
        return None
    return (
        db.query(TeamMember)
        .filter(TeamMember.user_id == user_id, TeamMember.is_active.is_(True))
        .first()
    )


def is_team_member(db: Session, user: Optional[User]) -> bool:
    if user is None:
        return False
    return get_active_team_member(db, user.id) is not None

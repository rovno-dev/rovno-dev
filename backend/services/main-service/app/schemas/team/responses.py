from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class TeamMemberPublic(BaseModel):
    """Public shape for the expert page."""
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    role: str
    bio: Optional[str] = None
    cover_url: Optional[str] = None
    sort_order: int


class TeamMemberWithUser(TeamMemberPublic):
    """Admin shape includes the linked user's basic info."""
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_surname: Optional[str] = None
    user_username: Optional[str] = None
    user_avatar_url: Optional[str] = None
    user_bio: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

from typing import Optional
from pydantic import BaseModel, Field


class TeamMemberCreate(BaseModel):
    """Used by admin to promote a user to team member."""
    role: str = Field(..., min_length=1, max_length=120)
    bio: Optional[str] = None
    cover_url: Optional[str] = None
    sort_order: Optional[int] = 0


class TeamMemberUpdate(BaseModel):
    role: Optional[str] = Field(None, min_length=1, max_length=120)
    bio: Optional[str] = None
    cover_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

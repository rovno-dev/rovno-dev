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
    # Editable from the same dialog for convenience. Saved onto the linked
    # User record (with a uniqueness check), not the TeamMember row.
    # Required for the member to appear on the public /about page and to
    # have a working /<username> expert profile.
    username: Optional[str] = Field(None, min_length=2, max_length=60)

from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class TeamMemberPublic(BaseModel):
    """Public shape for the expert profile page.

    Enriched with the linked user's identity so the profile page doesn't need
    a second round-trip to fetch name/avatar. Populated manually in the
    endpoint because TeamMember rows don't carry the User's fields.
    """
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    role: str
    bio: Optional[str] = None
    cover_url: Optional[str] = None
    sort_order: int

    # --- user identity, joined in ---
    username: Optional[str] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    avatar_url: Optional[str] = None
    short_bio: Optional[str] = None


class TeamMemberListItem(TeamMemberPublic):
    """Same shape, plus a count of published projects this member is pinned to."""
    project_count: int = 0


class TeamMemberWithUser(TeamMemberPublic):
    """Admin shape — same fields plus the email and a couple of internals."""
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_surname: Optional[str] = None
    user_username: Optional[str] = None
    user_avatar_url: Optional[str] = None
    user_bio: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

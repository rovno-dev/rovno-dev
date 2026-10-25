import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


def _validate_username_field(v: Optional[str]) -> Optional[str]:
    if v is None:
        return v
    v = v.strip()
    if not v:
        return None
    if not re.match(r"^[A-Za-z0-9_]+$", v):
        raise ValueError("Username may only contain A-Z, a-z, 0-9 and _")
    return v


class TeamMemberCreate(BaseModel):
    """Used by admin to promote a user to team member."""
    role: str = Field(..., min_length=1, max_length=120)
    bio: Optional[str] = None
    cover_url: Optional[str] = None
    sort_order: Optional[int] = 0
    # Expert-profile fields (JSON-serialisable lists, same shape the admin
    # dialog and /app/profile form produce). Validated only for length /
    # basic shape here - deep validation is client-side and the DB just
    # persists whatever comes through.
    location: Optional[str] = None
    expert_tags: Optional[List[Dict[str, Any]]] = None
    expert_socials: Optional[List[Dict[str, Any]]] = None
    expert_stats: Optional[List[Dict[str, Any]]] = None
    expert_skills: Optional[List[Dict[str, Any]]] = None
    expert_milestones: Optional[List[Dict[str, Any]]] = None


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
    # Expert-profile fields. `None` (field omitted) = leave unchanged;
    # an empty list = clear. This matches how the admin dialog and the
    # /app/profile form always send the current value.
    location: Optional[str] = None
    expert_tags: Optional[List[Dict[str, Any]]] = None
    expert_socials: Optional[List[Dict[str, Any]]] = None
    expert_stats: Optional[List[Dict[str, Any]]] = None
    expert_skills: Optional[List[Dict[str, Any]]] = None
    expert_milestones: Optional[List[Dict[str, Any]]] = None

    @field_validator("username")
    @classmethod
    def _validate_username(cls, v):
        return _validate_username_field(v)

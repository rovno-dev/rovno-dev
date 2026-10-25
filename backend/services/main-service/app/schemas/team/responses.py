from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class TeamMemberPublic(BaseModel):
    """Public shape for the expert profile page.

    Identity (name/avatar/etc.) is joined from the linked User row.
    Expert-profile fields (stats/skills/milestones/tags/socials/location)
    live on `team_members` as JSON - see migration
    20261026000000_add_team_member_expert_fields.py.
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
    # --- expert profile (JSON columns, edited via admin or /app/profile) ---
    location: Optional[str] = None
    # Each entry: { label: str, icon_key: str | null }
    expert_tags: Optional[List[Dict[str, Any]]] = None
    # Each entry: { kind: str, href: str }
    expert_socials: Optional[List[Dict[str, Any]]] = None
    # Each entry: { value: str, label: str }
    expert_stats: Optional[List[Dict[str, Any]]] = None
    # Each entry: { label: str, level: int }
    expert_skills: Optional[List[Dict[str, Any]]] = None
    # Each entry: { year: str, title: str, body: str }
    expert_milestones: Optional[List[Dict[str, Any]]] = None


class TeamMemberListItem(TeamMemberPublic):
    """Same shape, plus a count of published projects this member is pinned to."""
    project_count: int = 0


class TeamMemberWithUser(TeamMemberPublic):
    """Admin shape - same fields plus the email and a couple of internals."""
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_surname: Optional[str] = None
    user_username: Optional[str] = None
    user_avatar_url: Optional[str] = None
    user_bio: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

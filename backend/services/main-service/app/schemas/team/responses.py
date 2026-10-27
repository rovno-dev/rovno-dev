from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class TeamMemberPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    role: str
    bio: Optional[str] = None
    cover_url: Optional[str] = None
    sort_order: int
    username: Optional[str] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    avatar_url: Optional[str] = None
    short_bio: Optional[str] = None
    location: Optional[str] = None
    expert_tags: Optional[List[Dict[str, Any]]] = None
    expert_socials: Optional[List[Dict[str, Any]]] = None
    expert_stats: Optional[List[Dict[str, Any]]] = None
    expert_skills: Optional[List[Dict[str, Any]]] = None
    expert_milestones: Optional[List[Dict[str, Any]]] = None

class TeamMemberListItem(TeamMemberPublic):
    project_count: int = 0

class TeamMemberWithUser(TeamMemberPublic):
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_surname: Optional[str] = None
    user_username: Optional[str] = None
    user_avatar_url: Optional[str] = None
    user_bio: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

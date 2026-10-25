import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator

class TeamMemberCreate(BaseModel):
    role: str = Field(..., min_length=1, max_length=120)
    bio: Optional[str] = None
    cover_url: Optional[str] = None
    sort_order: Optional[int] = 0
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
    username: Optional[str] = Field(None, min_length=2, max_length=60)
    location: Optional[str] = None
    expert_tags: Optional[List[Dict[str, Any]]] = None
    expert_socials: Optional[List[Dict[str, Any]]] = None
    expert_stats: Optional[List[Dict[str, Any]]] = None
    expert_skills: Optional[List[Dict[str, Any]]] = None
    expert_milestones: Optional[List[Dict[str, Any]]] = None

    @field_validator("username")
    @classmethod
    def _validate_username(cls, v):
        if v is None: return v
        v = v.strip()
        if not v: return None
        if not re.match(r"^[A-Za-z0-9_]+$", v): raise ValueError("Invalid username")
        return v

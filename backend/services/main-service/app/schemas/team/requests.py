import re
import re
import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator, field_validator, field_validator


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

    @field_validator("username")
    @classmethod
    def _validate_username(cls, v):
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        if not re.match(r"^[A-Za-z0-9_]+$", v):
            raise ValueError("Username may only contain A-Z, a-z, 0-9 and _")
        return v

    @field_validator("username")
    @classmethod
    def _validate_username(cls, v):
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        if not re.match(r"^[A-Za-z0-9_]+$", v):
            raise ValueError("Username may only contain A-Z, a-z, 0-9 and _")
        return v

    @field_validator("username")
    @classmethod
    def _validate_username(cls, v):
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        if not re.match(r"^[A-Za-z0-9_]+$", v):
            raise ValueError("Username may only contain A-Z, a-z, 0-9 and _")
        return v

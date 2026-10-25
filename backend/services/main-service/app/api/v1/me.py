import re
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Any, Dict, List, Optional

from app.models.user import User
from app.models.client import Client
from app.models.team_member import TeamMember
from app.models.user_session import UserSession
from app.shared.auth import get_current_user, hash_password, verify_password
from app.services.team_service import get_active_team_member
from database.database import get_db

router = APIRouter(prefix="/me", tags=["me"])


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    # Short bio, 64-char ceiling enforced both here and in the DB.
    bio: Optional[str] = Field(None, max_length=64)
    # Team-member-only fields. Silently ignored if the current user isn't
    # an active team member — prevents privilege confusion.
    team_role: Optional[str] = Field(None, min_length=1, max_length=120)
    team_bio: Optional[str] = None
    team_cover_url: Optional[str] = None
    # Expert-profile fields. Follow the same "team_*" prefix as the other
    # team-member-only fields above. `None` = leave unchanged; [] = clear.
    team_location: Optional[str] = None
    team_expert_tags: Optional[List[Dict[str, Any]]] = None
    team_expert_socials: Optional[List[Dict[str, Any]]] = None
    team_expert_stats: Optional[List[Dict[str, Any]]] = None
    team_expert_skills: Optional[List[Dict[str, Any]]] = None
    team_expert_milestones: Optional[List[Dict[str, Any]]] = None

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
        if len(v) < 2 or len(v) > 60:
            raise ValueError("Username must be 2-60 characters")
        return v


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)


def _serialize_me(db: Session, user: User) -> dict:
    tm = get_active_team_member(db, user.id)
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "surname": user.surname,
        "username": user.username,
        "phone": user.phone,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "role": user.user_role.value,
        "verified": user.verified,
        "blocked": user.blocked,
        "is_team_member": tm is not None,
        "team_member": (
            {
                "id": str(tm.id),
                "role": tm.role,
                "bio": tm.bio,
                "cover_url": tm.cover_url,
                "sort_order": tm.sort_order,
                "location": tm.location,
                "expert_tags": tm.expert_tags,
                "expert_socials": tm.expert_socials,
                "expert_stats": tm.expert_stats,
                "expert_skills": tm.expert_skills,
                "expert_milestones": tm.expert_milestones,
            }
            if tm
            else None
        ),
    }


@router.get("")
async def get_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _serialize_me(db, current_user)


@router.patch("")
async def update_me(
    data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = data.model_dump(exclude_unset=True)

    # Split the team-member fields out before applying.
    team_role = update_data.pop("team_role", None)
    team_bio = update_data.pop("team_bio", None)
    team_cover_url = update_data.pop("team_cover_url", None)
    team_location = update_data.pop("team_location", None)
    team_expert_tags = update_data.pop("team_expert_tags", None)
    team_expert_socials = update_data.pop("team_expert_socials", None)
    team_expert_stats = update_data.pop("team_expert_stats", None)
    team_expert_skills = update_data.pop("team_expert_skills", None)
    team_expert_milestones = update_data.pop("team_expert_milestones", None)

    # Username uniqueness check if it's changing.
    if "username" in update_data and update_data["username"] != current_user.username:
        new_username = update_data["username"].strip() if update_data["username"] else None
        if new_username:
            clash = (
                db.query(User.id)
                .filter(
                    func.lower(User.username) == new_username.lower(),
                    User.id != current_user.id,
                )
                .first()
            )
            if clash:
                raise HTTPException(409, "Username already taken")
            update_data["username"] = new_username

    for key, value in update_data.items():
        if hasattr(current_user, key):
            setattr(current_user, key, value)

    # Team member fields — only applied when the user actually is one.
    tm = get_active_team_member(db, current_user.id)
    if tm:
        if team_role is not None:
            tm.role = team_role
        if team_bio is not None:
            tm.bio = team_bio
        if team_cover_url is not None:
            tm.cover_url = team_cover_url
        if team_location is not None:
            tm.location = team_location or None
        if team_expert_tags is not None:
            tm.expert_tags = team_expert_tags
        if team_expert_socials is not None:
            tm.expert_socials = team_expert_socials
        if team_expert_stats is not None:
            tm.expert_stats = team_expert_stats
        if team_expert_skills is not None:
            tm.expert_skills = team_expert_skills
        if team_expert_milestones is not None:
            tm.expert_milestones = team_expert_milestones

    db.commit()
    db.refresh(current_user)
    return _serialize_me(db, current_user)



class SessionOut(BaseModel):
    id: UUID
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    last_active_at: datetime

    class Config:
        from_attributes = True

@router.get("/sessions", response_model=list[SessionOut])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(UserSession).filter(UserSession.user_id == current_user.id).order_by(UserSession.last_active_at.desc()).all()

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.get(UserSession, session_id)
    if session and session.user_id == current_user.id:
        db.delete(session)
        db.commit()
    return {"status": "ok"}

@router.post("/change-password")
async def change_password(
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.delete("")
async def delete_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Client).filter(Client.user_id == current_user.id).update({"user_id": None})
    db.query(TeamMember).filter(TeamMember.user_id == current_user.id).update({"user_id": None})
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted"}

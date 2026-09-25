from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from app.models.user import User
from app.models.client import Client
from app.models.team_member import TeamMember
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

    # Username uniqueness check if it's changing.
    if "username" in update_data and update_data["username"] != current_user.username:
        new_username = update_data["username"].strip() if update_data["username"] else None
        if new_username:
            clash = (
                db.query(User.id)
                .filter(User.username == new_username, User.id != current_user.id)
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

    db.commit()
    db.refresh(current_user)
    return _serialize_me(db, current_user)


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

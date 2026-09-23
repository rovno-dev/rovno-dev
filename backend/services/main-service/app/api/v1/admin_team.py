"""Admin-only team membership management."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.admin import get_admin_user
from app.models.team_member import TeamMember
from app.models.user import User
from app.schemas.team.requests import TeamMemberCreate, TeamMemberUpdate
from app.schemas.team.responses import TeamMemberWithUser
from app.shared.auth import get_current_user
from database.database import get_db

router = APIRouter(prefix="/admin/team", tags=["admin-team"])


def _to_response(tm: TeamMember, user: Optional[User]) -> TeamMemberWithUser:
    return TeamMemberWithUser(
        id=tm.id,
        user_id=tm.user_id,
        role=tm.role,
        bio=tm.bio,
        cover_url=tm.cover_url,
        sort_order=tm.sort_order,
        is_active=tm.is_active,
        created_at=tm.created_at,
        user_email=user.email if user else None,
        user_name=user.name if user else None,
        user_surname=user.surname if user else None,
        user_username=user.username if user else None,
        user_avatar_url=user.avatar_url if user else None,
        user_bio=user.bio if user else None,
    )


@router.get("", response_model=list[TeamMemberWithUser])
def list_team(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    q = db.query(TeamMember)
    if not include_inactive:
        q = q.filter(TeamMember.is_active.is_(True))
    members = q.order_by(TeamMember.sort_order.asc(), TeamMember.created_at.asc()).all()

    users_by_id = {
        u.id: u
        for u in db.query(User)
        .filter(User.id.in_([m.user_id for m in members if m.user_id]))
        .all()
    }
    return [_to_response(m, users_by_id.get(m.user_id)) for m in members]


@router.post("/users/{user_id}", response_model=TeamMemberWithUser, status_code=201)
def make_team_member(
    user_id: UUID,
    payload: TeamMemberCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")

    existing = (
        db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    )
    if existing:
        # Reactivate and update in place.
        existing.is_active = True
        existing.role = payload.role
        if payload.bio is not None:
            existing.bio = payload.bio
        if payload.cover_url is not None:
            existing.cover_url = payload.cover_url
        if payload.sort_order is not None:
            existing.sort_order = payload.sort_order
        db.commit()
        db.refresh(existing)
        return _to_response(existing, user)

    tm = TeamMember(
        user_id=user_id,
        role=payload.role,
        bio=payload.bio,
        cover_url=payload.cover_url,
        sort_order=payload.sort_order or 0,
        is_active=True,
    )
    db.add(tm)
    db.commit()
    db.refresh(tm)
    return _to_response(tm, user)


@router.patch("/users/{user_id}", response_model=TeamMemberWithUser)
def update_team_member(
    user_id: UUID,
    payload: TeamMemberUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    tm = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    if not tm:
        raise HTTPException(404, "User is not a team member")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(tm, k, v)
    db.commit()
    db.refresh(tm)
    return _to_response(tm, db.get(User, user_id))


@router.delete("/users/{user_id}", status_code=204)
def remove_team_member(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    tm = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    if not tm:
        raise HTTPException(404, "User is not a team member")
    # Soft-remove: their articles stay attributed, they keep the account,
    # they just lose publish-without-review privileges.
    tm.is_active = False
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Project pinning — uses the existing project_team_assignments join table.
# The dialog does a "replace all" save: it sends the full desired list, the
# endpoint deletes every existing row for the member and re-inserts. Simpler
# than a diff for the size of data involved (a handful of rows per member).
# ---------------------------------------------------------------------------

from app.models.project import Project
from app.models.project_team_assignment import ProjectTeamAssignment
from pydantic import BaseModel


class ProjectAssignmentIn(BaseModel):
    project_id: str
    role_on_project: Optional[str] = None


class SetProjectsRequest(BaseModel):
    projects: list[ProjectAssignmentIn]


class ProjectAssignmentOut(BaseModel):
    project_id: str
    role_on_project: Optional[str] = None
    # Denormalized for the dialog — saves a client-side join.
    title: Optional[str] = None
    slug: Optional[str] = None
    period: Optional[str] = None


def _list_member_projects(db: Session, team_member_id) -> list[ProjectAssignmentOut]:
    rows = (
        db.query(ProjectTeamAssignment, Project)
        .join(Project, Project.id == ProjectTeamAssignment.project_id)
        .filter(ProjectTeamAssignment.team_member_id == team_member_id)
        .order_by(Project.title.asc())
        .all()
    )
    return [
        ProjectAssignmentOut(
            project_id=proj.id,
            role_on_project=asg.role_on_project,
            title=proj.title,
            slug=proj.slug,
            period=proj.period,
        )
        for asg, proj in rows
    ]


@router.get("/users/{user_id}/projects", response_model=list[ProjectAssignmentOut])
def get_team_member_projects(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    tm = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    if not tm:
        raise HTTPException(404, "User is not a team member")
    return _list_member_projects(db, tm.id)


@router.put("/users/{user_id}/projects", response_model=list[ProjectAssignmentOut])
def set_team_member_projects(
    user_id: UUID,
    payload: SetProjectsRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    tm = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    if not tm:
        raise HTTPException(404, "User is not a team member")

    # Validate that every project_id actually exists — a typo would otherwise
    # silently create a dangling row that FK-constrains on next read.
    project_ids = [p.project_id for p in payload.projects]
    if project_ids:
        existing = {
            row[0]
            for row in db.query(Project.id).filter(Project.id.in_(project_ids)).all()
        }
        missing = set(project_ids) - existing
        if missing:
            raise HTTPException(422, f"Unknown project ids: {sorted(missing)}")

    db.query(ProjectTeamAssignment).filter(
        ProjectTeamAssignment.team_member_id == tm.id
    ).delete()

    # Dedupe incoming ids in case the client sends the same project twice.
    seen: set[str] = set()
    for p in payload.projects:
        if p.project_id in seen:
            continue
        seen.add(p.project_id)
        db.add(
            ProjectTeamAssignment(
                project_id=p.project_id,
                team_member_id=tm.id,
                role_on_project=p.role_on_project,
            )
        )

    db.commit()
    return _list_member_projects(db, tm.id)

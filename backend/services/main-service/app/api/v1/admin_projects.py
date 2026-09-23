"""Admin: list projects for the team-member project-picker."""
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.admin import get_admin_user
from app.models.project import Project
from app.models.user import User
from database.database import get_db

router = APIRouter(prefix="/admin/projects", tags=["admin-projects"])


class ProjectPickerItem(BaseModel):
    id: str
    slug: str
    title: str
    period: Optional[str] = None


@router.get("", response_model=List[ProjectPickerItem])
def list_projects_for_picker(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    rows = db.query(Project).order_by(Project.title.asc()).all()
    return [
        ProjectPickerItem(id=p.id, slug=p.slug, title=p.title, period=p.period)
        for p in rows
    ]

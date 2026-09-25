"""Public read-only project API. Mirrors the admin shape but hides drafts."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.models.project import Project, PublicationStatus
from app.schemas.project.responses import ProjectDetail, ProjectListItem
from database.database import get_db

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=List[ProjectListItem])
def list_published_projects(
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return (
        db.query(Project)
        .filter(Project.publication_status == PublicationStatus.published)
        .order_by(Project.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{slug}", response_model=ProjectDetail)
def get_published_project(
    slug: str,
    db: Session = Depends(get_db),
):
    p = db.query(Project).filter(Project.slug == slug).first()
    if not p or p.publication_status != PublicationStatus.published:
        raise HTTPException(404, "Project not found")
    return ProjectDetail.model_validate(p)

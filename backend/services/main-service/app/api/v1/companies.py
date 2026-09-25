from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.project import Project, PublicationStatus
from database.database import get_db

router = APIRouter(prefix="/companies", tags=["companies"])


class CompanyListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    name: str
    website: Optional[str] = None
    logotype_url: Optional[str] = None
    industry: Optional[str] = None
    project_count: int = 0


class CompanyProjectRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    slug: str
    title: str
    short_description: Optional[str] = None
    cover_image_src: str
    cover_video_src: Optional[str] = None
    period: Optional[str] = None
    is_featured: bool = False


class CompanyDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    name: str
    website: Optional[str] = None
    logotype_url: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    lifecycle_stage: Optional[str] = None
    projects: List[CompanyProjectRef] = []


@router.get("", response_model=List[CompanyListItem])
def list_companies(
    published_only: bool = Query(True),
    db: Session = Depends(get_db),
):
    q = (
        db.query(Company, func.count(Project.id).label("project_count"))
        .outerjoin(Project, Project.client_id == Company.id)
    )
    if published_only:
        q = q.filter(Project.publication_status == PublicationStatus.published)
    rows = q.group_by(Company.id).order_by(func.lower(Company.name).asc()).all()
    return [
        CompanyListItem(
            id=c.id, slug=c.slug, name=c.name, website=c.website,
            logotype_url=c.logotype_url, industry=c.industry,
            project_count=int(count or 0),
        )
        for c, count in rows
    ]


@router.get("/{slug}", response_model=CompanyDetail)
def get_company(slug: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.slug == slug).first()
    if not company:
        raise HTTPException(404, "Company not found")
    projects = (
        db.query(Project)
        .filter(
            Project.client_id == company.id,
            Project.publication_status == PublicationStatus.published,
        )
        .order_by(Project.updated_at.desc())
        .all()
    )
    return CompanyDetail(
        id=company.id, slug=company.slug, name=company.name,
        website=company.website, logotype_url=company.logotype_url,
        industry=company.industry, description=company.description,
        lifecycle_stage=(company.lifecycle_stage.value if company.lifecycle_stage else None),
        projects=[CompanyProjectRef.model_validate(p) for p in projects],
    )

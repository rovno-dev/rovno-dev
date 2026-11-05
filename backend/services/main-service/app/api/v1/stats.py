"""Public, cacheable site counters.

Backs the home page "Ровные цифры" section. Everything here is derived
from real rows - no hand-maintained numbers. Only published content is
counted, so the figure a visitor sees matches what they can actually
browse to.
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.article import Article
from app.models.company import Company
from app.models.event import Event
from app.models.project import Project, PublicationStatus
from app.models.team_member import TeamMember
from database.database import get_db

router = APIRouter(prefix="/stats", tags=["stats"])


class PublicStats(BaseModel):
    projects: int
    companies: int
    articles: int
    events: int
    team: int


@router.get("", response_model=PublicStats)
def public_stats(db: Session = Depends(get_db)):
    published = PublicationStatus.published
    return PublicStats(
        projects=db.query(func.count(Project.id))
        .filter(Project.publication_status == published)
        .scalar()
        or 0,
        companies=db.query(func.count(Company.id)).scalar() or 0,
        articles=db.query(func.count(Article.id))
        .filter(Article.publication_status == published)
        .scalar()
        or 0,
        events=db.query(func.count(Event.id))
        .filter(Event.publication_status == published)
        .scalar()
        or 0,
        team=db.query(func.count(TeamMember.id))
        .filter(TeamMember.is_active.is_(True))
        .scalar()
        or 0,
    )

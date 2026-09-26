"""Public read-only taxonomy lookups.

Both endpoints return the same shape as the admin ones, minus anything
sensitive (there isn't anything) — the frontend uses them for filter chips
and role labels.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from app.services import taxonomy_service as svc
from app.models.article_category import ArticleCategory
from app.models.project_category import ProjectCategory

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/articles")
def get_article_categories(db: Session = Depends(get_db)):
    rows = db.query(ArticleCategory).order_by(ArticleCategory.label.asc()).all()
    return [
        {"id": str(r.id), "code": r.code, "label": r.label, "labels": {"en": r.label}}
        for r in rows
    ]


@router.get("/projects")
def get_project_categories(db: Session = Depends(get_db)):
    return svc.list_categories(db)


@router.get("/roles")
def get_project_roles(db: Session = Depends(get_db)):
    return svc.list_roles(db)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from app.models.article_category import ArticleCategory
from app.models.project_category import ProjectCategory

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/articles")
def get_article_categories(db: Session = Depends(get_db)):
    return db.query(ArticleCategory).all()

@router.get("/projects")
def get_project_categories(db: Session = Depends(get_db)):
    return db.query(ProjectCategory).all()

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.presentation import Presentation
from app.schemas.presentation.responses import PresentationOut
from database.database import get_db

router = APIRouter(prefix="/presentations", tags=["presentations"])

@router.get("/{slug}", response_model=PresentationOut)
def get_public_presentation(slug: str, db: Session = Depends(get_db)):
    p = db.query(Presentation).filter(Presentation.slug == slug, Presentation.is_published == True).first()
    if not p:
        raise HTTPException(404, "Presentation not found")

    now = datetime.utcnow()
    if p.starts_at and now < p.starts_at:
        raise HTTPException(403, "Presentation is locked. Not started yet.")
    if p.ends_at and now > p.ends_at:
        raise HTTPException(403, "Presentation is locked. Ended.")
        
    return p

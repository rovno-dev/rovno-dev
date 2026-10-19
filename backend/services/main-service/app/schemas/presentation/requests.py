from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SlideIn(BaseModel):
    order: int
    type: str
    content: Dict[str, Any]
    notes: Optional[str] = None

class PresentationIn(BaseModel):
    title: str
    slug: Optional[str] = None
    description: Optional[str] = None
    event_id: Optional[str] = None
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    is_published: bool = False
    slides: List[SlideIn] = []

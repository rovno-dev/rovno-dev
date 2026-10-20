from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class SlideOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    order: int
    type: str
    content: Dict[str, Any]
    theme: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class PresentationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    title: str
    description: Optional[str] = None
    event_id: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    is_published: bool
    custom_tsx: Optional[str] = None
    slides: List[SlideOut] = []

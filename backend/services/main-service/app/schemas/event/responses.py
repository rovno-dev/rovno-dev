from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class TagRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    slug: str
    kind: str


class EventListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    slug: str
    title: str
    short_description: Optional[str] = None
    cover_image_src: str
    cover_video_src: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    location_name: Optional[str] = None
    city: Optional[str] = None
    price: Optional[str] = None
    seat_types: Optional[List[Dict[str, Any]]] = None
    # Populated by the endpoint, not a DB column: how many active
    # registrations exist for this event. `declined` and `canceled`
    # are excluded so seats freed up by cancellations become available
    # again.
    registered_count: int = 0
    registration_url: Optional[str] = None
    is_featured: bool = False
    publication_status: str
    custom_page: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    tags: List[TagRef] = []


class EventDetail(EventListItem):
    description: Optional[str] = None
    address: Optional[str] = None
    metro: Optional[str] = None
    mdx_content: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None


class EventRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    event_id: str
    name: Optional[str] = None
    surname: Optional[str] = None
    patronymic: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    telegram_username: Optional[str] = None
    age: Optional[int] = None
    status: str
    decline_reason: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

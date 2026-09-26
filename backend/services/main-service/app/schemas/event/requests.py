from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class EventCreate(BaseModel):
    slug: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=300)
    short_description: Optional[str] = Field("", max_length=400)
    description: Optional[str] = ""
    cover_image_src: Optional[str] = ""
    cover_video_src: Optional[str] = ""
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    metro: Optional[str] = None
    city: Optional[str] = "Москва"
    price: Optional[str] = None
    registration_url: Optional[str] = None
    capacity: Optional[int] = None
    custom_page: Optional[str] = None
    is_featured: Optional[bool] = False
    publication_status: Optional[str] = "draft"
    mdx_content: Optional[str] = ""
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    tags: Optional[List[str]] = None


class EventUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    short_description: Optional[str] = Field(None, max_length=400)
    description: Optional[str] = None
    cover_image_src: Optional[str] = None
    cover_video_src: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    metro: Optional[str] = None
    city: Optional[str] = None
    price: Optional[str] = None
    registration_url: Optional[str] = None
    capacity: Optional[int] = None
    custom_page: Optional[str] = None
    is_featured: Optional[bool] = None
    publication_status: Optional[str] = None
    mdx_content: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    tags: Optional[List[str]] = None


class EventRequestIn(BaseModel):
    """Public registration payload.

    Core fields are typed. Anything else the landing form wants to send
    rides in `meta` — no schema changes needed to add a field.
    """
    name: Optional[str] = Field(None, max_length=120)
    surname: Optional[str] = Field(None, max_length=120)
    patronymic: Optional[str] = Field(None, max_length=120)
    phone: Optional[str] = Field(None, max_length=40)
    email: Optional[str] = Field(None, max_length=200)
    telegram_username: Optional[str] = Field(None, max_length=80)
    age: Optional[int] = Field(None, ge=0, le=120)
    meta: Optional[Dict[str, Any]] = None


class EventRequestUpdate(BaseModel):
    status: Optional[str] = None
    decline_reason: Optional[str] = None

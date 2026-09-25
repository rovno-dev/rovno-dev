from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ProjectTagIn(BaseModel):
    kind: str = Field(..., description="from_chief | license | github | custom")
    label: str = Field(..., min_length=1, max_length=120)
    value: Optional[Any] = None
    sort_order: Optional[int] = 0


class ProjectMediaIn(BaseModel):
    type: str = Field(..., description="image | video")
    url: str
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None
    sort_order: Optional[int] = 0


class ProjectCreate(BaseModel):
    slug: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = ""
    short_description: Optional[str] = Field("", max_length=400)
    cover_image_src: Optional[str] = ""
    cover_video_src: Optional[str] = ""
    href: Optional[str] = None
    category_id: Optional[UUID] = None
    client_id: Optional[UUID] = None
    platform: Optional[str] = None
    period: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    mdx_content: Optional[str] = ""
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_featured: Optional[bool] = False
    publication_status: Optional[str] = "draft"
    tags: Optional[List[ProjectTagIn]] = None
    media: Optional[List[ProjectMediaIn]] = None


class ProjectUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=400)
    cover_image_src: Optional[str] = None
    cover_video_src: Optional[str] = None
    href: Optional[str] = None
    category_id: Optional[UUID] = None
    client_id: Optional[UUID] = None
    platform: Optional[str] = None
    period: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    mdx_content: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_featured: Optional[bool] = None
    publication_status: Optional[str] = None
    tags: Optional[List[ProjectTagIn]] = None
    media: Optional[List[ProjectMediaIn]] = None

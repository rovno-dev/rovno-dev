from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ProjectCategoryRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    code: str
    label: str


class ProjectTagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    kind: str
    label: str
    value: Optional[Any] = None
    sort_order: int


class ProjectMediaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    type: str
    url: str
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None
    sort_order: int


class ProjectListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    slug: str
    title: str
    short_description: Optional[str] = None
    cover_image_src: str
    cover_video_src: Optional[str] = None
    category: Optional[ProjectCategoryRef] = None
    period: Optional[str] = None
    is_featured: bool
    publication_status: str
    created_at: datetime
    updated_at: datetime
    tags: List[ProjectTagOut] = []


class ProjectDetail(ProjectListItem):
    description: Optional[str] = None
    href: Optional[str] = None
    client_id: Optional[UUID] = None
    platform: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    mdx_content: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    media: List[ProjectMediaOut] = []

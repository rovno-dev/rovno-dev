from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
class ArticleCreate(BaseModel):
    slug: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=300)
    description: str = Field("", max_length=1000)
    image_url: Optional[str] = ""
    date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    mdx_content: str = ""
    raw_json: Optional[Any] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    category_id: Optional[UUID] = None
    # LLM context: publication_status can be set at creation time so a single
    # POST can publish immediately ("Publish" button) or stay a draft
    # ("Save draft" button). Defaults to draft.
    publication_status: Optional[str] = "draft"
class ArticleUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = None
    date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    mdx_content: Optional[str] = None
    raw_json: Optional[Any] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    category_id: Optional[UUID] = None
    publication_status: Optional[str] = None
class ArticlePublishRequest(BaseModel):
    # Publishing without a body is fine — kept as a class for future options.
    pass

from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

class ArticleCreate(BaseModel):
    slug: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=300)
    description: str = Field("", max_length=1000)
    image_url: Optional[str] = ""
    date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    brands: Optional[List[str]] = None
    mdx_content: str = ""
    raw_json: Optional[Any] = None
    attachments: Optional[List[dict]] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    publication_status: Optional[str] = "draft"

    @field_validator("mdx_content")
    @classmethod
    def sanitize_mdx(cls, v):
        if isinstance(v, str):
            return v.replace("classname=", "className=")
        return v

class ArticleUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = None
    date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    brands: Optional[List[str]] = None
    mdx_content: Optional[str] = None
    raw_json: Optional[Any] = None
    attachments: Optional[List[dict]] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    publication_status: Optional[str] = None

    @field_validator("mdx_content")
    @classmethod
    def sanitize_mdx(cls, v):
        if isinstance(v, str):
            return v.replace("classname=", "className=")
        return v

class ArticlePublishRequest(BaseModel):
    pass

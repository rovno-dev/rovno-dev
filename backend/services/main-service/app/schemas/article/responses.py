from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ArticleAuthor(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: Optional[str] = None
    surname: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class ReviewerRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: Optional[str] = None
    username: Optional[str] = None


class TagRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    slug: str


class ArticleListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    title: str
    description: str
    image_url: str
    date: datetime
    tags: Optional[List[TagRef]] = None
    publication_status: str
    review_note: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[ReviewerRef] = None
    author_id: Optional[UUID] = None
    author: Optional[ArticleAuthor] = None
    created_at: datetime
    updated_at: datetime


class ArticleResponse(ArticleListItem):
    mdx_content: str
    raw_json: Optional[Any] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None


class AdminArticleListItem(ArticleListItem):
    """Admin list adds a couple of derived fields the reviewer needs."""
    is_team_author: bool = False
    is_pending: bool = False

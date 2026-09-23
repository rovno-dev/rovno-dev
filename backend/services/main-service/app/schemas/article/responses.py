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
class ArticleCategoryRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    code: str
    label: str
class ArticleListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    title: str
    description: str
    image_url: str
    date: datetime
    tags: Optional[List[str]] = None
    publication_status: str
    category_id: Optional[UUID] = None
    category: Optional[ArticleCategoryRef] = None
    author_id: Optional[UUID] = None
    author: Optional[ArticleAuthor] = None
    created_at: datetime
    updated_at: datetime
class ArticleResponse(ArticleListItem):
    # mdx_content and raw_json are only returned on the detail endpoint
    mdx_content: str
    raw_json: Optional[Any] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None

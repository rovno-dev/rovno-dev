from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[UUID] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[UUID] = None

class CategoryResponse(CategoryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CategoryWithChildren(CategoryResponse):
    children: List["CategoryResponse"] = []

    class Config:
        from_attributes = True

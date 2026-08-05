from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class ProductImageBase(BaseModel):
    image_url: str
    is_cover: bool = False
    order: int = 0

class ProductImageCreate(ProductImageBase):
    product_id: UUID

class ProductImageUpdate(BaseModel):
    image_url: Optional[str] = None
    is_cover: Optional[bool] = None
    order: Optional[int] = None

class ProductImageResponse(ProductImageBase):
    id: UUID
    product_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

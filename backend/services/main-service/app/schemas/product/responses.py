from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel

from app.schemas.user.response import UserResponse
from app.schemas.pagination.const import Pagination
from app.schemas.product_image import ProductImageResponse
from app.schemas.category import CategoryResponse

class ProductResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    price: Decimal
    status: str
    category_id: Optional[UUID] = None
    category: Optional[CategoryResponse] = None
    images: List[ProductImageResponse] = []
    creator: UserResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    paginate: Pagination

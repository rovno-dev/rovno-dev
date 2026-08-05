from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from uuid import UUID

class CreateProduct(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    status: Optional[str] = "draft"
    category_id: Optional[UUID] = None

class UpdateProduct(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    status: Optional[str] = None
    category_id: Optional[UUID] = None

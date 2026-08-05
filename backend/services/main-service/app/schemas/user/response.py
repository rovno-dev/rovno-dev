from app.models.user import User
from pydantic import BaseModel, ConfigDict
from uuid import UUID

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str | None
    phone: str | None
    blocked: bool

class UserCreateResponse(BaseModel):
    created: bool
    errors: dict | None
    user: UserResponse | None
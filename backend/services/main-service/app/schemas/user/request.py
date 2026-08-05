from pydantic import BaseModel

class UserCreate(BaseModel):
    phone: str | None
    email: str | None
    password: str | None
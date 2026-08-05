from fastapi import APIRouter
from fastapi.params import Depends
from app.schemas.user.response import UserResponse
from app.shared.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users")  # added prefix

@router.get("/me")
async def me(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    return UserResponse.model_validate(current_user)

from fastapi import APIRouter
from app.api.v1 import products, auth, users

router = APIRouter(prefix="/api/main/v1")

router.include_router(auth.router)
router.include_router(products.router)
router.include_router(users.router)
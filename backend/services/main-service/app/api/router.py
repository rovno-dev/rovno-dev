from fastapi import APIRouter
from app.api.v1 import orders
router = APIRouter(prefix="/api/main/v1")
router.include_router(orders.router)

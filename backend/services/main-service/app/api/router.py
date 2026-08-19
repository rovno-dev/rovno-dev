from fastapi import APIRouter
from app.api.v1 import auth
from app.api.v1 import admin
from app.api.v1 import me
from app.api.v1 import categories
from app.api.v1 import orders

router = APIRouter(prefix="/v1")
router.include_router(auth.router)
router.include_router(admin.router)
router.include_router(me.router)
router.include_router(categories.router)
router.include_router(orders.router)

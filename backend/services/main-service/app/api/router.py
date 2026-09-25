from fastapi import APIRouter
from app.api.v1 import auth
from app.api.v1 import admin
from app.api.v1 import admin_articles
from app.api.v1 import admin_projects
from app.api.v1 import admin_team
from app.api.v1 import me
from app.api.v1 import categories
from app.api.v1 import clients
from app.api.v1 import mentions
from app.api.v1 import orders
from app.api.v1 import articles
from app.api.v1 import projects
from app.api.v1 import uploads
from app.api.v1 import tags
from app.api.v1 import team

router = APIRouter(prefix="/v1")
router.include_router(auth.router)
router.include_router(admin.router)
router.include_router(admin_articles.router)
router.include_router(admin_projects.router)
router.include_router(admin_team.router)
router.include_router(me.router)
router.include_router(categories.router)
router.include_router(clients.router)
router.include_router(mentions.router)
router.include_router(orders.router)
router.include_router(articles.router)
router.include_router(projects.router)
router.include_router(uploads.router)
router.include_router(tags.router)
router.include_router(team.router)

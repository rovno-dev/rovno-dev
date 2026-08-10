from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging
from app.api.router import router
from config.rate_limiter import global_rate_limit
from config.logging import setup_logging
setup_logging()
logger = logging.getLogger(__name__)
logger.info("Starting main service")
app = FastAPI(
    title="Main Service",
    version="1.0.0",
)
# ponytail: restrict origins to prevent CSRF-like exploits on authenticated endpoints
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost")
origins = [origin.strip() for origin in raw_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(global_rate_limit)
app.include_router(router)
storage_dir = os.path.join(os.getcwd(), "storage", "public")
os.makedirs(storage_dir, exist_ok=True)
app.mount("/storage", StaticFiles(directory=storage_dir), name="storage")
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "main-service",
    }

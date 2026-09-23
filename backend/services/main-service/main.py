import os
import re
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
from config.rate_limiter import global_rate_limit
from config.logging import setup_logging

setup_logging()
logger = logging.getLogger(__name__)
logger.info("Starting main service")

app = FastAPI(title="Main Service", version="1.0.0", root_path="/api")

# LLM context: ALLOWED_ORIGINS accepts exact origins AND wildcards like
# "https://*.rovno.dev". Wildcard entries collapse into a single
# allow_origin_regex so any subdomain (app.*, admin.*, i.*) passes CORS.
# Without this, authenticated XHRs from subdomains are rejected by the
# browser's preflight even though the auth cookie is present.
raw_origins = os.getenv("ALLOWED_ORIGINS", "")
entries = [o.strip() for o in raw_origins.split(",") if o.strip()]
exact_origins: list[str] = []
wildcard_patterns: list[str] = []
for entry in entries:
    if "*" in entry:
        # re.escape then un-escape the wildcard character.
        pattern = re.escape(entry).replace(r"\*", ".*")
        wildcard_patterns.append(pattern)
    else:
        exact_origins.append(entry)

allow_origin_regex = (
    "|".join(f"^{p}$" for p in wildcard_patterns) if wildcard_patterns else None
)

logger.info(
    "CORS: exact=%s wildcard_regex=%s",
    exact_origins,
    allow_origin_regex,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=exact_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(global_rate_limit)
app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "main-service"}

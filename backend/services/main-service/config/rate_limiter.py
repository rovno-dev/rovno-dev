import time
from typing import Awaitable, Callable
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.responses import Response
from database.cache import cache_client
GLOBAL_LIMIT = 200
GLOBAL_WINDOW_SECONDS = 60
def get_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
async def global_rate_limit(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    # ponytail: Use Redis for global rate limiting to support multiple workers and persist across restarts
    ip = get_client_ip(request)
    key = f"rate_limit:{ip}"
    try:
        # Atomic increment and expire check
        current_count = cache_client.incr(key)
        if current_count == 1:
            cache_client.expire(key, GLOBAL_WINDOW_SECONDS)
        if current_count > GLOBAL_LIMIT:
            ttl = cache_client.ttl(key)
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": str(ttl)},
                content={
                    "detail": "Global request limit exceeded",
                    "retry_after": ttl,
                },
            )
    except Exception as e:
        # If cache is down, we allow the request but log the error
        print(f"[ERROR] Rate limiter cache error: {e}")
    return await call_next(request)

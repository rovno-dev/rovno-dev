import time
from collections import defaultdict, deque
from typing import Awaitable, Callable

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.responses import Response

# Increase limits for development
GLOBAL_LIMIT = 200  # was 100
GLOBAL_WINDOW_SECONDS = 60

EMAIL_LOGIN_COOLDOWN_SECONDS = 5  # was 30

global_request_history: dict[str, deque[float]] = defaultdict(deque)
last_request_at: dict[str, float] = defaultdict(float)

def get_client_ip(request: Request) -> str:
    """
    Берёт реальный IP, который Nginx передаёт в X-Forwarded-For.
    Если запрос идёт без Nginx — использует request.client.host.
    """
    forwarded_for = request.headers.get("x-forwarded-for")

    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    if request.client:
        return request.client.host

    return "unknown"

async def global_rate_limit(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    """
    Лимит: максимум 200 запросов за последние 60 секунд на один IP.
    """
    ip = get_client_ip(request)

    now = time.monotonic()
    history = global_request_history[ip]

    # Удаляем запросы старше минуты.
    while history and now - history[0] >= GLOBAL_WINDOW_SECONDS:
        history.popleft()

    # Если лимит исчерпан — сообщаем, сколько ждать.
    if len(history) >= GLOBAL_LIMIT:
        retry_after = max(
            1,
            int(history[0] + GLOBAL_WINDOW_SECONDS - now + 0.999),
        )

        return JSONResponse(
            status_code=429,
            headers={"Retry-After": str(retry_after)},
            content={
                "detail": "Global request limit exceeded",
                "retry_after": retry_after,
                "seconds_until_retry": retry_after,
            },
        )

    # Учитываем текущий запрос.
    history.append(now)

    return await call_next(request)

async def limit_otp_send(request: Request) -> None:
    """
    один успешный запрос раз в 5 секунд на IP.
    """
    ip = get_client_ip(request)
    key = f"{ip}:{request.url.path}"

    now = time.monotonic()
    last_time = last_request_at[key]

    elapsed = now - last_time
    remaining = EMAIL_LOGIN_COOLDOWN_SECONDS - elapsed

    if remaining > 0:
        retry_after = max(1, int(remaining + 0.999))

        raise HTTPException(
            status_code=429,
            detail={
                "message": "Too many requests for this endpoint",
                "retry_after": retry_after,
                "seconds_until_retry": retry_after,
            },
            headers={"Retry-After": str(retry_after)},
        )

    last_request_at[key] = now

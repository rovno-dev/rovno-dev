import random
import json
import logging
from datetime import datetime, timedelta
from database.cache import cache_client

logger = logging.getLogger(__name__)

OTP_TTL_SECONDS = 300


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def save_otp(identifier: str, code: str) -> bool:
    key = f"otp:{identifier}"
    data = {"code": code, "created_at": datetime.utcnow().isoformat()}
    try:
        cache_client.setex(key, OTP_TTL_SECONDS, json.dumps(data))
        return True
    except Exception as e:
        # ponytail: keep returning a bool so callers stay simple, but log the
        # real exception so `docker compose logs main-service` shows WHY.
        logger.error(f"OTP save failed for {identifier}: {e}", exc_info=True)
        return False


def verify_otp(identifier: str, code: str) -> bool:
    key = f"otp:{identifier}"
    try:
        stored = cache_client.get(key)
    except Exception as e:
        logger.error(f"OTP read failed for {identifier}: {e}", exc_info=True)
        return False
    if not stored:
        return False
    try:
        data = json.loads(stored)
        if data.get("code") == code:
            cache_client.delete(key)
            return True
    except Exception as e:
        logger.error(f"OTP parse failed for {identifier}: {e}", exc_info=True)
    return False

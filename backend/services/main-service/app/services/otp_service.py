# app/services/otp_service.py
import random
import json
from datetime import datetime, timedelta
from database.cache import cache_client
import re
import phonenumbers
from phonenumbers import NumberParseException

OTP_TTL_SECONDS = 300

def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def save_otp(identifier: str, code: str, otp_type: str = "login") -> bool:
    """
    Сохраняет OTP в Valkey с TTL 5 минут.
    identifier: телефон или email
    """
    key = f"otp:{identifier}"
    data = {
        "code": code,
        "type": otp_type,
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        cache_client.setex(key, OTP_TTL_SECONDS, json.dumps(data))
        return True
    except Exception as e:
        print(f"❌ Cache error saving OTP: {e}")
        return False


def parse_and_normalize_login(login: str) -> tuple[str, str]:
    """
    Determines login type ('email' or 'phone') and normalizes it.
    Raises ValueError if format is invalid.
    """
    login_clean = login.strip()

    if "@" in login_clean:
        if re.match(r"[^@]+@[^@]+\.[^@]+", login_clean):
            return "email", login_clean.lower()
        raise ValueError("Invalid email format")

    try:
        parsed = phonenumbers.parse(login_clean, "RU")
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError("Invalid phone number")

        normalized_phone = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        return "phone", normalized_phone
    except NumberParseException:
        raise ValueError("Login must be a valid email or phone number")

def verify_otp(identifier: str, code: str) -> bool:
    """
    Проверяет код в Valkey по ключу "otp:{identifier}"
    и удаляет его при успешном совпадении.
    """
    key = f"otp:{identifier}"
    stored_data = cache_client.get(key)

    if not stored_data:
        return False

    try:
        data = json.loads(stored_data)
    except json.JSONDecodeError:
        return False

    if data.get("code") == code:
        cache_client.delete(key)
        return True

    return False

def delete_otp(identifier: str):
    """Принудительное удаление (например, при смене номера)"""
    cache_client.delete(f"otp:{identifier}")

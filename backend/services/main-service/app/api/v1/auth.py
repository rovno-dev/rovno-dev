from fastapi import APIRouter, HTTPException, status
from fastapi.params import Depends
from sqlalchemy.orm import Session
from uuid import UUID
import logging

from app.models.user import User
from app.schemas.auth.requests import EmailLoginRequest, RegisterViaEmailRequest, OTPConfirmRequest, EmailPasswordLoginRequest
from app.schemas.auth.requests import RegisterViaPhoneRequest
from app.schemas.auth.requests import SmsLoginRequest
from app.schemas.auth.responses import EmailSendCode
from app.schemas.token.responses import TokenResponse, AccessTokenResponse
from app.services.email_service import send_email
from app.services.sms_service import send_sms
from app.services.otp_service import generate_otp, save_otp, verify_otp, parse_and_normalize_login
from app.services.user_service import create_user
from app.shared.auth import create_access_token, create_refresh_token, decode_token, verify_password, hash_password
from config.rate_limiter import limit_otp_send
from database.database import get_db
from app.schemas.auth.responses import PhoneSendCode
from app.schemas.token.request import RefreshTokenRequest
from sqlalchemy import or_

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/login/email")
async def email_login(
        payload: EmailLoginRequest,
        db: Session = Depends(get_db),
        _: None = Depends(limit_otp_send),
) -> EmailSendCode:
    email_clean = payload.email.lower().strip()

    user_found = db.query(User).filter(User.email == email_clean).first()

    if not user_found:
        create_response = create_user(db, email=email_clean)

        if not create_response.created:
            raise HTTPException(
                status_code=400,
                detail=create_response.errors or "Failed to create user"
            )

        user_found = create_response.user

    code = generate_otp()
    saved = save_otp(email_clean, code, "reg_email")

    if not saved:
        raise HTTPException(status_code=503, detail="OTP storage unavailable")

    subject = "Login code" if user_found else "Registration code"
    sent = await send_email(email_clean, subject, code)

    return EmailSendCode(sent=sent, user_exists=bool(user_found))


@router.post("/login/phone")
async def phone_login(
    payload: SmsLoginRequest,
    db: Session = Depends(get_db),
    _: None = Depends(limit_otp_send),
) -> PhoneSendCode:
    phone_clean = str(payload.phone).strip()

    user_found = db.query(User).filter(User.phone == phone_clean).first()

    if not user_found:
        create_response = create_user(db, phone=phone_clean)

        if not create_response.created:
            raise HTTPException(
                status_code=400,
                detail=create_response.errors or "Failed to create user"
            )

        user_found = create_response.user

    code = generate_otp()
    saved = save_otp(phone_clean, code, "reg_phone")

    if not saved:
        raise HTTPException(status_code=503, detail="OTP storage unavailable")

    sent = await send_sms(phone_clean, f"Registration code {code}")

    return PhoneSendCode(sent=sent, user_exists=bool(user_found))


@router.post("/login/email-password")
async def email_password_login(
    payload: EmailPasswordLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    email_clean = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.blocked:
        raise HTTPException(status_code=403, detail="User is blocked")

    return TokenResponse(
        access_token=create_access_token({"sub": str(user.id)}),
        refresh_token=create_refresh_token({"sub": str(user.id)}),
        token_type="bearer",
    )

@router.post(
    "/otp",
    summary="Confirm OTP",
    description="Accepts JSON with login and code and verifies it in Valkey"
)
async def confirm_otp(
    payload: OTPConfirmRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    try:
        login_type, normalized_login = parse_and_normalize_login(payload.login)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    if login_type == "email":
        user = db.query(User).filter(User.email == normalized_login).first()
    else:
        user = db.query(User).filter(User.phone == normalized_login).first()

    if not user:
        if login_type == "email":
            create_response = create_user(db, email=normalized_login)
        else:
            create_response = create_user(db, phone=normalized_login)

        if not create_response.created:
            raise HTTPException(
                status_code=400,
                detail=create_response.errors or "Failed to create user"
            )

        user = create_response.user

    if not verify_otp(normalized_login, payload.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired code"
        )

    return TokenResponse(
        access_token=create_access_token({"sub": str(user.id)}),
        refresh_token=create_refresh_token({"sub": str(user.id)}),
        token_type="bearer",
    )


@router.post("/register/phone")
async def registerViaPhone(
    phone: RegisterViaPhoneRequest,
    db: Session = Depends(get_db)
):
    result = create_user(db=db, **phone.model_dump())

    if result.errors:
        raise HTTPException(status_code=422, detail=result.errors)

    access_token = create_access_token(
        data={"sub": str(result.user.id)}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(result.user.id)}
    )

    logger.info(f"Registration phone: access_token={access_token[:10]}..., refresh_token={refresh_token[:10]}...")
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/register/email")
async def registerViaEmail(
    email: RegisterViaEmailRequest,
    db: Session = Depends(get_db)
):
    result = create_user(db=db, **email.model_dump())

    if result.errors:
        raise HTTPException(status_code=422, detail=result.errors)

    access_token = create_access_token(
        data={"sub": str(result.user.id)}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(result.user.id)}
    )

    logger.info(f"Registration email: access_token={access_token[:10]}..., refresh_token={refresh_token[:10]}...")
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_access_token(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> AccessTokenResponse:
    logger.info(f"Refresh token request: {payload.refresh_token[:10]}...")
    token_data = decode_token(payload.refresh_token)
    logger.info(f"Decoded token data: {token_data}")

    if token_data is None or token_data.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    try:
        user_id = UUID(token_data["sub"])
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user = db.get(User, user_id)
    if user is None or user.blocked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or blocked",
        )

    return AccessTokenResponse(
        access_token=create_access_token({"sub": str(user.id)}),
    )

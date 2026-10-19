from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
import logging
from app.models.user import User
from app.models.user_session import UserSession
from app.schemas.auth.requests import (
    RegisterEmailRequest,
    VerifyEmailRequest,
    EmailPasswordLoginRequest,
    RefreshTokenRequest,
    ResendVerificationRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
import pyotp
from app.schemas.auth.responses import TokenResponse, AccessTokenResponse, EmailSendCodeResponse
from app.services.email_service import send_email
from app.services.otp_service import generate_otp, save_otp, verify_otp
from app.services.user_service import create_user, get_user_by_email, set_user_verified
from app.shared.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
    get_current_user,
)
from config.rate_limiter import limit_otp_send
from database.database import get_db
from uuid import UUID

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register/email")
async def register_email(
    request: Request,
    payload: RegisterEmailRequest,
    db: Session = Depends(get_db),
    _: None = Depends(limit_otp_send),
) -> EmailSendCodeResponse:
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=422, detail="Email already registered")
    user = create_user(db, payload.email, payload.password, verified=False)
    logger.info(f"User created: {user.id} with email {user.email}")

    code = generate_otp()
    if not save_otp(payload.email, code):
        logger.error(f"OTP storage failed for {payload.email}")
        raise HTTPException(status_code=503, detail="OTP storage unavailable")

    sent = await send_email(payload.email, code, lang=payload.lang)
    if not sent:
        logger.error(f"Verification email failed to send for {payload.email}")
        raise HTTPException(
            status_code=502,
            detail="Could not send verification email. Check server logs.",
        )
    return EmailSendCodeResponse(sent=True)

@router.post("/verify-email")
async def verify_email(
    payload: VerifyEmailRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.verified:
        raise HTTPException(status_code=400, detail="User already verified")
    if not verify_otp(payload.email, payload.code):
        raise HTTPException(status_code=401, detail="Invalid or expired code")
    user = set_user_verified(db, user)
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/forgot-password")
async def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
    _: None = Depends(limit_otp_send),
):
    user = get_user_by_email(db, payload.email)
    if not user:
        # Prevent email enumeration
        return {"message": "If the email exists, a reset code has been sent."}

    code = generate_otp()
    if not save_otp(f"reset:{payload.email}", code):
        raise HTTPException(503, "OTP storage unavailable")
    
    from app.services.email_service import send_email
    sent = await send_email(payload.email, code, lang=payload.lang)
    if not sent:
        raise HTTPException(502, "Could not send email")
    
    return {"message": "Reset code sent"}

@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(404, "User not found")

    if not verify_otp(f"reset:{payload.email}", payload.code):
        raise HTTPException(401, "Invalid or expired code")

    from app.shared.auth import hash_password
    user.password = hash_password(payload.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.post("/login/email")
async def login_email_password(
    request: Request,
    payload: EmailPasswordLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = get_user_by_email(db, payload.email)
    if not user:
        logger.warning(f"Login attempt with non-existent email: {payload.email}")
        return JSONResponse(
            status_code=401,
            content={"message": "Invalid email or password"}
        )
    if not verify_password(payload.password, user.password):
        logger.warning(f"Password mismatch for email: {payload.email}")
        return JSONResponse(
            status_code=401,
            content={"message": "Invalid email or password"}
        )
    if user.blocked:
        logger.warning(f"Login attempt for blocked user: {payload.email}")
        return JSONResponse(
            status_code=403,
            content={"message": "User is blocked"}
        )
    if not user.verified:
        logger.info(f"Login attempt for unverified user: {payload.email} – returning 403")
        return JSONResponse(
            status_code=403,
            content={"message": "User not verified"}
        )
    # Create a session record
    user_agent = request.headers.get("user-agent", "Unknown")
    ip_addr = request.client.host if request.client else "Unknown"
    session = UserSession(user_id=user.id, user_agent=user_agent, ip_address=ip_addr)
    db.add(session)
    db.commit()

    access_token = create_access_token({"sub": str(user.id), "sid": str(session.id)})
    refresh_token = create_refresh_token({"sub": str(user.id), "sid": str(session.id)})
    logger.info(f"Successful login for user: {payload.email}")
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/2fa/setup")
async def setup_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if getattr(current_user, "totp_enabled", False):
        raise HTTPException(400, "2FA is already enabled")
    
    secret = pyotp.random_base32()
    current_user.totp_secret = secret
    db.commit()

    provisioning_uri = pyotp.TOTP(secret).provisioning_uri(
        name=current_user.email, issuer_name="Rovno.dev"
    )
    return {"secret": secret, "uri": provisioning_uri}

@router.post("/2fa/enable")
async def enable_2fa(
    code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.totp_secret:
        raise HTTPException(400, "Setup 2FA first")
    
    totp = pyotp.TOTP(current_user.totp_secret)
    if not totp.verify(code):
        raise HTTPException(401, "Invalid code")

    current_user.totp_enabled = True
    db.commit()
    return {"message": "2FA enabled successfully"}

@router.post("/2fa/disable")
async def disable_2fa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.totp_enabled = False
    current_user.totp_secret = None
    db.commit()
    return {"message": "2FA disabled successfully"}

@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_access_token(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> AccessTokenResponse:
    token_data = decode_token(payload.refresh_token)
    if not token_data or token_data.get("type") != "refresh":
        return JSONResponse(status_code=401, content={"message": "Invalid or expired refresh token"})
    try:
        user_id = UUID(token_data["sub"])
    except (KeyError, ValueError):
        return JSONResponse(status_code=401, content={"message": "Invalid refresh token"})
    user = db.get(User, user_id)
    if user is None or user.blocked:
        return JSONResponse(status_code=401, content={"message": "User not found or blocked"})
    new_access = create_access_token({"sub": str(user.id)})
    return AccessTokenResponse(access_token=new_access)

@router.post("/logout")
async def logout(
    payload: RefreshTokenRequest,
    current_user: User = Depends(get_current_user),
):
    token_data = decode_token(payload.refresh_token)
    if not token_data or token_data.get("type") != "refresh" or token_data.get("sub") != str(current_user.id):
        return JSONResponse(status_code=400, content={"message": "Invalid refresh token"})
    
    sid = token_data.get("sid")
    if sid:
        from uuid import UUID
        session = db.get(UserSession, UUID(sid))
        if session:
            db.delete(session)
            db.commit()

    return JSONResponse(status_code=200, content={"message": "Logged out"})

@router.post("/resend-verification")
async def resend_verification(
    request: Request,
    payload: ResendVerificationRequest,
    db: Session = Depends(get_db),
    _: None = Depends(limit_otp_send),
) -> EmailSendCodeResponse:
    user = get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.verified:
        raise HTTPException(status_code=400, detail="User already verified")

    code = generate_otp()
    if not save_otp(payload.email, code):
        logger.error(f"OTP storage failed for {payload.email}")
        raise HTTPException(status_code=503, detail="OTP storage unavailable")

    sent = await send_email(payload.email, code, lang=payload.lang)
    if not sent:
        logger.error(f"Verification email failed to send for {payload.email}")
        raise HTTPException(
            status_code=502,
            detail="Could not send verification email. Check server logs.",
        )
    return EmailSendCodeResponse(sent=True)

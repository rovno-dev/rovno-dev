from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterEmailRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    # ponytail: language preference drives the OTP email template. Defaults to ru
    # so existing clients that don't send it keep working unchanged.
    lang: str = Field("ru")

    @field_validator('password')
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)


class EmailPasswordLoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr
    lang: str = Field("ru")

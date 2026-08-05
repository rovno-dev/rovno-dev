from pydantic import BaseModel

class EmailSendCode(BaseModel):
    sent: bool
    user_exists: bool

class PhoneSendCode(BaseModel):
    sent: bool
    user_exists: bool

class SmsSendCode(BaseModel):
    sent: bool

class TokenResponse(BaseModel):
    token: str
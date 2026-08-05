from typing import Annotated, Union
from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic_extra_types.phone_numbers import PhoneNumber, PhoneNumberValidator

E164Phone = Annotated[
    Union[str, PhoneNumber],
    PhoneNumberValidator(default_region="RU", number_format="E164")
]


class EmailLoginRequest(BaseModel):
    email: EmailStr


class EmailConfirmRequest(BaseModel):
    code: str


class SmsLoginRequest(BaseModel):
    phone: E164Phone = Field(
        description="Номер телефона. Принимает любые форматы, в БД сохраняет +79991234567"
    )


class SmsConfirmRequest(BaseModel):
    code: str


class RegisterViaPhoneRequest(BaseModel):
    phone: E164Phone = Field(description="Номер телефона")
    password: str = Field(min_length=8, description="Минимум 8 символов")

    @field_validator('password')
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        if not any(char.isdigit() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну цифру')
        if not any(char.isupper() for char in v):
            raise ValueError('Пароль должен содержать хотя бы одну заглавную букву')
        return v


class EmailPasswordLoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterViaEmailRequest(BaseModel):
    email: EmailStr
    password: str

class OTPConfirmRequest(BaseModel):
    login: str = Field(description="Email или телефон в любом формате")
    code: str = Field(min_length=6, max_length=6, description="6-значный код")

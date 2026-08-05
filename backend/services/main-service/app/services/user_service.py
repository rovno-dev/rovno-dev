from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user.response import UserCreateResponse
from app.shared.auth import hash_password


def create_user(
    db: Session,
    **kwargs
) -> UserCreateResponse:
    phone = kwargs.get("phone")
    email = kwargs.get("email")
    password = kwargs.get("password")

    # Проверяем обязательность наличия хотя бы одного из параметров: phone или email
    if not any([phone, email]):
        raise ValueError("Either email or phone is required")
    
    errors = {}

    # Отдельная проверка существования пользователя с данным номером телефона
    if phone:
        existing_phone_user = db.query(User).filter(User.phone == phone).first()
        if existing_phone_user:
            errors["phone"] = "User with this phone already exists"

    # Отдельная проверка существования пользователя с данной электронной почтой
    if email:
        existing_email_user = db.query(User).filter(User.email == email).first()
        if existing_email_user:
            errors["email"] = "User with this email already exists"

    # Если найдены ошибки - прерываем создание пользователя
    if errors:
        return UserCreateResponse(
            created=False,
            errors=errors,
            user=None
        )

    # Хешируем пароль перед сохранением
    if password:
        kwargs["password"] = hash_password(password)

    # Создаем нового пользователя
    new_user = User(**kwargs)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserCreateResponse(
        created=True,
        errors=None,
        user=new_user
    )
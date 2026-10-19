from sqlalchemy.orm import Session
from app.models.user import User
from app.shared.auth import hash_password
import logging
import re
import random

logger = logging.getLogger(__name__)

def create_user(db: Session, email: str, password: str, verified: bool = False) -> User:
    hashed = hash_password(password)
    local_part = email.split('@')[0]
    
    # Generate username: local part + 5 random digits
    clean_username = re.sub(r'[^A-Za-z0-9_]', '', local_part)
    if not clean_username:
        clean_username = "user"
        
    username = f"{clean_username}{random.randint(10000, 99999)}"
    
    # Ensure the generated username is unique
    while db.query(User).filter(User.username == username).first():
        username = f"{clean_username}{random.randint(10000, 99999)}"

    user = User(
        email=email.lower(),
        password=hashed,
        verified=verified,
        name=local_part,
        surname="",
        username=username
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"Created user: {user.id} with email {user.email} and username {user.username}")
    return user

def get_user_by_email(db: Session, email: str) -> User | None:
    lower_email = email.lower()
    logger.info(f"Looking for user with email: {lower_email}")
    user = db.query(User).filter(User.email == lower_email).first()
    if user:
        logger.info(f"Found user: {user.id} with email {user.email}")
    else:
        logger.warning(f"No user found for email {lower_email}")
    return user

def set_user_verified(db: Session, user: User) -> User:
    user.verified = True
    db.commit()
    db.refresh(user)
    return user

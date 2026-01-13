from sqlalchemy.orm import Session
from typing import Optional
from app.models.user import User
from app.utils.security import hash_password, verify_password


def create_user(db: Session, email: str, password: str) -> User:
    """Create a new user with hashed password"""
    password_hash = hash_password(password)
    user = User(email=email, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by their email address"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get a user by their ID"""
    return db.query(User).filter(User.id == user_id).first()

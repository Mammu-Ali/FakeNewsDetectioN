from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from app.db import crud, schemas
from app.db.database import get_db
from app.core.config import settings
import jwt
import datetime

router = APIRouter()


def _create_token(user_id: str, email: str, role: str) -> str:
    """Create a signed JWT token valid for 7 days."""
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": now + datetime.timedelta(days=7),
        "iat": now,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, request.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_create = schemas.UserCreate(
        name=request.name,
        email=request.email,
        password=request.password,
        role="user"
    )
    new_user = crud.create_user(db, user_create)
    token = _create_token(new_user.id, new_user.email, new_user.role)

    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "Registration successful",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    if not request.email or not request.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    user = crud.get_user_by_email(db, request.email)
    if not user or not crud.verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = _create_token(user.id, user.email, user.role)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

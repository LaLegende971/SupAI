from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from pydantic import BaseModel
from database import get_session
from models import User
from auth import (
    verify_password, create_access_token, create_refresh_token,
    decode_token, get_current_user, REFRESH_TOKEN_EXPIRE_DAYS,
)

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "supai_refresh"
COOKIE_MAX_AGE = REFRESH_TOKEN_EXPIRE_DAYS * 86400


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class MeResponse(BaseModel):
    username: str
    is_active: bool


@router.post("/login", response_model=TokenResponse)
async def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(select(User).where(User.username == form.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte désactivé")

    refresh_token = create_refresh_token(user.username)
    response.set_cookie(
        key=COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=COOKIE_MAX_AGE,
        path="/api/v1/auth",
    )
    return TokenResponse(
        access_token=create_access_token(user.username),
        username=user.username,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    response: Response,
    supai_refresh: Optional[str] = Cookie(default=None),
    db: AsyncSession = Depends(get_session),
):
    exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expirée")
    if not supai_refresh:
        raise exc
    username = decode_token(supai_refresh, "refresh")
    if not username:
        raise exc
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise exc

    new_refresh = create_refresh_token(user.username)
    response.set_cookie(
        key=COOKIE_NAME,
        value=new_refresh,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=COOKIE_MAX_AGE,
        path="/api/v1/auth",
    )
    return TokenResponse(
        access_token=create_access_token(user.username),
        username=user.username,
    )


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/api/v1/auth")
    return {"status": "ok"}


@router.get("/me", response_model=MeResponse)
async def me(user: User = Depends(get_current_user)):
    return MeResponse(username=user.username, is_active=user.is_active)

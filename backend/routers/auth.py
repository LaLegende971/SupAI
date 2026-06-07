from fastapi import APIRouter, Depends, HTTPException, Request, status, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter
from slowapi.util import get_remote_address
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
from audit import log_action

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)

COOKIE_NAME = "supai_refresh"
COOKIE_MAX_AGE = REFRESH_TOKEN_EXPIRE_DAYS * 86400


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str


class MeResponse(BaseModel):
    username: str
    role: str
    is_active: bool


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(select(User).where(User.username == form.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form.password, user.hashed_password):
        await log_action(db, "AUTH_LOGIN_FAILURE", request=request,
                         username=form.username, resource_type="auth", success=False,
                         details="Identifiants invalides")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")

    if not user.is_active:
        await log_action(db, "AUTH_LOGIN_FAILURE", request=request,
                         username=form.username, resource_type="auth", success=False,
                         details="Compte désactivé")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte désactivé")

    refresh_token = create_refresh_token(user.username)
    response.set_cookie(
        key=COOKIE_NAME, value=refresh_token,
        httponly=True, secure=True, samesite="strict",
        max_age=COOKIE_MAX_AGE, path="/api/v1/auth",
    )
    await log_action(db, "AUTH_LOGIN", request=request,
                     username=user.username, resource_type="auth", success=True)
    return TokenResponse(access_token=create_access_token(user.username), username=user.username, role=user.role)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
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
        key=COOKIE_NAME, value=new_refresh,
        httponly=True, secure=True, samesite="strict",
        max_age=COOKIE_MAX_AGE, path="/api/v1/auth",
    )
    return TokenResponse(access_token=create_access_token(user.username), username=user.username, role=user.role)


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    response.delete_cookie(key=COOKIE_NAME, path="/api/v1/auth")
    await log_action(db, "AUTH_LOGOUT", request=request,
                     username=current_user.username, resource_type="auth", success=True)
    return {"status": "ok"}


@router.get("/me", response_model=MeResponse)
async def me(user: User = Depends(get_current_user)):
    return MeResponse(username=user.username, role=user.role, is_active=user.is_active)

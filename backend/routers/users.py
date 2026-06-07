from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_session
from models import User
from auth import hash_password, get_current_user, require_admin
from audit import log_action

router = APIRouter(prefix="/users", tags=["users"])

VALID_ROLES = {"admin", "viewer"}


class UserOut(BaseModel):
    id: str
    username: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "viewer"

    @field_validator("role")
    @classmethod
    def check_role(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(f"Rôle invalide. Valeurs acceptées : {VALID_ROLES}")
        return v


class UserUpdate(BaseModel):
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("role")
    @classmethod
    def check_role(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_ROLES:
            raise ValueError(f"Rôle invalide. Valeurs acceptées : {VALID_ROLES}")
        return v


@router.get("/", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_session),
    _: User = Depends(require_admin),
):
    result = await db.execute(select(User).order_by(User.username))
    return result.scalars().all()


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    existing = await db.execute(select(User).where(User.username == body.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà utilisé")
    user = User(
        username=body.username,
        hashed_password=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    await log_action(
        db, "USER_CREATE", request=request,
        username=current_user.username,
        resource_type="user", resource_id=user.id, resource_name=user.username,
    )
    return user


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    body: UserUpdate,
    request: Request,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if user.username == "admin":
        if body.is_active is False:
            raise HTTPException(status_code=400, detail="Impossible de désactiver le compte admin")
        if body.role is not None and body.role != "admin":
            raise HTTPException(status_code=400, detail="Impossible de changer le rôle du compte admin")

    if body.password:
        user.hashed_password = hash_password(body.password)
    if body.role is not None:
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active

    await db.commit()
    await db.refresh(user)
    await log_action(
        db, "USER_UPDATE", request=request,
        username=current_user.username,
        resource_type="user", resource_id=user.id, resource_name=user.username,
    )
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    request: Request,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if user.username == "admin":
        raise HTTPException(status_code=400, detail="Impossible de supprimer le compte admin")

    await log_action(
        db, "USER_DELETE", request=request,
        username=current_user.username,
        resource_type="user", resource_id=user.id, resource_name=user.username,
    )
    await db.delete(user)
    await db.commit()

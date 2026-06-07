from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_session
from models import Group, User
from schemas import GroupCreate, GroupOut
from auth import get_current_user
from audit import log_action

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get("", response_model=list[GroupOut])
async def list_groups(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Group))
    return [GroupOut.model_validate(g) for g in result.scalars().all()]


@router.post("", response_model=GroupOut)
async def create_group(
    request: Request,
    body: GroupCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    group = Group(**body.model_dump(), agent_ids=[])
    db.add(group)
    await db.commit()
    await db.refresh(group)
    await log_action(db, "GROUP_CREATE", request=request, username=current_user.username,
                     resource_type="group", resource_id=group.id, resource_name=group.name)
    return GroupOut.model_validate(group)


@router.put("/{group_id}", response_model=GroupOut)
async def update_group(
    request: Request,
    group_id: str,
    body: GroupCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    group = await db.get(Group, group_id)
    if not group:
        raise HTTPException(404, "Group not found")
    for k, v in body.model_dump().items():
        setattr(group, k, v)
    await db.commit()
    await db.refresh(group)
    await log_action(db, "GROUP_UPDATE", request=request, username=current_user.username,
                     resource_type="group", resource_id=group.id, resource_name=group.name)
    return GroupOut.model_validate(group)


@router.delete("/{group_id}")
async def delete_group(
    request: Request,
    group_id: str,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    group = await db.get(Group, group_id)
    if not group:
        raise HTTPException(404, "Group not found")
    name = group.name
    await db.delete(group)
    await db.commit()
    await log_action(db, "GROUP_DELETE", request=request, username=current_user.username,
                     resource_type="group", resource_id=group_id, resource_name=name)
    return {"status": "deleted"}

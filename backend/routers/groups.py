from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_session
from models import Group
from schemas import GroupCreate, GroupOut

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get("", response_model=list[GroupOut])
async def list_groups(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Group))
    return [GroupOut.model_validate(g) for g in result.scalars().all()]


@router.post("", response_model=GroupOut)
async def create_group(body: GroupCreate, db: AsyncSession = Depends(get_session)):
    group = Group(**body.model_dump(), agent_ids=[])
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return GroupOut.model_validate(group)


@router.put("/{group_id}", response_model=GroupOut)
async def update_group(
    group_id: str, body: GroupCreate, db: AsyncSession = Depends(get_session)
):
    group = await db.get(Group, group_id)
    if not group:
        raise HTTPException(404, "Group not found")
    for k, v in body.model_dump().items():
        setattr(group, k, v)
    await db.commit()
    await db.refresh(group)
    return GroupOut.model_validate(group)


@router.delete("/{group_id}")
async def delete_group(group_id: str, db: AsyncSession = Depends(get_session)):
    group = await db.get(Group, group_id)
    if not group:
        raise HTTPException(404, "Group not found")
    await db.delete(group)
    await db.commit()
    return {"status": "deleted"}

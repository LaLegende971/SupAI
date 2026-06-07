from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_session
from models import Policy, Agent, User
from schemas import PolicyCreate, PolicyOut
from auth import get_current_user, require_admin
from audit import log_action

router = APIRouter(prefix="/policies", tags=["policies"])


async def _policy_out(policy: Policy, db: AsyncSession) -> PolicyOut:
    result = await db.execute(select(func.count()).where(Agent.policy_id == policy.id))
    count = result.scalar() or 0
    data = PolicyOut.model_validate(policy)
    data.agent_count = count
    return data


@router.get("", response_model=list[PolicyOut])
async def list_policies(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Policy))
    return [await _policy_out(p, db) for p in result.scalars().all()]


@router.get("/{policy_id}", response_model=PolicyOut)
async def get_policy(policy_id: str, db: AsyncSession = Depends(get_session)):
    policy = await db.get(Policy, policy_id)
    if not policy:
        raise HTTPException(404, "Policy not found")
    return await _policy_out(policy, db)


@router.post("", response_model=PolicyOut)
async def create_policy(
    request: Request,
    body: PolicyCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    policy = Policy(**body.model_dump())
    db.add(policy)
    await db.commit()
    await db.refresh(policy)
    await log_action(db, "POLICY_CREATE", request=request, username=current_user.username,
                     resource_type="policy", resource_id=policy.id, resource_name=policy.name)
    return await _policy_out(policy, db)


@router.put("/{policy_id}", response_model=PolicyOut)
async def update_policy(
    request: Request,
    policy_id: str,
    body: PolicyCreate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    policy = await db.get(Policy, policy_id)
    if not policy:
        raise HTTPException(404, "Policy not found")
    for k, v in body.model_dump().items():
        setattr(policy, k, v)
    await db.commit()
    await db.refresh(policy)
    await log_action(db, "POLICY_UPDATE", request=request, username=current_user.username,
                     resource_type="policy", resource_id=policy.id, resource_name=policy.name)
    return await _policy_out(policy, db)


@router.delete("/{policy_id}")
async def delete_policy(
    request: Request,
    policy_id: str,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    policy = await db.get(Policy, policy_id)
    if not policy:
        raise HTTPException(404, "Policy not found")
    name = policy.name
    await db.delete(policy)
    await db.commit()
    await log_action(db, "POLICY_DELETE", request=request, username=current_user.username,
                     resource_type="policy", resource_id=policy_id, resource_name=name)
    return {"status": "deleted"}

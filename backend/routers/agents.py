from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_session
from models import Agent, Policy, User
from schemas import AgentOut, AgentPolicyUpdate
from auth import get_current_user, require_admin
from audit import log_action

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[AgentOut])
async def list_agents(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Agent))
    return [AgentOut.model_validate(a) for a in result.scalars().all()]


@router.get("/{agent_id}", response_model=AgentOut)
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_session)):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return AgentOut.model_validate(agent)


@router.post("/{agent_id}/restart")
async def restart_agent(
    request: Request,
    agent_id: str,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    await log_action(db, "AGENT_RESTART", request=request, username=current_user.username,
                     resource_type="agent", resource_id=agent.id, resource_name=agent.host)
    return {"status": "restart_requested", "agent_id": agent_id}


@router.patch("/{agent_id}/policy", response_model=AgentOut)
async def update_agent_policy(
    request: Request,
    agent_id: str,
    body: AgentPolicyUpdate,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    policy = await db.get(Policy, body.policy_id)
    if not policy:
        raise HTTPException(404, "Policy not found")
    agent.policy_id = body.policy_id
    await db.commit()
    await db.refresh(agent)
    await log_action(db, "AGENT_POLICY_CHANGE", request=request, username=current_user.username,
                     resource_type="agent", resource_id=agent.id, resource_name=agent.host,
                     details=f"policy → {policy.name}")
    return AgentOut.model_validate(agent)


@router.delete("/{agent_id}")
async def unenroll_agent(
    request: Request,
    agent_id: str,
    db: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    host = agent.host
    await db.delete(agent)
    await db.commit()
    await log_action(db, "AGENT_DELETE", request=request, username=current_user.username,
                     resource_type="agent", resource_id=agent_id, resource_name=host)
    return {"status": "unenrolled", "agent_id": agent_id}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_session
from models import Agent, Policy
from schemas import AgentOut, AgentPolicyUpdate

router = APIRouter(prefix="/agents", tags=["agents"])


def _agent_out(agent: Agent, agent_count_map: dict = {}) -> AgentOut:
    return AgentOut.model_validate(agent)


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
async def restart_agent(agent_id: str, db: AsyncSession = Depends(get_session)):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    # In production this would send a command via WebSocket or a command queue
    return {"status": "restart_requested", "agent_id": agent_id}


@router.patch("/{agent_id}/policy", response_model=AgentOut)
async def update_agent_policy(
    agent_id: str,
    body: AgentPolicyUpdate,
    db: AsyncSession = Depends(get_session),
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
    return AgentOut.model_validate(agent)


@router.delete("/{agent_id}")
async def unenroll_agent(agent_id: str, db: AsyncSession = Depends(get_session)):
    agent = await db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    await db.delete(agent)
    await db.commit()
    return {"status": "unenrolled", "agent_id": agent_id}

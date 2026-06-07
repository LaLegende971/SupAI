from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_session
from models import Agent, Policy, Group
from schemas import EnrollRequest, EnrollResponse

router = APIRouter(prefix="/enrollment", tags=["enrollment"])


@router.post("/register", response_model=EnrollResponse)
async def register_agent(body: EnrollRequest, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(Policy).where(Policy.enrollment_token == body.token)
    )
    policy = result.scalar_one_or_none()
    if not policy:
        raise HTTPException(401, "Token d'enrollment invalide")

    result = await db.execute(select(Agent).where(Agent.host == body.host))
    agent = result.scalar_one_or_none()

    if agent:
        agent.ip = body.ip
        agent.os = body.os
        agent.version = body.version
        agent.services = body.services
        agent.status = "online"
        agent.policy_id = policy.id
        agent.uptime = body.uptime
    else:
        agent = Agent(
            host=body.host,
            ip=body.ip,
            os=body.os,
            version=body.version,
            services=body.services,
            status="online",
            policy_id=policy.id,
            uptime=body.uptime,
            enrolled_at=datetime.utcnow(),
        )
        db.add(agent)

    await db.commit()
    await db.refresh(agent)

    policy_data = {
        "id": policy.id,
        "push_interval": policy.push_interval,
        "metrics": policy.metrics,
        "thresholds": policy.thresholds,
        "update_check_enabled": policy.update_check_enabled,
        "update_check_frequency": policy.update_check_frequency,
        "auto_update": policy.auto_update,
    }
    return EnrollResponse(agent_id=agent.id, policy=policy_data)

import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_session
from models import Agent, EnrollmentToken, Policy, Group
from schemas import EnrollRequest, EnrollResponse, TokenCreate, TokenOut

router = APIRouter(prefix="/enrollment", tags=["enrollment"])


@router.post("/register", response_model=EnrollResponse)
async def register_agent(body: EnrollRequest, db: AsyncSession = Depends(get_session)):
    # Validate token
    result = await db.execute(
        select(EnrollmentToken).where(EnrollmentToken.token == body.token)
    )
    tok = result.scalar_one_or_none()

    if not tok:
        raise HTTPException(401, "Invalid enrollment token")
    if tok.status != "active":
        raise HTTPException(401, f"Token is {tok.status}")
    if tok.expires_at < datetime.utcnow():
        tok.status = "expired"
        await db.commit()
        raise HTTPException(401, "Token expired")

    # Get policy
    policy = await db.get(Policy, tok.policy_id)
    if not policy:
        raise HTTPException(404, "Policy not found")

    # Create or update agent
    result = await db.execute(
        select(Agent).where(Agent.host == body.host)
    )
    agent = result.scalar_one_or_none()

    if agent:
        agent.ip = body.ip
        agent.os = body.os
        agent.version = body.version
        agent.services = body.services
        agent.status = "online"
        agent.policy_id = tok.policy_id
        agent.group_id = tok.group_id
        agent.uptime = body.uptime
    else:
        agent = Agent(
            host=body.host,
            ip=body.ip,
            os=body.os,
            version=body.version,
            services=body.services,
            status="online",
            policy_id=tok.policy_id,
            group_id=tok.group_id,
            uptime=body.uptime,
            enrolled_at=datetime.utcnow(),
        )
        db.add(agent)

    # Add agent to group
    if tok.group_id:
        group = await db.get(Group, tok.group_id)
        if group and agent.id not in (group.agent_ids or []):
            group.agent_ids = list(group.agent_ids or []) + [agent.id]

    # Mark token as used
    tok.status = "used"

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


@router.get("/tokens", response_model=list[TokenOut])
async def list_tokens(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(EnrollmentToken).order_by(EnrollmentToken.created_at.desc()))
    return [TokenOut.model_validate(t) for t in result.scalars().all()]


@router.post("/token", response_model=TokenOut)
async def create_token(body: TokenCreate, db: AsyncSession = Depends(get_session)):
    now = datetime.utcnow()
    tok = EnrollmentToken(
        token=f"supai-enr-{secrets.token_hex(16)}",
        host=body.host,
        policy_id=body.policy_id,
        group_id=body.group_id,
        created_at=now,
        expires_at=now + timedelta(hours=24),
        status="active",
    )
    db.add(tok)
    await db.commit()
    await db.refresh(tok)
    return TokenOut.model_validate(tok)


@router.delete("/token/{token_id}")
async def revoke_token(token_id: str, db: AsyncSession = Depends(get_session)):
    tok = await db.get(EnrollmentToken, token_id)
    if not tok:
        raise HTTPException(404, "Token not found")
    tok.status = "expired"
    await db.commit()
    return {"status": "revoked"}

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from database import get_session
from models import Agent, MetricRecord, Setting
from schemas import MetricPush, MetricPoint
from ws import broadcast_metrics

router = APIRouter(prefix="/metrics", tags=["metrics"])

PERIOD_MAP = {
    "1h": timedelta(hours=1),
    "6h": timedelta(hours=6),
    "24h": timedelta(hours=24),
    "7d": timedelta(days=7),
    "30d": timedelta(days=30),
}


@router.post("")
async def push_metrics(body: MetricPush, db: AsyncSession = Depends(get_session)):
    agent = await db.get(Agent, body.agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")

    now = body.timestamp or datetime.utcnow()

    # Update agent live values
    agent.cpu = body.cpu
    agent.ram = body.ram
    agent.disk = body.disk
    agent.last_push = now
    agent.status = "online"
    if body.uptime:
        agent.uptime = body.uptime

    # Determine warning status based on policy thresholds
    # (simplified: flag warning if CPU or RAM exceed threshold)
    # Full threshold logic handled by alerts subsystem later

    # Store time-series record
    record = MetricRecord(
        agent_id=body.agent_id,
        timestamp=now,
        cpu=body.cpu,
        ram=body.ram,
        disk=body.disk,
    )
    db.add(record)
    await db.commit()

    # Broadcast via WebSocket
    await broadcast_metrics({
        "agentId": body.agent_id,
        "cpu": body.cpu,
        "ram": body.ram,
        "disk": body.disk,
        "timestamp": now.isoformat(),
    })

    return {"status": "ok"}


@router.get("/{agent_id}/history", response_model=list[MetricPoint])
async def get_history(
    agent_id: str,
    period: str = Query("1h", enum=list(PERIOD_MAP.keys())),
    db: AsyncSession = Depends(get_session),
):
    since = datetime.utcnow() - PERIOD_MAP[period]
    result = await db.execute(
        select(MetricRecord)
        .where(MetricRecord.agent_id == agent_id, MetricRecord.timestamp >= since)
        .order_by(MetricRecord.timestamp.asc())
    )
    return [MetricPoint.model_validate(r) for r in result.scalars().all()]


async def cleanup_old_metrics(db: AsyncSession):
    result = await db.execute(
        select(Setting).where(Setting.key == "metrics_retention_days")
    )
    setting = result.scalar_one_or_none()
    days = int(setting.value) if setting else 30
    cutoff = datetime.utcnow() - timedelta(days=days)
    await db.execute(delete(MetricRecord).where(MetricRecord.timestamp < cutoff))
    await db.commit()

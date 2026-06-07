from datetime import datetime
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_session
from models import AgentEvent, User
from auth import get_current_user

router = APIRouter(prefix="/agent", tags=["events"])

VALID_LEVELS = {"error", "warning", "info"}


class EventIn(BaseModel):
    agent_id: str
    level: str = "error"
    message: str
    source: str = ""


class EventOut(BaseModel):
    id: int
    timestamp: datetime
    agent_id: str
    level: str
    source: str
    message: str

    model_config = {"from_attributes": True}


@router.post("/events", response_model=EventOut)
async def receive_event(body: EventIn, db: AsyncSession = Depends(get_session)):
    level = body.level if body.level in VALID_LEVELS else "error"
    ev = AgentEvent(
        agent_id=body.agent_id,
        level=level,
        source=body.source,
        message=body.message[:2000],
    )
    db.add(ev)
    await db.commit()
    await db.refresh(ev)
    return ev


@router.get("/events", response_model=list[EventOut])
async def list_events(
    agent_id: str | None = Query(default=None),
    level: str | None = Query(default=None),
    limit: int = Query(default=200, le=500),
    db: AsyncSession = Depends(get_session),
    _: User = Depends(get_current_user),
):
    q = select(AgentEvent).order_by(AgentEvent.timestamp.desc()).limit(limit)
    if agent_id:
        q = q.where(AgentEvent.agent_id == agent_id)
    if level:
        q = q.where(AgentEvent.level == level)
    result = await db.execute(q)
    return result.scalars().all()

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from database import get_session
from models import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])


class AuditLogOut(BaseModel):
    id: int
    timestamp: datetime
    username: str
    action: str
    resource_type: str
    resource_id: str
    resource_name: str
    ip_address: str
    success: bool
    details: str

    model_config = {"from_attributes": True}


@router.get("/logs", response_model=list[AuditLogOut])
async def list_audit_logs(
    db: AsyncSession = Depends(get_session),
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    username: Optional[str] = Query(default=None),
    action: Optional[str] = Query(default=None),
    resource_type: Optional[str] = Query(default=None),
    success: Optional[bool] = Query(default=None),
):
    query = select(AuditLog).order_by(desc(AuditLog.timestamp))
    if username:
        query = query.where(AuditLog.username == username)
    if action:
        query = query.where(AuditLog.action == action)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    if success is not None:
        query = query.where(AuditLog.success == success)
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    return [AuditLogOut.model_validate(log) for log in result.scalars().all()]

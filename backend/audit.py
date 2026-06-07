from datetime import datetime
from typing import Optional
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from models import AuditLog


def _get_ip(request: Optional[Request]) -> str:
    if not request:
        return ""
    forwarded = request.headers.get("X-Real-IP") or request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else ""


async def log_action(
    db: AsyncSession,
    action: str,
    *,
    request: Optional[Request] = None,
    username: str = "",
    resource_type: str = "",
    resource_id: str = "",
    resource_name: str = "",
    success: bool = True,
    details: str = "",
) -> None:
    entry = AuditLog(
        timestamp=datetime.utcnow(),
        username=username,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id),
        resource_name=resource_name,
        ip_address=_get_ip(request),
        success=success,
        details=details,
    )
    db.add(entry)
    await db.commit()

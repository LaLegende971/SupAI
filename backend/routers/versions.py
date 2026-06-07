from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_session
from models import AgentVersion
from schemas import VersionOut, VersionCheck, VersionCheckResponse
from packaging.version import Version

router = APIRouter(prefix="/agent", tags=["versions"])

RELEASES_DIR = Path(__file__).parent.parent.parent / "releases"
GITHUB_REPO = "LaLegende971/SupAI"


def _github_download_url(version: str, filename: str) -> str:
    return f"https://github.com/{GITHUB_REPO}/releases/download/v{version}/{filename}"


@router.get("/versions", response_model=list[VersionOut])
async def list_versions(db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(AgentVersion).order_by(AgentVersion.released_at.desc())
    )
    return [VersionOut.model_validate(v) for v in result.scalars().all()]


@router.post("/version/check", response_model=VersionCheckResponse)
async def check_version(body: VersionCheck, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(AgentVersion).where(AgentVersion.is_stable == True)
    )
    versions = result.scalars().all()
    if not versions:
        return VersionCheckResponse(has_update=False, latest_version=None, download_url=None)

    latest = max(versions, key=lambda v: Version(v.version))

    try:
        has_update = Version(latest.version) > Version(body.current_version)
    except Exception:
        has_update = False

    return VersionCheckResponse(
        has_update=has_update,
        latest_version=latest.version if has_update else None,
        download_url=_github_download_url(latest.version, latest.filename) if has_update else None,
    )


@router.patch("/versions/{version_id}/stable")
async def set_stable(version_id: str, db: AsyncSession = Depends(get_session)):
    # Clear current stable
    result = await db.execute(select(AgentVersion))
    for v in result.scalars().all():
        v.is_stable = False

    version = await db.get(AgentVersion, version_id)
    if not version:
        raise HTTPException(404, "Version not found")
    version.is_stable = True
    await db.commit()
    return {"status": "ok", "stable_version": version.version}


@router.get("/releases/{filename}")
async def download_release(filename: str):
    path = RELEASES_DIR / filename
    if not path.exists() or not path.is_file():
        raise HTTPException(404, "Release file not found")
    return FileResponse(path, filename=filename, media_type="application/octet-stream")

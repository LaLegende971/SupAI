import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

# Load .env if present (PostgreSQL URL override)
load_dotenv(Path(__file__).parent / ".env")

from database import get_engine, get_session_factory, Base, build_engine
from models import AgentVersion
from routers import agents, enrollment, metrics, policies, groups, versions, settings
from ws import ws_endpoint


@asynccontextmanager
async def lifespan(app: FastAPI):
    build_engine()
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _seed_versions()
    asyncio.create_task(_cleanup_loop())
    yield


async def _seed_versions():
    releases_dir = Path(__file__).parent.parent / "releases"
    releases_dir.mkdir(exist_ok=True)

    versions_json = releases_dir / "versions.json"
    if not versions_json.exists():
        return

    import json
    data = json.loads(versions_json.read_text())

    async with get_session_factory()() as db:
        for entry in data.get("versions", []):
            result = await db.execute(
                select(AgentVersion).where(AgentVersion.version == entry["version"])
            )
            if not result.scalar_one_or_none():
                db.add(AgentVersion(
                    version=entry["version"],
                    filename=entry["filename"],
                    is_stable=entry.get("stable", False),
                    changelog=entry.get("changelog", ""),
                ))
        await db.commit()


async def _cleanup_loop():
    from routers.metrics import cleanup_old_metrics
    while True:
        await asyncio.sleep(3600)
        async with get_session_factory()() as db:
            await cleanup_old_metrics(db)


app = FastAPI(title="SupAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents.router, prefix="/api/v1")
app.include_router(enrollment.router, prefix="/api/v1")
app.include_router(metrics.router, prefix="/api/v1")
app.include_router(policies.router, prefix="/api/v1")
app.include_router(groups.router, prefix="/api/v1")
app.include_router(versions.router, prefix="/api/v1")
app.include_router(settings.router, prefix="/api/v1")


@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    await ws_endpoint(websocket)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy import select

load_dotenv(Path(__file__).parent / ".env")

from database import get_engine, get_session_factory, Base, build_engine
from models import AgentVersion, User
from auth import hash_password, get_current_user
from routers import agents, enrollment, metrics, policies, groups, versions, settings
from routers import auth as auth_router
from routers import audit as audit_router
from ws import ws_endpoint


@asynccontextmanager
async def lifespan(app: FastAPI):
    build_engine()
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _seed_versions()
    await _seed_admin()
    asyncio.create_task(_cleanup_loop())
    yield


async def _seed_admin():
    default_password = os.getenv("ADMIN_PASSWORD", "admin")
    async with get_session_factory()() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        if not result.scalar_one_or_none():
            db.add(User(username="admin", hashed_password=hash_password(default_password)))
            await db.commit()


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


limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(title="SupAI API", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = [
    "https://192.168.1.221",
    "http://127.0.0.1:5000",
    "http://localhost:5000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Forwarded-For"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next) -> Response:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Cache-Control"] = "no-store"
    # Supprimer les headers qui révèlent la stack technique
    response.headers.pop("Server", None)
    response.headers.pop("X-Powered-By", None)
    return response


# Routes publiques (utilisées par les agents Windows)
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(enrollment.router, prefix="/api/v1")
app.include_router(metrics.router, prefix="/api/v1")

# Routes protégées par JWT
protected = {"dependencies": [Depends(get_current_user)]}
app.include_router(agents.router, prefix="/api/v1", **protected)
app.include_router(policies.router, prefix="/api/v1", **protected)
app.include_router(groups.router, prefix="/api/v1", **protected)
app.include_router(versions.router, prefix="/api/v1", **protected)
app.include_router(settings.router, prefix="/api/v1", **protected)
app.include_router(audit_router.router, prefix="/api/v1", **protected)


@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    await ws_endpoint(websocket)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

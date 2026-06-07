import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Request
from models import User
from auth import require_admin
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select, text
from database import get_session, build_engine, DB_PATH
from models import Setting
from schemas import SettingsOut, SettingsUpdate, PostgresConfig

router = APIRouter(prefix="/settings", tags=["settings"])

DEFAULTS = {
    "server_url": "http://192.168.1.220:5001",
    "ollama_host": "http://192.168.1.220:11434",
    "ollama_model": "llama3.2",
    "metrics_retention_days": "30",
    "smtp_host": "",
    "smtp_port": "587",
    "smtp_user": "",
    "smtp_from": "",
    "alerts_enabled": "false",
    "pg_host": "",
    "pg_port": "5432",
    "pg_database": "supai",
    "pg_user": "supai",
}


async def _get(db: AsyncSession, key: str) -> str:
    result = await db.execute(select(Setting).where(Setting.key == key))
    row = result.scalar_one_or_none()
    return row.value if row else DEFAULTS.get(key, "")


async def _set(db: AsyncSession, key: str, value: str):
    result = await db.execute(select(Setting).where(Setting.key == key))
    row = result.scalar_one_or_none()
    if row:
        row.value = value
    else:
        db.add(Setting(key=key, value=value))


@router.get("", response_model=SettingsOut)
async def get_settings(db: AsyncSession = Depends(get_session)):
    return SettingsOut(
        server_url=await _get(db, "server_url"),
        ollama_host=await _get(db, "ollama_host"),
        ollama_model=await _get(db, "ollama_model"),
        metrics_retention_days=int(await _get(db, "metrics_retention_days") or 30),
        smtp_host=await _get(db, "smtp_host"),
        smtp_port=int(await _get(db, "smtp_port") or 587),
        smtp_user=await _get(db, "smtp_user"),
        smtp_from=await _get(db, "smtp_from"),
        alerts_enabled=(await _get(db, "alerts_enabled")) == "true",
        pg_host=await _get(db, "pg_host"),
        pg_port=int(await _get(db, "pg_port") or 5432),
        pg_database=await _get(db, "pg_database"),
        pg_user=await _get(db, "pg_user"),
        using_postgresql=bool(os.environ.get("SUPAI_DATABASE_URL")),
    )


@router.put("", response_model=SettingsOut)
async def update_settings(body: SettingsUpdate, db: AsyncSession = Depends(get_session), _: User = Depends(require_admin)):
    mapping = {
        "server_url": body.server_url,
        "ollama_host": body.ollama_host,
        "ollama_model": body.ollama_model,
        "metrics_retention_days": str(body.metrics_retention_days) if body.metrics_retention_days else None,
        "smtp_host": body.smtp_host,
        "smtp_port": str(body.smtp_port) if body.smtp_port else None,
        "smtp_user": body.smtp_user,
        "smtp_from": body.smtp_from,
        "alerts_enabled": ("true" if body.alerts_enabled else "false") if body.alerts_enabled is not None else None,
    }
    for key, value in mapping.items():
        if value is not None:
            await _set(db, key, value)
    await db.commit()
    return await get_settings(db)


@router.post("/test-postgresql")
async def test_postgresql(body: PostgresConfig, _: User = Depends(require_admin)):
    url = f"postgresql+asyncpg://{body.user}:{body.password}@{body.host}:{body.port}/{body.database}"
    try:
        engine = create_async_engine(url, connect_args={})
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        await engine.dispose()
        return {"status": "ok", "message": "Connexion PostgreSQL réussie"}
    except Exception as e:
        raise HTTPException(400, f"Connexion échouée : {e}")


@router.post("/migrate-to-postgresql")
async def migrate_to_postgresql(
    body: PostgresConfig,
    db: AsyncSession = Depends(get_session),
    _: User = Depends(require_admin),
):
    pg_url = f"postgresql+asyncpg://{body.user}:{body.password}@{body.host}:{body.port}/{body.database}"

    # Test connection first
    try:
        test_engine = create_async_engine(pg_url)
        async with test_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        await test_engine.dispose()
    except Exception as e:
        raise HTTPException(400, f"Connexion PostgreSQL échouée : {e}")

    # Export all data from SQLite
    from models import Agent, MetricRecord, Policy, Group, EnrollmentToken, AgentVersion, Setting as SettingModel
    from sqlalchemy.orm import class_mapper

    tables = [Policy, Group, EnrollmentToken, Agent, MetricRecord, AgentVersion, SettingModel]
    exported: dict = {}
    for model in tables:
        result = await db.execute(select(model))
        rows = result.scalars().all()
        exported[model.__tablename__] = [
            {c.key: getattr(row, c.key) for c in class_mapper(model).columns}
            for row in rows
        ]

    # Build PG schema and import
    from database import Base
    pg_engine = create_async_engine(pg_url)
    async with pg_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    pg_session_factory = async_sessionmaker(pg_engine, expire_on_commit=False, class_=AsyncSession)
    async with pg_session_factory() as pg_db:
        for model in tables:
            for row_data in exported[model.__tablename__]:
                pg_db.add(model(**row_data))
        await pg_db.commit()

    await pg_engine.dispose()

    # Write env file so backend uses PG on next restart
    env_file = Path(__file__).parent.parent / ".env"
    env_file.write_text(f"SUPAI_DATABASE_URL={pg_url}\n")

    # Save PG settings
    await _set(db, "pg_host", body.host)
    await _set(db, "pg_port", str(body.port))
    await _set(db, "pg_database", body.database)
    await _set(db, "pg_user", body.user)
    await db.commit()

    return {
        "status": "migrated",
        "message": "Migration réussie. Redémarrez le backend pour activer PostgreSQL.",
        "rows_migrated": {t: len(exported[t]) for t in exported},
    }


@router.delete("/sqlite")
async def delete_sqlite(_: User = Depends(require_admin)):
    if not DB_PATH.exists():
        raise HTTPException(404, "SQLite database not found")
    if not os.environ.get("SUPAI_DATABASE_URL"):
        raise HTTPException(400, "Backend utilise encore SQLite — migration requise d'abord")
    DB_PATH.unlink()
    return {"status": "deleted", "message": "Base SQLite supprimée"}

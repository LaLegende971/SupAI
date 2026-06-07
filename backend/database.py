import os
from pathlib import Path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

DB_PATH = Path(__file__).parent / "supai.db"
_engine = None
_session_factory = None


def get_database_url() -> str:
    pg_url = os.environ.get("SUPAI_DATABASE_URL")
    if pg_url:
        return pg_url
    return f"sqlite+aiosqlite:///{DB_PATH}"


def build_engine(url: str | None = None):
    global _engine, _session_factory
    database_url = url or get_database_url()
    connect_args = {"check_same_thread": False} if "sqlite" in database_url else {}
    _engine = create_async_engine(database_url, connect_args=connect_args, echo=False)
    _session_factory = async_sessionmaker(_engine, expire_on_commit=False, class_=AsyncSession)
    return _engine


def get_engine():
    if _engine is None:
        build_engine()
    return _engine


def get_session_factory():
    if _session_factory is None:
        build_engine()
    return _session_factory


async def get_session() -> AsyncSession:
    async with get_session_factory()() as session:
        yield session


class Base(DeclarativeBase):
    pass

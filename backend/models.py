import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


def new_id() -> str:
    return str(uuid.uuid4())


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    host: Mapped[str] = mapped_column(String, nullable=False)
    ip: Mapped[str] = mapped_column(String, nullable=False)
    os: Mapped[str] = mapped_column(String, default="")
    version: Mapped[str] = mapped_column(String, default="")
    status: Mapped[str] = mapped_column(String, default="offline")
    policy_id: Mapped[str | None] = mapped_column(String, ForeignKey("policies.id"), nullable=True)
    group_id: Mapped[str | None] = mapped_column(String, ForeignKey("groups.id"), nullable=True)
    last_push: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    uptime: Mapped[str] = mapped_column(String, default="—")
    services: Mapped[list] = mapped_column(JSON, default=list)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    cpu: Mapped[float] = mapped_column(Float, default=0.0)
    ram: Mapped[float] = mapped_column(Float, default=0.0)
    disk: Mapped[float] = mapped_column(Float, default=0.0)

    metrics: Mapped[list["MetricRecord"]] = relationship("MetricRecord", back_populates="agent", cascade="all, delete-orphan")


class MetricRecord(Base):
    __tablename__ = "metric_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    agent_id: Mapped[str] = mapped_column(String, ForeignKey("agents.id"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    cpu: Mapped[float] = mapped_column(Float)
    ram: Mapped[float] = mapped_column(Float)
    disk: Mapped[float] = mapped_column(Float)

    agent: Mapped["Agent"] = relationship("Agent", back_populates="metrics")


class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, default="")
    push_interval: Mapped[int] = mapped_column(Integer, default=30)
    metrics: Mapped[list] = mapped_column(JSON, default=list)
    thresholds: Mapped[dict] = mapped_column(JSON, default=dict)
    update_check_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    update_check_frequency: Mapped[int] = mapped_column(Integer, default=3600)
    auto_update: Mapped[bool] = mapped_column(Boolean, default=False)


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, default="")
    color: Mapped[str] = mapped_column(String, default="#378ADD")
    agent_ids: Mapped[list] = mapped_column(JSON, default=list)


class EnrollmentToken(Base):
    __tablename__ = "enrollment_tokens"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    token: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    host: Mapped[str] = mapped_column(String, default="")
    policy_id: Mapped[str] = mapped_column(String, default="")
    group_id: Mapped[str] = mapped_column(String, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(String, default="active")


class AgentVersion(Base):
    __tablename__ = "agent_versions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    version: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    filename: Mapped[str] = mapped_column(String, nullable=False)
    released_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_stable: Mapped[bool] = mapped_column(Boolean, default=False)
    changelog: Mapped[str] = mapped_column(Text, default="")


class Setting(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    value: Mapped[str] = mapped_column(Text, default="")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_id)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, default="admin")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    username: Mapped[str] = mapped_column(String, default="")
    action: Mapped[str] = mapped_column(String, nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String, default="")
    resource_id: Mapped[str] = mapped_column(String, default="")
    resource_name: Mapped[str] = mapped_column(String, default="")
    ip_address: Mapped[str] = mapped_column(String, default="")
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    details: Mapped[str] = mapped_column(Text, default="")

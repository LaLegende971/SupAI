from datetime import datetime
from typing import Any
from pydantic import BaseModel


# ── Agent ────────────────────────────────────────────────────────────────────

class AgentOut(BaseModel):
    id: str
    host: str
    ip: str
    os: str
    version: str
    status: str
    policy_id: str | None
    group_id: str | None
    last_push: datetime | None
    uptime: str
    services: list[str]
    enrolled_at: datetime
    cpu: float
    ram: float
    disk: float

    model_config = {"from_attributes": True}


class AgentPolicyUpdate(BaseModel):
    policy_id: str


# ── Enrollment ───────────────────────────────────────────────────────────────

class EnrollRequest(BaseModel):
    token: str
    host: str
    ip: str
    os: str
    version: str
    services: list[str] = []
    uptime: str = ""


class EnrollResponse(BaseModel):
    agent_id: str
    policy: dict[str, Any]


class TokenCreate(BaseModel):
    host: str
    policy_id: str
    group_id: str


class TokenOut(BaseModel):
    id: str
    token: str
    host: str
    policy_id: str
    group_id: str
    created_at: datetime
    expires_at: datetime
    status: str

    model_config = {"from_attributes": True}


# ── Metrics ──────────────────────────────────────────────────────────────────

class MetricPush(BaseModel):
    agent_id: str
    cpu: float
    ram: float
    disk: float
    uptime: str = ""
    timestamp: datetime | None = None


class MetricPoint(BaseModel):
    timestamp: datetime
    cpu: float
    ram: float
    disk: float

    model_config = {"from_attributes": True}


# ── Policy ───────────────────────────────────────────────────────────────────

class PolicyCreate(BaseModel):
    name: str
    description: str = ""
    push_interval: int = 30
    metrics: list[str] = []
    thresholds: dict[str, float] = {}
    update_check_enabled: bool = False
    update_check_frequency: int = 3600
    auto_update: bool = False


class PolicyOut(BaseModel):
    id: str
    name: str
    description: str
    enrollment_token: str = ""
    push_interval: int
    metrics: list[str]
    thresholds: dict[str, float]
    update_check_enabled: bool
    update_check_frequency: int
    auto_update: bool
    agent_count: int = 0

    model_config = {"from_attributes": True}


# ── Group ────────────────────────────────────────────────────────────────────

class GroupCreate(BaseModel):
    name: str
    description: str = ""
    color: str = "#378ADD"


class GroupOut(BaseModel):
    id: str
    name: str
    description: str
    color: str
    agent_ids: list[str]

    model_config = {"from_attributes": True}


# ── Versions ─────────────────────────────────────────────────────────────────

class VersionOut(BaseModel):
    id: str
    version: str
    filename: str
    released_at: datetime
    is_stable: bool
    changelog: str

    model_config = {"from_attributes": True}


class VersionCheck(BaseModel):
    current_version: str
    agent_id: str | None = None


class VersionCheckResponse(BaseModel):
    has_update: bool
    latest_version: str | None
    download_url: str | None


# ── Settings ─────────────────────────────────────────────────────────────────

class SettingsOut(BaseModel):
    server_url: str
    ollama_host: str
    ollama_model: str
    metrics_retention_days: int
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_from: str
    alerts_enabled: bool
    pg_host: str
    pg_port: int
    pg_database: str
    pg_user: str
    using_postgresql: bool


class SettingsUpdate(BaseModel):
    server_url: str | None = None
    ollama_host: str | None = None
    ollama_model: str | None = None
    metrics_retention_days: int | None = None
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_user: str | None = None
    smtp_from: str | None = None
    alerts_enabled: bool | None = None


class PostgresConfig(BaseModel):
    host: str
    port: int = 5432
    database: str
    user: str
    password: str

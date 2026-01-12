"""API key model for service authentication."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


def _utc_now() -> datetime:
    """Get current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


class ApiKey(BaseModel):
    """API key for authenticating service-to-service calls."""

    key_id: str = Field(default_factory=lambda: f"key_{uuid.uuid4().hex[:12]}")
    hashed_key: str  # SHA-256 hash of the actual key
    client_id: str  # Associated client ID for multi-tenant support (required)
    name: str  # Human-readable name (e.g., "nextjs-service")
    scopes: list[str] = Field(default_factory=lambda: ["all"])
    created_at: datetime = Field(default_factory=_utc_now)
    last_used: Optional[datetime] = None
    is_active: bool = True

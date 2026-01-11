"""API key model for service authentication."""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ApiKey(BaseModel):
    """API key for authenticating service-to-service calls."""

    key_id: str = Field(default_factory=lambda: f"key_{uuid.uuid4().hex[:12]}")
    hashed_key: str  # SHA-256 hash of the actual key
    name: str  # Human-readable name (e.g., "nextjs-service")
    scopes: list[str] = Field(default_factory=lambda: ["all"])
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: Optional[datetime] = None
    is_active: bool = True

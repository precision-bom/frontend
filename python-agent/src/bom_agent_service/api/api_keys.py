"""API keys management router."""

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..stores import get_api_key_store

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


class ApiKeyResponse(BaseModel):
    """API key response (without raw key)."""
    key_id: str
    client_id: Optional[str]
    name: str
    scopes: list[str]
    created_at: str
    last_used: Optional[str]
    is_active: bool


class ApiKeyCreateRequest(BaseModel):
    """Request to create an API key."""
    client_id: str
    name: str
    scopes: list[str] = ["all"]


class ApiKeyCreateResponse(BaseModel):
    """Response with new API key (including raw key)."""
    key: ApiKeyResponse
    raw_key: str


@router.get("", response_model=list[ApiKeyResponse])
async def list_api_keys(client_id: Optional[str] = None):
    """List all API keys, optionally filtered by client."""
    store = get_api_key_store()
    keys = store.list_keys(client_id=client_id)

    return [
        ApiKeyResponse(
            key_id=k.key_id,
            client_id=k.client_id,
            name=k.name,
            scopes=k.scopes,
            created_at=k.created_at.isoformat(),
            last_used=k.last_used.isoformat() if k.last_used else None,
            is_active=k.is_active,
        )
        for k in keys
    ]


@router.get("/{key_id}", response_model=ApiKeyResponse)
async def get_api_key(key_id: str):
    """Get a specific API key by ID."""
    store = get_api_key_store()
    key = store.get_key(key_id)

    if not key:
        raise HTTPException(status_code=404, detail=f"API key not found: {key_id}")

    return ApiKeyResponse(
        key_id=key.key_id,
        client_id=key.client_id,
        name=key.name,
        scopes=key.scopes,
        created_at=key.created_at.isoformat(),
        last_used=key.last_used.isoformat() if key.last_used else None,
        is_active=key.is_active,
    )


@router.post("", response_model=ApiKeyCreateResponse)
async def create_api_key(request: ApiKeyCreateRequest):
    """Create a new API key."""
    store = get_api_key_store()

    key, raw_key = store.create_key(
        client_id=request.client_id,
        name=request.name,
        scopes=request.scopes,
    )

    return ApiKeyCreateResponse(
        key=ApiKeyResponse(
            key_id=key.key_id,
            client_id=key.client_id,
            name=key.name,
            scopes=key.scopes,
            created_at=key.created_at.isoformat(),
            last_used=None,
            is_active=True,
        ),
        raw_key=raw_key,
    )


@router.post("/{key_id}/revoke")
async def revoke_api_key(key_id: str):
    """Revoke an API key."""
    store = get_api_key_store()

    if not store.revoke_key(key_id):
        raise HTTPException(status_code=404, detail=f"API key not found: {key_id}")

    return {"status": "revoked", "key_id": key_id}

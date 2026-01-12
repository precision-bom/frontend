"""Admin API for bootstrapping and demo setup.

These endpoints are protected by ADMIN_API_KEY environment variable
and provide administrative functions like creating demo clients/keys.
"""

import os
from typing import Optional

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from ..stores import get_api_key_store, get_client_store

router = APIRouter(prefix="/admin", tags=["admin"])

# Admin API key from environment
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")


def verify_admin_key(x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key")):
    """Verify the admin API key."""
    if not ADMIN_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Admin API not configured. Set ADMIN_API_KEY environment variable.",
        )
    if not x_admin_key:
        raise HTTPException(
            status_code=401,
            detail="Missing X-Admin-Key header",
        )
    if x_admin_key != ADMIN_API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin key",
        )


class BootstrapRequest(BaseModel):
    """Request to bootstrap a demo client."""
    client_name: str = "Demo Client"
    client_slug: str = "demo"
    key_name: str = "demo-key"


class BootstrapResponse(BaseModel):
    """Response from bootstrap containing the API key."""
    client_id: str
    client_name: str
    key_id: str
    key_name: str
    api_key: str
    message: str


class StatusResponse(BaseModel):
    """Admin status response."""
    admin_configured: bool
    has_clients: bool
    has_api_keys: bool
    client_count: int
    key_count: int


@router.get("/status", response_model=StatusResponse)
async def admin_status():
    """
    Check admin API status (no auth required).

    Returns whether the admin API is configured and basic stats.
    """
    client_store = get_client_store()
    api_key_store = get_api_key_store()

    clients = client_store.list_clients()
    keys = api_key_store.list_keys()

    return StatusResponse(
        admin_configured=bool(ADMIN_API_KEY),
        has_clients=len(clients) > 0,
        has_api_keys=len(keys) > 0,
        client_count=len(clients),
        key_count=len(keys),
    )


@router.post("/bootstrap", response_model=BootstrapResponse)
async def bootstrap_demo(
    request: BootstrapRequest = BootstrapRequest(),
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
):
    """
    Bootstrap the system with a demo client and API key.

    Creates a client and API key for demo/development use.
    Returns the raw API key - save it, it won't be shown again!

    Requires X-Admin-Key header matching ADMIN_API_KEY env var.
    """
    verify_admin_key(x_admin_key)

    client_store = get_client_store()
    api_key_store = get_api_key_store()

    # Check if client with this slug already exists
    existing = client_store.get_client_by_slug(request.client_slug)
    if existing:
        # Create a new key for existing client
        api_key, raw_key = api_key_store.create_key(
            client_id=existing.client_id,
            name=request.key_name,
            scopes=["all"],
        )
        return BootstrapResponse(
            client_id=existing.client_id,
            client_name=existing.name,
            key_id=api_key.key_id,
            key_name=api_key.name,
            api_key=raw_key,
            message=f"Client '{request.client_slug}' already exists. Created new API key.",
        )

    # Create new client
    client = client_store.create_client(
        name=request.client_name,
        slug=request.client_slug,
    )

    # Create API key for the client
    api_key, raw_key = api_key_store.create_key(
        client_id=client.client_id,
        name=request.key_name,
        scopes=["all"],
    )

    return BootstrapResponse(
        client_id=client.client_id,
        client_name=client.name,
        key_id=api_key.key_id,
        key_name=api_key.name,
        api_key=raw_key,
        message="Demo client and API key created successfully.",
    )


@router.post("/reset-demo")
async def reset_demo(
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
):
    """
    Reset demo data (deactivate demo client and revoke keys).

    Requires X-Admin-Key header.
    """
    verify_admin_key(x_admin_key)

    client_store = get_client_store()
    api_key_store = get_api_key_store()

    # Find demo client
    demo_client = client_store.get_client_by_slug("demo")
    if not demo_client:
        return {"message": "No demo client found", "reset": False}

    # Revoke all keys for demo client
    keys = api_key_store.list_keys(client_id=demo_client.client_id)
    revoked_count = 0
    for key in keys:
        if key.is_active:
            api_key_store.revoke_key(key.key_id)
            revoked_count += 1

    # Deactivate demo client
    client_store.deactivate_client(demo_client.client_id)

    return {
        "message": f"Demo reset complete. Deactivated client and revoked {revoked_count} keys.",
        "reset": True,
        "client_id": demo_client.client_id,
        "keys_revoked": revoked_count,
    }

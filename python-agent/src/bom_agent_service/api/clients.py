"""Clients (organizations) management router."""

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..stores import get_client_store

router = APIRouter(prefix="/clients", tags=["clients"])


class ClientResponse(BaseModel):
    """Client response."""
    client_id: str
    name: str
    slug: str
    is_active: bool
    created_at: str


class ClientCreateRequest(BaseModel):
    """Request to create a client."""
    name: str
    slug: str
    oidc_issuer: Optional[str] = None
    oidc_audience: Optional[str] = None


@router.get("", response_model=list[ClientResponse])
async def list_clients(include_inactive: bool = False):
    """List all clients."""
    store = get_client_store()
    clients = store.list_clients(include_inactive=include_inactive)

    return [
        ClientResponse(
            client_id=c.client_id,
            name=c.name,
            slug=c.slug,
            is_active=c.is_active,
            created_at=c.created_at.isoformat(),
        )
        for c in clients
    ]


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str):
    """Get a specific client by ID."""
    store = get_client_store()
    client = store.get_client(client_id)

    if not client:
        raise HTTPException(status_code=404, detail=f"Client not found: {client_id}")

    return ClientResponse(
        client_id=client.client_id,
        name=client.name,
        slug=client.slug,
        is_active=client.is_active,
        created_at=client.created_at.isoformat(),
    )


@router.post("", response_model=ClientResponse)
async def create_client(request: ClientCreateRequest):
    """Create a new client."""
    store = get_client_store()

    # Check if slug already exists
    existing = store.get_client_by_slug(request.slug)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Client with slug '{request.slug}' already exists"
        )

    client = store.create_client(
        name=request.name,
        slug=request.slug,
        oidc_issuer=request.oidc_issuer,
        oidc_audience=request.oidc_audience,
    )

    return ClientResponse(
        client_id=client.client_id,
        name=client.name,
        slug=client.slug,
        is_active=client.is_active,
        created_at=client.created_at.isoformat(),
    )


@router.post("/{client_id}/deactivate")
async def deactivate_client(client_id: str):
    """Deactivate a client."""
    store = get_client_store()

    if not store.deactivate_client(client_id):
        raise HTTPException(status_code=404, detail=f"Client not found: {client_id}")

    return {"status": "deactivated", "client_id": client_id}

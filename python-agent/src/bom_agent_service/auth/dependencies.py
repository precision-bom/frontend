"""FastAPI dependencies for authentication."""

from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Request

from .chain import AuthChain
from .config import AuthConfig
from .identity import Identity
from .providers.api_key import ApiKeyProvider
from .providers.jwt import JWTProvider
from .providers.x402 import X402Provider
from ..stores import get_api_key_store, get_client_store

# Singleton instances
_auth_chain: Optional[AuthChain] = None
_config: Optional[AuthConfig] = None


def get_auth_config() -> AuthConfig:
    """Get auth configuration singleton."""
    global _config
    if _config is None:
        _config = AuthConfig.from_env()
    return _config


def reset_auth_config() -> None:
    """Reset auth config singleton (for testing)."""
    global _config, _auth_chain
    _config = None
    _auth_chain = None


def get_auth_chain() -> AuthChain:
    """Get auth chain singleton with configured providers."""
    global _auth_chain
    if _auth_chain is None:
        config = get_auth_config()
        api_key_store = get_api_key_store()
        client_store = get_client_store()

        _auth_chain = AuthChain(config)

        if config.api_key_auth_enabled:
            _auth_chain.add_provider(ApiKeyProvider(api_key_store, client_store))

        if config.jwt_auth_enabled:
            _auth_chain.add_provider(JWTProvider(config, client_store))

        if config.x402_enabled:
            _auth_chain.add_provider(X402Provider(config, client_store))

    return _auth_chain


async def get_current_identity(
    request: Request,
    auth_chain: AuthChain = Depends(get_auth_chain),
) -> Identity:
    """
    FastAPI dependency that returns the current authenticated identity.

    This is the primary dependency for authentication - use this in your routes.
    """
    return await auth_chain.authenticate(request)


# Type alias for easier use in route signatures
CurrentIdentity = Annotated[Identity, Depends(get_current_identity)]


def require_scope(scope: str):
    """
    Factory for scope-checking dependencies.

    Usage:
        @app.get("/admin", dependencies=[Depends(require_scope("admin"))])
        async def admin_route(identity: CurrentIdentity):
            ...
    """

    async def checker(identity: CurrentIdentity) -> Identity:
        if not identity.has_scope(scope):
            raise HTTPException(
                status_code=403,
                detail=f"Missing required scope: {scope}",
            )
        return identity

    return checker


def require_client(client_id: str):
    """
    Factory for client-checking dependencies.

    Usage:
        @app.get("/clients/{client_id}/data")
        async def get_data(client_id: str, identity: CurrentIdentity):
            if not identity.can_access_client(client_id):
                raise HTTPException(status_code=403, detail="Access denied")
    """

    async def checker(identity: CurrentIdentity) -> Identity:
        if not identity.can_access_client(client_id):
            raise HTTPException(
                status_code=403,
                detail="Access denied to this client's resources",
            )
        return identity

    return checker

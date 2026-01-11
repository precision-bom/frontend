"""API key authentication for FastAPI."""

from typing import Optional

from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

from .models import ApiKey
from .stores import ApiKeyStore

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Singleton store instance
_api_key_store: Optional[ApiKeyStore] = None


def get_api_key_store() -> ApiKeyStore:
    """Get or create the API key store singleton."""
    global _api_key_store
    if _api_key_store is None:
        _api_key_store = ApiKeyStore("data/api_keys.db")
    return _api_key_store


async def require_api_key(
    api_key: Optional[str] = Security(api_key_header),
) -> ApiKey:
    """
    FastAPI dependency that requires a valid API key.

    Validates the X-API-Key header and returns the ApiKey model.
    Raises 401 if missing or invalid.
    """
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Missing X-API-Key header",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    store = get_api_key_store()
    validated = store.validate_key(api_key)

    if not validated:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    return validated


def require_scope(scope: str):
    """
    Factory that creates a dependency requiring a specific scope.

    Usage:
        @app.get("/admin", dependencies=[Depends(require_scope("admin"))])
    """

    async def checker(api_key: ApiKey = Security(require_api_key)) -> ApiKey:
        if "all" not in api_key.scopes and scope not in api_key.scopes:
            raise HTTPException(
                status_code=403,
                detail=f"Missing required scope: {scope}",
            )
        return api_key

    return checker

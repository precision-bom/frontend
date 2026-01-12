"""API key store with PostgreSQL persistence."""

import hashlib
import secrets
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from ..db import get_session
from ..db.tables import ApiKeyTable
from ..models import ApiKey


def _hash_key(raw_key: str) -> str:
    """Hash a raw API key using SHA-256."""
    return hashlib.sha256(raw_key.encode()).hexdigest()


def _generate_key() -> str:
    """Generate a new API key with pbom_sk_ prefix."""
    return f"pbom_sk_{secrets.token_urlsafe(32)}"


def _utc_now() -> datetime:
    """Get current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


class ApiKeyStore:
    """Store for API keys with PostgreSQL persistence."""

    def __init__(self, session: Optional[Session] = None):
        """
        Initialize store.

        Args:
            session: Optional SQLAlchemy session. If not provided,
                     will create new sessions per operation.
        """
        self._session = session

    def _get_session(self) -> Session:
        """Get session - either injected or create new one."""
        if self._session:
            return self._session
        return next(get_session())

    def _close_session(self, session: Session) -> None:
        """Close session if it was created by this store."""
        if session is not self._session:
            session.close()

    def _row_to_api_key(self, row: ApiKeyTable) -> ApiKey:
        """Convert database row to ApiKey model."""
        return ApiKey(
            key_id=row.key_id,
            hashed_key=row.hashed_key,
            client_id=row.client_id,
            name=row.name,
            scopes=row.scopes.split(",") if row.scopes else ["all"],
            created_at=row.created_at,
            last_used=row.last_used,
            is_active=row.is_active,
        )

    def create_key(
        self,
        name: str,
        client_id: str,
        scopes: list[str] | None = None,
    ) -> tuple[ApiKey, str]:
        """
        Create a new API key.

        Args:
            name: Human-readable name for the key
            client_id: Client ID this key belongs to (required)
            scopes: List of permission scopes (defaults to ["all"])

        Returns:
            Tuple of (ApiKey model, raw key string).
            The raw key is only returned once and should be shown to the user.
        """
        if scopes is None:
            scopes = ["all"]

        raw_key = _generate_key()
        hashed_key = _hash_key(raw_key)

        api_key = ApiKey(
            hashed_key=hashed_key,
            client_id=client_id,
            name=name,
            scopes=scopes,
        )

        session = self._get_session()
        try:
            row = ApiKeyTable(
                key_id=api_key.key_id,
                hashed_key=api_key.hashed_key,
                client_id=api_key.client_id,
                name=api_key.name,
                scopes=",".join(api_key.scopes),
                is_active=True,
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            return self._row_to_api_key(row), raw_key
        finally:
            self._close_session(session)

    def validate_key(self, raw_key: str) -> Optional[ApiKey]:
        """
        Validate a raw API key.

        If valid, updates last_used timestamp and returns the ApiKey.
        If invalid or inactive, returns None.
        """
        hashed_key = _hash_key(raw_key)

        session = self._get_session()
        try:
            stmt = select(ApiKeyTable).where(
                ApiKeyTable.hashed_key == hashed_key,
                ApiKeyTable.is_active == True,  # noqa: E712
            )
            row = session.execute(stmt).scalar_one_or_none()

            if not row:
                return None

            # Update last_used
            now = _utc_now()
            update_stmt = (
                update(ApiKeyTable)
                .where(ApiKeyTable.key_id == row.key_id)
                .values(last_used=now)
            )
            session.execute(update_stmt)
            session.commit()

            # Return with updated last_used
            api_key = self._row_to_api_key(row)
            api_key.last_used = now
            return api_key
        finally:
            self._close_session(session)

    def revoke_key(self, key_id: str) -> bool:
        """
        Revoke an API key by setting is_active to False.

        Returns True if the key was found and revoked, False otherwise.
        """
        session = self._get_session()
        try:
            stmt = (
                update(ApiKeyTable)
                .where(ApiKeyTable.key_id == key_id)
                .values(is_active=False)
            )
            result = session.execute(stmt)
            session.commit()
            return result.rowcount > 0
        finally:
            self._close_session(session)

    def list_keys(self, client_id: str | None = None) -> list[ApiKey]:
        """
        List API keys, optionally filtered by client_id.

        Note: Returns ApiKey objects with hashed_key field (not the raw key).
        """
        session = self._get_session()
        try:
            stmt = select(ApiKeyTable).order_by(ApiKeyTable.created_at.desc())
            if client_id:
                stmt = stmt.where(ApiKeyTable.client_id == client_id)

            rows = session.execute(stmt).scalars().all()
            return [self._row_to_api_key(row) for row in rows]
        finally:
            self._close_session(session)

    def get_key(self, key_id: str) -> Optional[ApiKey]:
        """Get a specific API key by its ID."""
        session = self._get_session()
        try:
            stmt = select(ApiKeyTable).where(ApiKeyTable.key_id == key_id)
            row = session.execute(stmt).scalar_one_or_none()
            if row:
                return self._row_to_api_key(row)
            return None
        finally:
            self._close_session(session)

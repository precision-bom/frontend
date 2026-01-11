"""API key store with SQLite persistence."""

import hashlib
import secrets
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional

from ..models import ApiKey


def _hash_key(raw_key: str) -> str:
    """Hash a raw API key using SHA-256."""
    return hashlib.sha256(raw_key.encode()).hexdigest()


def _generate_key() -> str:
    """Generate a new API key with pbom_sk_ prefix."""
    return f"pbom_sk_{secrets.token_urlsafe(32)}"


class ApiKeyStore:
    """Store for API keys with SQLite persistence."""

    def __init__(self, db_path: str = "data/api_keys.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        """Initialize the database schema."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS api_keys (
                    key_id TEXT PRIMARY KEY,
                    hashed_key TEXT NOT NULL UNIQUE,
                    name TEXT NOT NULL,
                    scopes TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    last_used TEXT,
                    is_active INTEGER DEFAULT 1
                )
            """)
            conn.commit()

    def create_key(self, name: str, scopes: list[str] | None = None) -> tuple[ApiKey, str]:
        """
        Create a new API key.

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
            name=name,
            scopes=scopes,
        )

        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO api_keys (key_id, hashed_key, name, scopes, created_at, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    api_key.key_id,
                    api_key.hashed_key,
                    api_key.name,
                    ",".join(api_key.scopes),
                    api_key.created_at.isoformat(),
                    1,
                ),
            )
            conn.commit()

        return api_key, raw_key

    def validate_key(self, raw_key: str) -> Optional[ApiKey]:
        """
        Validate a raw API key.

        If valid, updates last_used timestamp and returns the ApiKey.
        If invalid or inactive, returns None.
        """
        hashed_key = _hash_key(raw_key)

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """
                SELECT key_id, hashed_key, name, scopes, created_at, last_used, is_active
                FROM api_keys
                WHERE hashed_key = ? AND is_active = 1
                """,
                (hashed_key,),
            )
            row = cursor.fetchone()

            if not row:
                return None

            # Update last_used
            now = datetime.utcnow()
            conn.execute(
                "UPDATE api_keys SET last_used = ? WHERE key_id = ?",
                (now.isoformat(), row[0]),
            )
            conn.commit()

            return ApiKey(
                key_id=row[0],
                hashed_key=row[1],
                name=row[2],
                scopes=row[3].split(",") if row[3] else ["all"],
                created_at=datetime.fromisoformat(row[4]),
                last_used=now,
                is_active=bool(row[6]),
            )

    def revoke_key(self, key_id: str) -> bool:
        """
        Revoke an API key by setting is_active to False.

        Returns True if the key was found and revoked, False otherwise.
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "UPDATE api_keys SET is_active = 0 WHERE key_id = ?",
                (key_id,),
            )
            conn.commit()
            return cursor.rowcount > 0

    def list_keys(self) -> list[ApiKey]:
        """
        List all API keys.

        Note: Returns ApiKey objects with hashed_key field (not the raw key).
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """
                SELECT key_id, hashed_key, name, scopes, created_at, last_used, is_active
                FROM api_keys
                ORDER BY created_at DESC
                """
            )

            keys = []
            for row in cursor.fetchall():
                keys.append(
                    ApiKey(
                        key_id=row[0],
                        hashed_key=row[1],
                        name=row[2],
                        scopes=row[3].split(",") if row[3] else ["all"],
                        created_at=datetime.fromisoformat(row[4]),
                        last_used=datetime.fromisoformat(row[5]) if row[5] else None,
                        is_active=bool(row[6]),
                    )
                )
            return keys

    def get_key(self, key_id: str) -> Optional[ApiKey]:
        """Get a specific API key by its ID."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """
                SELECT key_id, hashed_key, name, scopes, created_at, last_used, is_active
                FROM api_keys
                WHERE key_id = ?
                """,
                (key_id,),
            )
            row = cursor.fetchone()

            if not row:
                return None

            return ApiKey(
                key_id=row[0],
                hashed_key=row[1],
                name=row[2],
                scopes=row[3].split(",") if row[3] else ["all"],
                created_at=datetime.fromisoformat(row[4]),
                last_used=datetime.fromisoformat(row[5]) if row[5] else None,
                is_active=bool(row[6]),
            )

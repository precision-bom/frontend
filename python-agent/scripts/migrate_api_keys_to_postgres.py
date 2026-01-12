#!/usr/bin/env python3
"""Migrate API keys from SQLite to PostgreSQL.

This script:
1. Reads all API keys from the SQLite database (data/api_keys.db)
2. Inserts them into the PostgreSQL database
3. Skips duplicates (based on key_id)

Usage:
    uv run python scripts/migrate_api_keys_to_postgres.py

Requirements:
    - DATABASE_URL environment variable must be set
    - SQLite database at data/api_keys.db must exist
"""

import os
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from bom_agent_service.db import get_session, init_db
from bom_agent_service.db.tables import ApiKeyTable


def parse_datetime(value: str | None) -> datetime | None:
    """Parse ISO format datetime string, making it timezone-aware."""
    if not value:
        return None
    dt = datetime.fromisoformat(value)
    # Make timezone-aware if naive
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def migrate_api_keys():
    """Migrate API keys from SQLite to PostgreSQL."""
    sqlite_path = Path("data/api_keys.db")

    if not sqlite_path.exists():
        print(f"SQLite database not found at {sqlite_path}")
        print("Nothing to migrate.")
        return 0

    # Check DATABASE_URL is set
    if not os.getenv("DATABASE_URL"):
        print("ERROR: DATABASE_URL environment variable is required")
        return 1

    # Initialize PostgreSQL tables
    print("Initializing PostgreSQL database...")
    init_db()

    # Read from SQLite
    print(f"Reading from {sqlite_path}...")
    conn = sqlite3.connect(sqlite_path)
    cursor = conn.execute("""
        SELECT key_id, hashed_key, client_id, name, scopes, created_at, last_used, is_active
        FROM api_keys
    """)
    rows = cursor.fetchall()
    conn.close()

    print(f"Found {len(rows)} API keys in SQLite")

    if not rows:
        print("No API keys to migrate.")
        return 0

    # Insert into PostgreSQL
    session = next(get_session())
    migrated = 0
    skipped = 0
    errors = 0

    for row in rows:
        key_id, hashed_key, client_id, name, scopes, created_at, last_used, is_active = row

        # Check if key already exists
        existing = session.execute(
            select(ApiKeyTable).where(ApiKeyTable.key_id == key_id)
        ).scalar_one_or_none()

        if existing:
            print(f"  SKIP: {key_id} ({name}) - already exists")
            skipped += 1
            continue

        # Check if client_id is valid (required for FK constraint)
        if not client_id:
            print(f"  ERROR: {key_id} ({name}) - missing client_id, cannot migrate")
            errors += 1
            continue

        try:
            api_key = ApiKeyTable(
                key_id=key_id,
                hashed_key=hashed_key,
                client_id=client_id,
                name=name,
                scopes=scopes or "all",
                created_at=parse_datetime(created_at) or datetime.now(timezone.utc),
                last_used=parse_datetime(last_used),
                is_active=bool(is_active),
            )
            session.add(api_key)
            session.commit()
            print(f"  OK: {key_id} ({name})")
            migrated += 1
        except IntegrityError as e:
            session.rollback()
            if "client_id" in str(e) or "foreign key" in str(e).lower():
                print(f"  ERROR: {key_id} ({name}) - client {client_id} does not exist in PostgreSQL")
            else:
                print(f"  ERROR: {key_id} ({name}) - {e}")
            errors += 1
        except Exception as e:
            session.rollback()
            print(f"  ERROR: {key_id} ({name}) - {e}")
            errors += 1

    session.close()

    print()
    print("Migration complete!")
    print(f"  Migrated: {migrated}")
    print(f"  Skipped (already exist): {skipped}")
    print(f"  Errors: {errors}")

    if errors > 0:
        print()
        print("NOTE: Keys with errors were not migrated.")
        print("      Ensure the corresponding clients exist in PostgreSQL first.")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(migrate_api_keys())

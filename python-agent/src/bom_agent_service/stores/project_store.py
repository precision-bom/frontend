"""Project store with SQLite persistence."""

import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional

from ..models import Project, ProjectContext, BOMLineItem


class ProjectStore:
    """Store for project state with SQLite persistence."""

    def __init__(self, db_path: str = "data/projects.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        """Initialize the database schema."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    project_id TEXT PRIMARY KEY,
                    data JSON NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            conn.commit()

    def create_project(self, context: ProjectContext, line_items: list[BOMLineItem]) -> Project:
        """Create a new project."""
        project = Project(
            project_id=context.project_id,
            context=context,
            line_items=line_items,
            status="created",
        )

        # Set project_id on line items
        for item in project.line_items:
            item.project_id = project.project_id

        self._save(project)
        return project

    def get_project(self, project_id: str) -> Optional[Project]:
        """Get a project by ID."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT data FROM projects WHERE project_id = ?",
                (project_id,)
            )
            row = cursor.fetchone()
            if row:
                return Project.model_validate_json(row[0])
            return None

    def update_project(self, project: Project) -> None:
        """Update an existing project."""
        project.updated_at = datetime.utcnow()
        self._save(project)

    def list_projects(self, limit: int = 100) -> list[Project]:
        """List all projects."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT data FROM projects ORDER BY created_at DESC LIMIT ?",
                (limit,)
            )
            return [Project.model_validate_json(row[0]) for row in cursor.fetchall()]

    def delete_project(self, project_id: str) -> bool:
        """Delete a project."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "DELETE FROM projects WHERE project_id = ?",
                (project_id,)
            )
            conn.commit()
            return cursor.rowcount > 0

    def _save(self, project: Project) -> None:
        """Save a project to the database."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO projects (project_id, data, created_at, updated_at)
                VALUES (?, ?, ?, ?)
            """, (
                project.project_id,
                project.model_dump_json(),
                project.created_at.isoformat(),
                project.updated_at.isoformat(),
            ))
            conn.commit()

"""FastAPI routers for BOM Agent Service."""

from .projects import router as projects_router
from .knowledge import router as knowledge_router
from .search import router as search_router

__all__ = ["projects_router", "knowledge_router", "search_router"]

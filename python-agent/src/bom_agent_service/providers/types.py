"""Provider types and abstract base class."""

from abc import ABC, abstractmethod
from typing import Optional

from pydantic import BaseModel


class ProviderResult(BaseModel):
    """Normalized result from any part provider."""

    mpn: str
    manufacturer: str
    description: str
    price: float
    currency: str
    stock: int
    min_quantity: int
    provider: str  # "digikey", "mouser", "octopart"
    distributor: str  # Actual distributor name
    url: str


class PartProvider(ABC):
    """Abstract base class for part providers."""

    name: str

    @abstractmethod
    def is_configured(self) -> bool:
        """Check if this provider has required credentials configured."""
        pass

    @abstractmethod
    async def search(self, query: str) -> list[ProviderResult]:
        """Search for parts by a general query string."""
        pass

    @abstractmethod
    async def search_by_mpn(
        self, mpn: str, manufacturer: Optional[str] = None
    ) -> list[ProviderResult]:
        """Search for parts by manufacturer part number."""
        pass

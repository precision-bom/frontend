"""DigiKey part provider with OAuth 2.0 authentication."""

import logging
import os
import time
from typing import Optional

import httpx

from .types import PartProvider, ProviderResult

logger = logging.getLogger(__name__)

DIGIKEY_TOKEN_URL = "https://api.digikey.com/v1/oauth2/token"
DIGIKEY_SEARCH_URL = "https://api.digikey.com/products/v4/search/keyword"


class TokenCache:
    """In-memory OAuth token cache."""

    def __init__(self):
        self.token: Optional[str] = None
        self.expires_at: float = 0


_token_cache = TokenCache()


class DigiKeyProvider(PartProvider):
    """DigiKey part provider using OAuth 2.0."""

    name = "digikey"

    def __init__(self):
        self.client_id = os.getenv("DIGIKEY_CLIENT_ID", "")
        self.client_secret = os.getenv("DIGIKEY_CLIENT_SECRET", "")

    def is_configured(self) -> bool:
        """Check if DigiKey credentials are configured."""
        return bool(self.client_id and self.client_secret)

    async def _get_access_token(self) -> str:
        """Get OAuth access token with caching."""
        # Check if we have a valid cached token (with 60s buffer)
        if _token_cache.token and _token_cache.expires_at > time.time() + 60:
            return _token_cache.token

        if not self.client_id or not self.client_secret:
            raise ValueError("DigiKey OAuth credentials not configured")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                DIGIKEY_TOKEN_URL,
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            data = response.json()

            _token_cache.token = data["access_token"]
            _token_cache.expires_at = time.time() + data["expires_in"]

            logger.info("Obtained new DigiKey OAuth token")
            return _token_cache.token

    async def search(self, query: str) -> list[ProviderResult]:
        """Search for parts by query."""
        return await self._execute_search(query)

    async def search_by_mpn(
        self, mpn: str, manufacturer: Optional[str] = None
    ) -> list[ProviderResult]:
        """Search for parts by MPN."""
        return await self._execute_search(mpn)

    async def _execute_search(self, query: str) -> list[ProviderResult]:
        """Execute search against DigiKey API."""
        if not self.is_configured():
            raise ValueError(
                "DigiKey credentials not configured. "
                "Set DIGIKEY_CLIENT_ID and DIGIKEY_CLIENT_SECRET."
            )

        token = await self._get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                DIGIKEY_SEARCH_URL,
                headers={
                    "Authorization": f"Bearer {token}",
                    "X-DIGIKEY-Client-Id": self.client_id,
                    "Content-Type": "application/json",
                },
                json={
                    "Keywords": query,
                    "RecordCount": 10,
                    "RecordStartPosition": 0,
                    "ExcludeMarketPlaceProducts": True,
                },
                timeout=30.0,
            )
            response.raise_for_status()
            return self._transform_results(response.json())

    def _transform_results(self, data: dict) -> list[ProviderResult]:
        """Transform DigiKey response to ProviderResult list."""
        results: list[ProviderResult] = []

        products = data.get("Products", [])
        if not products:
            return results

        for product in products:
            # Get the best price (qty 1 or lowest tier)
            price = product.get("UnitPrice", 0)
            standard_pricing = product.get("StandardPricing", [])
            if standard_pricing:
                price = standard_pricing[0].get("UnitPrice", price)

            if not price or price <= 0:
                continue

            manufacturer_data = product.get("Manufacturer", {})
            mpn = product.get("ManufacturerPartNumber", "")

            results.append(
                ProviderResult(
                    mpn=mpn,
                    manufacturer=manufacturer_data.get("Name", "Unknown"),
                    description=product.get("ProductDescription", "")
                    or product.get("DetailedDescription", ""),
                    price=price,
                    currency="USD",
                    stock=product.get("QuantityAvailable", 0),
                    min_quantity=product.get("MinimumOrderQuantity", 1),
                    provider=self.name,
                    distributor="DigiKey",
                    url=product.get("ProductUrl", "")
                    or f"https://www.digikey.com/products/en?keywords={mpn}",
                )
            )

        return sorted(results, key=lambda r: r.price)

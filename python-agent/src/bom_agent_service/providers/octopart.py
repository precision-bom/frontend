"""Octopart/Nexar part provider with OAuth 2.0 and GraphQL."""

import logging
import os
import time
from typing import Optional

import httpx

from .types import PartProvider, ProviderResult

logger = logging.getLogger(__name__)

NEXAR_TOKEN_URL = "https://identity.nexar.com/connect/token"
NEXAR_API_URL = "https://api.nexar.com/graphql"

SEARCH_QUERY = """
query Search($q: String!) {
  supSearch(q: $q, limit: 10) {
    results {
      part {
        mpn
        manufacturer {
          name
        }
        shortDescription
        sellers {
          company {
            name
          }
          offers {
            clickUrl
            inventoryLevel
            moq
            prices {
              price
              currency
              quantity
            }
          }
        }
      }
    }
  }
}
"""


class TokenCache:
    """In-memory OAuth token cache."""

    def __init__(self):
        self.token: Optional[str] = None
        self.expires_at: float = 0


_token_cache = TokenCache()


class OctopartProvider(PartProvider):
    """Octopart/Nexar part provider using OAuth 2.0 and GraphQL."""

    name = "octopart"

    def __init__(self):
        self.client_id = os.getenv("OCTOPART_CLIENT_ID", "")
        self.client_secret = os.getenv("OCTOPART_CLIENT_SECRET", "")

    def is_configured(self) -> bool:
        """Check if Octopart credentials are configured."""
        return bool(self.client_id and self.client_secret)

    async def _get_access_token(self) -> str:
        """Get OAuth access token with caching."""
        # Check if we have a valid cached token (with 60s buffer)
        if _token_cache.token and _token_cache.expires_at > time.time() + 60:
            return _token_cache.token

        if not self.client_id or not self.client_secret:
            raise ValueError("Octopart OAuth credentials not configured")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                NEXAR_TOKEN_URL,
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

            logger.info("Obtained new Octopart OAuth token")
            return _token_cache.token

    async def search(self, query: str) -> list[ProviderResult]:
        """Search for parts by query."""
        return await self._execute_search(query)

    async def search_by_mpn(
        self, mpn: str, manufacturer: Optional[str] = None
    ) -> list[ProviderResult]:
        """Search for parts by MPN."""
        query = f"{manufacturer} {mpn}" if manufacturer else mpn
        return await self._execute_search(query)

    async def _execute_search(self, query: str) -> list[ProviderResult]:
        """Execute GraphQL search against Nexar API."""
        if not self.is_configured():
            raise ValueError(
                "Octopart credentials not configured. "
                "Set OCTOPART_CLIENT_ID and OCTOPART_CLIENT_SECRET."
            )

        token = await self._get_access_token()

        async with httpx.AsyncClient() as client:
            response = await client.post(
                NEXAR_API_URL,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json={
                    "query": SEARCH_QUERY,
                    "variables": {"q": query},
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()

            # Check for GraphQL errors
            if "errors" in data:
                error_msg = data["errors"][0].get("message", "Unknown GraphQL error")
                logger.error(f"GraphQL errors: {data['errors']}")
                raise ValueError(f"Nexar API error: {error_msg}")

            return self._transform_results(data)

    def _transform_results(self, data: dict) -> list[ProviderResult]:
        """Transform Nexar GraphQL response to ProviderResult list."""
        results: list[ProviderResult] = []

        sup_search = data.get("data", {}).get("supSearch", {})
        search_results = sup_search.get("results", [])
        if not search_results:
            return results

        for result in search_results:
            part = result.get("part", {})
            sellers = part.get("sellers", [])
            if not sellers:
                continue

            mpn = part.get("mpn", "")
            manufacturer = part.get("manufacturer", {}).get("name", "Unknown")
            description = part.get("shortDescription", "")

            for seller in sellers:
                company_name = seller.get("company", {}).get("name", "Unknown")
                offers = seller.get("offers", [])

                for offer in offers:
                    prices = offer.get("prices", [])
                    if not prices:
                        continue

                    # Find the lowest price
                    lowest_price = min(prices, key=lambda p: p.get("price", float("inf")))
                    price = lowest_price.get("price", 0)
                    if price <= 0:
                        continue

                    moq = offer.get("moq") or 1
                    inventory = offer.get("inventoryLevel") or 0

                    results.append(
                        ProviderResult(
                            mpn=mpn,
                            manufacturer=manufacturer,
                            description=description,
                            price=price,
                            currency=lowest_price.get("currency", "USD"),
                            stock=inventory,
                            min_quantity=moq,
                            provider=self.name,
                            distributor=company_name,
                            url=offer.get("clickUrl", ""),
                        )
                    )

        return sorted(results, key=lambda r: r.price)

"""Mouser part provider with API key authentication."""

import logging
import os
import re
from typing import Optional

import httpx

from .types import PartProvider, ProviderResult

logger = logging.getLogger(__name__)

MOUSER_API_URL = "https://api.mouser.com/api/v1/search/keyword"


class MouserProvider(PartProvider):
    """Mouser part provider using API key."""

    name = "mouser"

    def __init__(self):
        self.api_key = os.getenv("MOUSER_API_KEY", "")

    def is_configured(self) -> bool:
        """Check if Mouser API key is configured."""
        return bool(self.api_key)

    async def search(self, query: str) -> list[ProviderResult]:
        """Search for parts by query."""
        return await self._execute_search(query)

    async def search_by_mpn(
        self, mpn: str, manufacturer: Optional[str] = None
    ) -> list[ProviderResult]:
        """Search for parts by MPN."""
        return await self._execute_search(mpn)

    async def _execute_search(self, query: str) -> list[ProviderResult]:
        """Execute search against Mouser API."""
        if not self.is_configured():
            raise ValueError(
                "Mouser API key not configured. Set MOUSER_API_KEY environment variable."
            )

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MOUSER_API_URL}?apiKey={self.api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "SearchByKeywordRequest": {
                        "keyword": query,
                        "records": 10,
                        "startingRecord": 0,
                        "searchOptions": "",
                        "searchWithYourSignUpLanguage": "",
                    }
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()

            # Check for API errors
            errors = data.get("Errors", [])
            if errors:
                raise ValueError(f"Mouser API error: {errors[0].get('Message', 'Unknown error')}")

            return self._transform_results(data)

    def _transform_results(self, data: dict) -> list[ProviderResult]:
        """Transform Mouser response to ProviderResult list."""
        results: list[ProviderResult] = []

        search_results = data.get("SearchResults", {})
        parts = search_results.get("Parts", [])
        if not parts:
            return results

        for part in parts:
            # Parse availability (e.g., "2500 In Stock")
            availability = part.get("Availability", "")
            stock_match = re.search(r"(\d+)", availability)
            stock = int(stock_match.group(1)) if stock_match else 0

            # Get the lowest price from price breaks
            price_breaks = part.get("PriceBreaks", [])
            if not price_breaks:
                continue

            # First price break is usually qty 1
            lowest_price_break = price_breaks[0]
            price_str = lowest_price_break.get("Price", "0")
            # Remove currency symbols and parse
            price = float(re.sub(r"[^0-9.]", "", price_str))

            if price <= 0:
                continue

            min_qty_str = part.get("Min", "1")
            try:
                min_qty = int(min_qty_str)
            except (ValueError, TypeError):
                min_qty = 1

            results.append(
                ProviderResult(
                    mpn=part.get("ManufacturerPartNumber", ""),
                    manufacturer=part.get("Manufacturer", "Unknown"),
                    description=part.get("Description", ""),
                    price=price,
                    currency=lowest_price_break.get("Currency", "USD"),
                    stock=stock,
                    min_quantity=min_qty,
                    provider=self.name,
                    distributor="Mouser",
                    url=part.get("ProductDetailUrl", ""),
                )
            )

        return sorted(results, key=lambda r: r.price)

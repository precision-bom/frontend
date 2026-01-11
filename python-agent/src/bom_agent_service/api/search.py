"""Search API router for part searches across providers."""

from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from ..providers import (
    ProviderResult,
    get_all_provider_names,
    get_configured_providers,
    search_all_providers,
)

router = APIRouter(prefix="/search", tags=["search"])


class SearchPartsRequest(BaseModel):
    """Request body for part search."""

    query: str
    manufacturer: Optional[str] = None
    providers: Optional[list[str]] = None  # If None, use all configured


class SearchPartsResponse(BaseModel):
    """Response for part search."""

    query: str
    results: list[ProviderResult]
    providers_searched: list[str]
    results_by_provider: dict[str, int]


class ProvidersResponse(BaseModel):
    """Response for listing providers."""

    configured: list[str]
    available: list[str]


@router.post("/parts", response_model=SearchPartsResponse)
async def search_parts(request: SearchPartsRequest):
    """
    Search for parts across all configured providers.

    The search runs in parallel across all specified (or all configured) providers
    and returns aggregated results sorted by price.
    """
    results_by_provider = await search_all_providers(
        query=request.query,
        providers=request.providers,
        manufacturer=request.manufacturer,
    )

    # Aggregate all results
    all_results: list[ProviderResult] = []
    counts: dict[str, int] = {}
    for provider, results in results_by_provider.items():
        all_results.extend(results)
        counts[provider] = len(results)

    # Sort by price
    all_results.sort(key=lambda r: r.price)

    return SearchPartsResponse(
        query=request.query,
        results=all_results,
        providers_searched=list(results_by_provider.keys()),
        results_by_provider=counts,
    )


@router.get("/providers", response_model=ProvidersResponse)
async def list_providers():
    """
    List available and configured providers.

    Returns both the list of all available provider integrations and
    which ones have valid credentials configured.
    """
    return ProvidersResponse(
        configured=get_configured_providers(),
        available=get_all_provider_names(),
    )

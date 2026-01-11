"""Provider registry for factory pattern and parallel search."""

import asyncio
import logging
from typing import Literal, Optional

from .types import PartProvider, ProviderResult
from .digikey import DigiKeyProvider
from .mouser import MouserProvider
from .octopart import OctopartProvider

logger = logging.getLogger(__name__)

ProviderName = Literal["digikey", "mouser", "octopart"]

_PROVIDER_CLASSES: dict[ProviderName, type[PartProvider]] = {
    "digikey": DigiKeyProvider,
    "mouser": MouserProvider,
    "octopart": OctopartProvider,
}


def get_all_provider_names() -> list[ProviderName]:
    """Get all available provider names."""
    return list(_PROVIDER_CLASSES.keys())


def get_configured_providers() -> list[ProviderName]:
    """Get list of providers with valid credentials configured."""
    configured = []
    for name, cls in _PROVIDER_CLASSES.items():
        provider = cls()
        if provider.is_configured():
            configured.append(name)
    return configured


def get_provider(name: ProviderName) -> PartProvider:
    """Get a provider instance by name."""
    if name not in _PROVIDER_CLASSES:
        raise ValueError(f"Unknown provider: {name}")
    return _PROVIDER_CLASSES[name]()


async def search_all_providers(
    query: str,
    providers: Optional[list[ProviderName]] = None,
    manufacturer: Optional[str] = None,
) -> dict[str, list[ProviderResult]]:
    """
    Search across multiple providers in parallel.

    Args:
        query: Search query string
        providers: List of provider names to search. If None, uses all configured providers.
        manufacturer: Optional manufacturer name for MPN search

    Returns:
        Dict mapping provider name to list of results
    """
    if providers is None:
        providers = get_configured_providers()

    if not providers:
        logger.warning("No providers configured or specified")
        return {}

    async def search_provider(name: ProviderName) -> tuple[str, list[ProviderResult]]:
        provider = get_provider(name)
        try:
            if manufacturer:
                results = await provider.search_by_mpn(query, manufacturer)
            else:
                results = await provider.search(query)
            logger.info(f"[{name}] Found {len(results)} results for '{query}'")
            return name, results
        except Exception as e:
            logger.error(f"[{name}] Search failed: {e}")
            return name, []

    tasks = [search_provider(name) for name in providers]
    results = await asyncio.gather(*tasks)

    return dict(results)

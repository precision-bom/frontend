"""Apify API client for running actors and retrieving scraped data."""

import asyncio
import logging
import os
from datetime import datetime
from typing import Optional
from enum import Enum

import httpx
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

APIFY_API_BASE = "https://api.apify.com/v2"


class ActorRunStatus(str, Enum):
    """Status of an Apify actor run."""
    READY = "READY"
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    ABORTING = "ABORTING"
    ABORTED = "ABORTED"
    TIMING_OUT = "TIMING-OUT"
    TIMED_OUT = "TIMED-OUT"


class ApifyActorConfig(BaseModel):
    """Configuration for an Apify actor to run."""
    actor_id: str = Field(description="The Apify actor ID (e.g., 'apify/web-scraper')")
    input_config: dict = Field(default_factory=dict, description="Input configuration for the actor")
    timeout_secs: int = Field(default=300, description="Maximum run time in seconds")
    memory_mbytes: int = Field(default=1024, description="Memory allocation in MB")


class ScrapedContent(BaseModel):
    """Content scraped from a URL by Apify."""
    url: str
    title: Optional[str] = None
    text_content: str = ""
    headings: list[str] = Field(default_factory=list)
    links: list[str] = Field(default_factory=list)
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict = Field(default_factory=dict)


class ApifyClient:
    """
    Client for Apify API to run web scraping actors and retrieve results.

    Supports running pre-built actors for web scraping to gather market intelligence
    about electronic components, supply chain news, and manufacturer updates.
    """

    def __init__(self, api_token: Optional[str] = None):
        """Initialize client with API token from env or parameter."""
        self.api_token = api_token or os.getenv("APIFY_API_TOKEN", "")
        self._http_client: Optional[httpx.AsyncClient] = None

    def is_configured(self) -> bool:
        """Check if Apify credentials are configured."""
        return bool(self.api_token)

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client."""
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(
                base_url=APIFY_API_BASE,
                headers={"Authorization": f"Bearer {self.api_token}"},
                timeout=60.0,
            )
        return self._http_client

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()
            self._http_client = None

    async def run_actor(
        self,
        actor_id: str,
        input_config: dict,
        wait_for_finish: bool = True,
        timeout_secs: int = 300,
        memory_mbytes: int = 1024,
    ) -> dict:
        """
        Run an Apify actor and optionally wait for completion.

        Args:
            actor_id: Actor ID (e.g., 'apify/web-scraper')
            input_config: Input configuration for the actor
            wait_for_finish: Whether to wait for the run to complete
            timeout_secs: Maximum run time
            memory_mbytes: Memory allocation

        Returns:
            Run details including dataset ID for results
        """
        if not self.is_configured():
            raise ValueError("Apify API token not configured. Set APIFY_API_TOKEN env var.")

        client = await self._get_client()

        # Start the actor run
        response = await client.post(
            f"/acts/{actor_id}/runs",
            json=input_config,
            params={
                "timeout": timeout_secs,
                "memory": memory_mbytes,
            },
        )
        response.raise_for_status()
        run_data = response.json()["data"]
        run_id = run_data["id"]

        logger.info(f"Started Apify actor {actor_id}, run ID: {run_id}")

        if not wait_for_finish:
            return run_data

        # Poll for completion
        return await self._wait_for_run(run_id, timeout_secs)

    async def _wait_for_run(self, run_id: str, timeout_secs: int) -> dict:
        """Poll for actor run completion."""
        client = await self._get_client()
        start_time = asyncio.get_event_loop().time()

        while True:
            response = await client.get(f"/actor-runs/{run_id}")
            response.raise_for_status()
            run_data = response.json()["data"]
            status = ActorRunStatus(run_data["status"])

            if status == ActorRunStatus.SUCCEEDED:
                logger.info(f"Actor run {run_id} completed successfully")
                return run_data
            elif status in (ActorRunStatus.FAILED, ActorRunStatus.ABORTED, ActorRunStatus.TIMED_OUT):
                raise RuntimeError(f"Actor run {run_id} failed with status: {status.value}")

            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed > timeout_secs:
                raise TimeoutError(f"Actor run {run_id} timed out after {timeout_secs}s")

            await asyncio.sleep(2)

    async def get_dataset_items(
        self,
        dataset_id: str,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict]:
        """
        Retrieve items from an Apify dataset.

        Args:
            dataset_id: Dataset ID from actor run
            limit: Maximum number of items
            offset: Starting offset

        Returns:
            List of scraped items
        """
        if not self.is_configured():
            raise ValueError("Apify API token not configured")

        client = await self._get_client()

        response = await client.get(
            f"/datasets/{dataset_id}/items",
            params={"limit": limit, "offset": offset},
        )
        response.raise_for_status()
        return response.json()

    async def scrape_urls(
        self,
        urls: list[str],
        max_pages_per_site: int = 5,
        extract_text: bool = True,
    ) -> list[ScrapedContent]:
        """
        Scrape content from a list of URLs using Apify's web scraper.

        Args:
            urls: List of URLs to scrape
            max_pages_per_site: Max pages to crawl per starting URL
            extract_text: Whether to extract text content

        Returns:
            List of scraped content objects
        """
        if not self.is_configured():
            raise ValueError("Apify API token not configured. Set APIFY_API_TOKEN env var.")

        if not urls:
            return []

        # Use Apify's Web Scraper actor (free tier available)
        # Try multiple actor options in case one isn't available
        actor_ids = [
            "apify/web-scraper",  # Most common free actor
            "apify/cheerio-scraper",
            "apify/puppeteer-scraper",
        ]

        input_config = {
            "startUrls": [{"url": url} for url in urls],
            "maxRequestsPerCrawl": max_pages_per_site * len(urls),
            "maxCrawlDepth": 1,
            "pageFunction": """
                async function pageFunction(context) {
                    const { page, request, log } = context;

                    const title = await page.title();

                    // Extract headings
                    const h1s = await page.$$eval('h1', els => els.map(el => el.textContent.trim()));
                    const h2s = await page.$$eval('h2', els => els.map(el => el.textContent.trim()));
                    const h3s = await page.$$eval('h3', els => els.map(el => el.textContent.trim()));

                    // Extract main text content
                    const paragraphs = await page.$$eval(
                        'p, article, .content, .article-body, main',
                        els => els.map(el => el.textContent.trim()).filter(text => text.length > 50)
                    );

                    // Get links
                    const links = await page.$$eval('a[href]', els =>
                        els.map(el => el.href)
                            .filter(href => href && href.startsWith('http'))
                            .slice(0, 20)
                    );

                    return {
                        url: request.url,
                        title: title,
                        headings: [...h1s, ...h2s, ...h3s],
                        text_content: paragraphs.join('\\n\\n'),
                        links: links,
                    };
                }
            """,
        }

        last_error = None
        for actor_id in actor_ids:
            try:
                run_data = await self.run_actor(
                    actor_id=actor_id,
                    input_config=input_config,
                    wait_for_finish=True,
                    timeout_secs=120,
                )

                dataset_id = run_data.get("defaultDatasetId")
                if not dataset_id:
                    logger.warning(f"No dataset ID in actor run result for {actor_id}")
                    continue

                items = await self.get_dataset_items(dataset_id, limit=100)

                return [
                    ScrapedContent(
                        url=item.get("url", ""),
                        title=item.get("title"),
                        text_content=item.get("text_content", ""),
                        headings=item.get("headings", []),
                        links=item.get("links", []),
                        metadata={"actor_id": actor_id, "run_id": run_data["id"]},
                    )
                    for item in items
                ]

            except Exception as e:
                logger.warning(f"Actor {actor_id} failed: {e}")
                last_error = e
                continue

        if last_error:
            logger.error(f"All Apify actors failed. Last error: {last_error}")
            raise last_error
        return []

    async def search_news(
        self,
        search_terms: list[str],
        news_sources: Optional[list[str]] = None,
        max_results: int = 20,
    ) -> list[ScrapedContent]:
        """
        Search for news articles related to electronic components or supply chain.

        Args:
            search_terms: Terms to search for (e.g., ["chip shortage", "STM32 supply"])
            news_sources: Optional list of news site URLs to focus on
            max_results: Maximum number of results

        Returns:
            List of scraped news articles
        """
        if not self.is_configured():
            raise ValueError("Apify API token not configured. Set APIFY_API_TOKEN env var.")

        # Build search queries
        queries = []
        for term in search_terms:
            # Add electronics/supply chain context to searches
            queries.append(f"{term} electronics supply chain")
            queries.append(f"{term} component shortage")
            queries.append(f"{term} manufacturer news")

        # Try different Google scraper actors
        actor_ids = [
            "apify/google-search-scraper",
            "nfp121/google-search-scraper",  # Alternative actor
        ]

        input_config = {
            "queries": queries[:10],  # Limit queries
            "maxPagesPerQuery": 1,
            "resultsPerPage": max_results // len(queries) if queries else max_results,
            "mobileResults": False,
            "languageCode": "en",
            "countryCode": "us",
        }

        last_error = None
        for actor_id in actor_ids:
            try:
                run_data = await self.run_actor(
                    actor_id=actor_id,
                    input_config=input_config,
                    wait_for_finish=True,
                    timeout_secs=180,
                )

                dataset_id = run_data.get("defaultDatasetId")
                if not dataset_id:
                    continue

                items = await self.get_dataset_items(dataset_id, limit=max_results)

                # Extract URLs from search results and scrape them
                urls_to_scrape = []
                for item in items:
                    organic_results = item.get("organicResults", [])
                    for result in organic_results[:5]:
                        url = result.get("url")
                        if url and not any(blocked in url for blocked in ["youtube.com", "facebook.com", "twitter.com"]):
                            urls_to_scrape.append(url)

                if not urls_to_scrape:
                    continue

                # Now scrape the actual news pages
                return await self.scrape_urls(urls_to_scrape[:max_results], max_pages_per_site=1)

            except Exception as e:
                logger.warning(f"News search actor {actor_id} failed: {e}")
                last_error = e
                continue

        # If all actors fail, fall back to scraping known news sites directly
        logger.info("Falling back to direct news site scraping")
        news_urls = [
            "https://www.eenewseurope.com/en/supply-chain/",
            "https://www.semiconductorengineering.com/",
            "https://www.electronicdesign.com/technologies/components",
        ]

        try:
            return await self.scrape_urls(news_urls, max_pages_per_site=2)
        except Exception as e:
            logger.error(f"Failed to search news with Apify: {e}")
            if last_error:
                raise last_error
            raise

    async def scrape_manufacturer_page(
        self,
        manufacturer_name: str,
        product_pages: Optional[list[str]] = None,
    ) -> list[ScrapedContent]:
        """
        Scrape manufacturer product pages for updates, lifecycle info, etc.

        Args:
            manufacturer_name: Name of the manufacturer
            product_pages: Optional list of specific product page URLs

        Returns:
            Scraped manufacturer content
        """
        if not self.is_configured():
            raise ValueError("Apify API token not configured. Set APIFY_API_TOKEN env var.")

        # Map common manufacturers to their product search URLs
        manufacturer_urls = {
            "texas instruments": "https://www.ti.com/sitesearch/en-us/docs/universalsearch.tsp?langPref=en-US&searchTerm=",
            "stmicroelectronics": "https://www.st.com/en/search.html?q=",
            "microchip": "https://www.microchip.com/en-us/search?searchQuery=",
            "nxp": "https://www.nxp.com/search?keyword=",
            "analog devices": "https://www.analog.com/en/search.html?q=",
            "infineon": "https://www.infineon.com/cms/en/search.html#!term=",
            "onsemi": "https://www.onsemi.com/products/",
        }

        urls = product_pages or []

        # If no specific pages provided, try to find the manufacturer site
        manufacturer_lower = manufacturer_name.lower()
        for mfg_name, base_url in manufacturer_urls.items():
            if mfg_name in manufacturer_lower or manufacturer_lower in mfg_name:
                # Scrape the main products/news page
                base_site = base_url.split("/search")[0].split("/site")[0]
                urls.extend([
                    f"{base_site}/about/newsroom" if "ti.com" in base_site else f"{base_site}/news",
                    base_site,
                ])
                break

        if not urls:
            logger.warning(f"No URLs found for manufacturer: {manufacturer_name}")
            return []

        return await self.scrape_urls(urls[:5], max_pages_per_site=3)

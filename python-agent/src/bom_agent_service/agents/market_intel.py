"""Market Intelligence agent using Apify for web scraping."""

import logging
import uuid
from datetime import datetime
from typing import Literal

from crewai import Agent, Task, Crew
from pydantic import BaseModel, Field

from ..models import BOMLineItem, ProjectContext
from ..models.market_intel import (
    MarketIntelItem,
    MarketIntelReport,
    IntelCategory,
    IntelSentiment,
)
from ..services.apify_client import ApifyClient, ScrapedContent
from ..stores.market_intel_store import MarketIntelStore
from .memory_config import get_llm

logger = logging.getLogger(__name__)


class AnalyzedIntel(BaseModel):
    """LLM-analyzed intel item."""
    title: str = Field(description="Brief title for this intel")
    summary: str = Field(description="2-3 sentence summary")
    category: Literal["supply_chain", "manufacturer_news", "component_shortage", "price_trend", "lifecycle", "regulatory", "general"] = Field(description="Category of intel")
    sentiment: Literal["positive", "negative", "neutral"] = Field(description="Sentiment of the intel")
    relevance_score: float = Field(ge=0.0, le=1.0, description="Relevance to BOM parts 0-1")
    related_mpns: list[str] = Field(default_factory=list, description="MPNs this relates to")
    related_manufacturers: list[str] = Field(default_factory=list, description="Manufacturers mentioned")
    key_insights: list[str] = Field(default_factory=list, description="Key takeaways")


class IntelAnalysisResult(BaseModel):
    """Result of analyzing scraped content."""
    analyzed_items: list[AnalyzedIntel] = Field(default_factory=list)
    supply_chain_risks: list[str] = Field(default_factory=list)
    shortage_alerts: list[str] = Field(default_factory=list)
    price_trends: dict[str, str] = Field(default_factory=dict)
    manufacturer_updates: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


class MarketIntelAgent:
    """
    Agent that gathers and analyzes market intelligence using Apify web scraping.

    This agent:
    1. Identifies search terms from BOM parts (manufacturers, component types)
    2. Uses Apify to scrape news and market data
    3. Analyzes scraped content for relevance to the BOM
    4. Produces a report with risks, alerts, and recommendations
    """

    def __init__(
        self,
        apify_client: ApifyClient,
        intel_store: MarketIntelStore,
    ):
        """Initialize agent with Apify client and storage."""
        self.apify_client = apify_client
        self.intel_store = intel_store
        self._llm = get_llm()

        self.agent = Agent(
            role="Market Intelligence Analyst",
            goal="Gather and analyze market intelligence to identify supply chain risks and opportunities",
            backstory="""You are an expert market intelligence analyst specializing in the
            electronics supply chain. You monitor news, manufacturer announcements, and industry
            trends to identify risks and opportunities for component sourcing. You excel at
            synthesizing information from multiple sources into actionable insights.""",
            llm=self._llm,
            verbose=False,
            allow_delegation=False,
        )

    async def gather_intel(
        self,
        line_items: list[BOMLineItem],
        project_context: ProjectContext,
    ) -> MarketIntelReport:
        """
        Gather market intelligence for BOM line items.

        Args:
            line_items: BOM line items to research
            project_context: Project context for relevance scoring

        Returns:
            MarketIntelReport with analyzed intelligence
        """
        report_id = str(uuid.uuid4())
        project_id = project_context.project_id or "unknown"

        if not self.apify_client.is_configured():
            logger.warning("Apify not configured - returning empty intel report")
            return MarketIntelReport(
                report_id=report_id,
                project_id=project_id,
                recommendations=["Apify API token not configured. Set APIFY_API_TOKEN to enable market intelligence."],
            )

        # Extract search terms from BOM
        search_terms = self._extract_search_terms(line_items)
        manufacturers = list(set(item.manufacturer for item in line_items if item.manufacturer))

        logger.info(f"Gathering market intel for {len(line_items)} parts, {len(manufacturers)} manufacturers")

        # Gather intel from multiple sources
        all_scraped: list[ScrapedContent] = []

        # 1. Search for news about the components/manufacturers
        try:
            news_items = await self.apify_client.search_news(
                search_terms=search_terms[:5],  # Top 5 search terms
                max_results=15,
            )
            all_scraped.extend(news_items)
            logger.info(f"Found {len(news_items)} news items")
        except Exception as e:
            logger.error(f"Failed to search news: {e}")

        # 2. Scrape manufacturer pages for updates
        for manufacturer in manufacturers[:3]:  # Top 3 manufacturers
            try:
                mfg_content = await self.apify_client.scrape_manufacturer_page(manufacturer)
                all_scraped.extend(mfg_content)
                logger.info(f"Scraped {len(mfg_content)} pages for {manufacturer}")
            except Exception as e:
                logger.error(f"Failed to scrape manufacturer {manufacturer}: {e}")

        if not all_scraped:
            logger.warning("No content scraped - returning empty report")
            return MarketIntelReport(
                report_id=report_id,
                project_id=project_id,
                recommendations=["No market intelligence gathered. Check Apify configuration and network connectivity."],
            )

        # Analyze scraped content with LLM
        analysis = await self._analyze_scraped_content(
            all_scraped,
            line_items,
            project_context,
        )

        # Build intel items from analysis
        intel_items: list[MarketIntelItem] = []
        for idx, analyzed in enumerate(analysis.analyzed_items):
            source_content = all_scraped[idx] if idx < len(all_scraped) else None
            intel_item = MarketIntelItem(
                intel_id=str(uuid.uuid4()),
                source_url=source_content.url if source_content else "",
                title=analyzed.title,
                summary=analyzed.summary,
                full_text=source_content.text_content if source_content else "",
                category=IntelCategory(analyzed.category),
                sentiment=IntelSentiment(analyzed.sentiment),
                relevance_score=analyzed.relevance_score,
                related_mpns=analyzed.related_mpns,
                related_manufacturers=analyzed.related_manufacturers,
                keywords=analyzed.key_insights,
            )
            intel_items.append(intel_item)

        # Store intel items
        self.intel_store.store_intel_items(intel_items)

        # Build report
        report = MarketIntelReport(
            report_id=report_id,
            project_id=project_id,
            items=intel_items,
            total_sources_scraped=len(all_scraped),
            total_items_found=len(intel_items),
            supply_chain_risks=analysis.supply_chain_risks,
            shortage_alerts=analysis.shortage_alerts,
            price_trends=analysis.price_trends,
            manufacturer_updates=analysis.manufacturer_updates,
            recommendations=analysis.recommendations,
        )

        # Store report
        self.intel_store.store_report(report)

        logger.info(
            f"Generated intel report: {len(intel_items)} items, "
            f"{len(analysis.supply_chain_risks)} risks, {len(analysis.shortage_alerts)} alerts"
        )

        return report

    def _extract_search_terms(self, line_items: list[BOMLineItem]) -> list[str]:
        """Extract relevant search terms from BOM items."""
        terms = set()

        for item in line_items:
            # Add manufacturer names
            if item.manufacturer:
                terms.add(item.manufacturer)

            # Add component categories based on description/value
            desc_lower = (item.description or "").lower()
            if "capacitor" in desc_lower or item.value and "f" in item.value.lower():
                terms.add("MLCC capacitor")
            if "resistor" in desc_lower:
                terms.add("chip resistor")
            if "mcu" in desc_lower or "microcontroller" in desc_lower:
                terms.add("microcontroller MCU")
            if "stm32" in (item.mpn or "").lower():
                terms.add("STM32")
            if "connector" in desc_lower:
                terms.add("electronic connector")

        # Add generic supply chain terms
        terms.add("semiconductor shortage")
        terms.add("electronics supply chain")

        return list(terms)

    async def _analyze_scraped_content(
        self,
        scraped: list[ScrapedContent],
        line_items: list[BOMLineItem],
        project_context: ProjectContext,
    ) -> IntelAnalysisResult:
        """Use LLM to analyze scraped content for relevance and insights."""
        if not scraped:
            return IntelAnalysisResult()

        # Build context about what we're looking for
        mpns = [item.mpn for item in line_items if item.mpn]
        manufacturers = list(set(item.manufacturer for item in line_items if item.manufacturer))

        # Build scraped content summary
        content_summaries = []
        for idx, content in enumerate(scraped[:20]):  # Limit to 20 items
            content_summaries.append(f"""
[Source {idx + 1}]
URL: {content.url}
Title: {content.title or 'Unknown'}
Headings: {', '.join(content.headings[:5]) if content.headings else 'None'}
Content Preview: {content.text_content[:500] if content.text_content else 'No content'}
""")

        all_content = "\n---\n".join(content_summaries)

        task = Task(
            description=f"""Analyze the following scraped web content for market intelligence relevant to
electronic component sourcing.

## BOM Context
- Part Numbers (MPNs): {', '.join(mpns[:20])}
- Manufacturers: {', '.join(manufacturers)}
- Product Type: {project_context.product_type.value}

## Scraped Content

{all_content}

---

For EACH piece of content, provide:
1. A brief title summarizing the intel
2. A 2-3 sentence summary
3. Category (supply_chain, manufacturer_news, component_shortage, price_trend, lifecycle, regulatory, general)
4. Sentiment (positive, negative, neutral)
5. Relevance score 0-1 (how relevant to the BOM)
6. Related MPNs (if any match or are mentioned)
7. Related manufacturers
8. Key insights

Then provide overall:
- Supply chain risks identified
- Shortage alerts for specific parts
- Price trends (MPN -> up/down/stable)
- Notable manufacturer updates
- Recommendations for sourcing decisions""",
            expected_output="Structured analysis of market intelligence with categorization, relevance scoring, and recommendations",
            agent=self.agent,
            output_pydantic=IntelAnalysisResult,
        )

        crew = Crew(
            agents=[self.agent],
            tasks=[task],
            verbose=False,
        )

        result = await crew.kickoff_async()

        if result.pydantic:
            return result.pydantic

        logger.warning("LLM did not return structured output for intel analysis")
        return IntelAnalysisResult()

    def get_intel_summary_for_sourcing(self, report: MarketIntelReport) -> str:
        """
        Generate a text summary of market intel for the sourcing agent.

        Args:
            report: The market intel report

        Returns:
            Formatted text summary for inclusion in agent prompts
        """
        if not report.items and not report.supply_chain_risks:
            return "No market intelligence available."

        lines = ["## Market Intelligence Summary\n"]

        if report.supply_chain_risks:
            lines.append("### Supply Chain Risks")
            for risk in report.supply_chain_risks[:5]:
                lines.append(f"- {risk}")
            lines.append("")

        if report.shortage_alerts:
            lines.append("### Shortage Alerts")
            for alert in report.shortage_alerts[:5]:
                lines.append(f"- {alert}")
            lines.append("")

        if report.price_trends:
            lines.append("### Price Trends")
            for mpn, trend in list(report.price_trends.items())[:10]:
                lines.append(f"- {mpn}: {trend}")
            lines.append("")

        if report.manufacturer_updates:
            lines.append("### Manufacturer Updates")
            for update in report.manufacturer_updates[:5]:
                lines.append(f"- {update}")
            lines.append("")

        if report.recommendations:
            lines.append("### Recommendations")
            for rec in report.recommendations[:5]:
                lines.append(f"- {rec}")
            lines.append("")

        # Add high-relevance intel items
        high_relevance = report.get_high_relevance_items(0.7)
        if high_relevance:
            lines.append("### Key Intel Items")
            for item in high_relevance[:5]:
                sentiment_emoji = {"positive": "+", "negative": "-", "neutral": "~"}[item.sentiment.value]
                lines.append(f"- [{sentiment_emoji}] {item.title}: {item.summary}")
            lines.append("")

        return "\n".join(lines)

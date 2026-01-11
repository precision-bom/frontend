"""Sourcing review agent with batch processing."""

import logging
from typing import Literal, Optional
from crewai import Agent, Task, Crew
from pydantic import BaseModel, Field

from ..models import (
    BOMLineItem,
    ProjectContext,
    AgentDecision,
    DecisionStatus,
    RiskLevel,
)
from ..models.market_intel import MarketIntelReport
from ..stores import OrgKnowledgeStore, OffersStore
from .memory_config import get_llm

logger = logging.getLogger(__name__)


# Pydantic models for structured output
class SourcingPartDecision(BaseModel):
    """Decision for a single part from sourcing review."""
    mpn: str = Field(description="The manufacturer part number")
    decision: Literal["APPROVED", "REJECTED"] = Field(description="Whether sourcing is approved or rejected")
    selected_supplier: Optional[str] = Field(default=None, description="The selected supplier ID")
    selected_supplier_name: Optional[str] = Field(default=None, description="The selected supplier name")
    unit_price: float = Field(default=0.0, description="Unit price from selected supplier")
    lead_time_days: int = Field(default=0, description="Lead time in days")
    risk_level: Literal["low", "medium", "high"] = Field(default="medium", description="Supply risk level")
    reasoning: str = Field(description="Explanation for the sourcing decision")


class SourcingBatchResult(BaseModel):
    """Batch result from sourcing review."""
    decisions: list[SourcingPartDecision] = Field(description="List of sourcing decisions for each part")


class SourcingAgent:
    """
    Evaluates supply availability and risk.
    Processes all parts in a single LLM call for efficiency.
    """

    def __init__(self, org_store: OrgKnowledgeStore):
        """Initialize agent with LLM. All context is pre-aggregated in prompts."""
        self.org_store = org_store
        self._llm = get_llm()

        self.agent = Agent(
            role="Supply Chain Analyst",
            goal="Evaluate supply risk and select optimal suppliers",
            backstory="""You are an experienced supply chain analyst specializing in
            electronics procurement and supplier risk assessment.""",
            llm=self._llm,
            verbose=False,
            allow_delegation=False,
        )

    async def evaluate_batch(
        self,
        line_items: list[BOMLineItem],
        project_context: ProjectContext,
        offers_store: OffersStore,
        market_intel_report: Optional[MarketIntelReport] = None,
    ) -> dict[str, AgentDecision]:
        """Evaluate sourcing for all line items in a single LLM call (async).

        Args:
            line_items: BOM line items to evaluate
            project_context: Project context and constraints
            offers_store: Store with supplier offers
            market_intel_report: Optional market intelligence from Apify scraping

        Returns a dict mapping MPN to AgentDecision.
        Raises ValueError if the LLM returns an invalid response.
        """
        if not line_items:
            return {}

        # Collect all unique suppliers across all parts first
        supplier_ids_seen: set[str] = set()
        suppliers_context: list[str] = []

        for item in line_items:
            mpns_to_check = [item.mpn] + item.approved_alternates
            for mpn in mpns_to_check:
                part_offers = offers_store.get_offers(mpn)
                if part_offers:
                    for offer in part_offers.offers:
                        if offer.supplier_id not in supplier_ids_seen:
                            supplier_ids_seen.add(offer.supplier_id)
                            supplier = self.org_store.get_supplier(offer.supplier_id)
                            if supplier:
                                logger.info(f"[KNOWLEDGE] Attaching supplier knowledge for: {supplier.name} ({supplier.supplier_id})")
                                supplier_ctx = self._build_supplier_context(supplier)
                                suppliers_context.append(supplier_ctx)

        # Build context for all parts (without repeating supplier details)
        parts_context = []
        for item in line_items:
            parts_context.append(self._build_part_context(item, project_context, offers_store))

        all_parts_text = "\n\n---\n\n".join(parts_context)
        mpn_list = [item.mpn for item in line_items]

        # Build supplier knowledge section (once for all unique suppliers)
        suppliers_section = ""
        if suppliers_context:
            suppliers_section = "## Known Supplier Information\n\n" + "\n\n".join(suppliers_context) + "\n\n---\n\n"

        # Build market intelligence section
        market_intel_section = ""
        if market_intel_report and (market_intel_report.items or market_intel_report.supply_chain_risks):
            market_intel_section = self._build_market_intel_section(market_intel_report, line_items)

        task = Task(
            description=f"""Analyze sourcing options for ALL of the following BOM line items.

## Project Constraints
- Deadline: {project_context.deadline or 'Not specified'}
- Allow brokers: {project_context.sourcing_constraints.allow_brokers}
- Max lead time: {project_context.sourcing_constraints.max_lead_time_days} days
- Preferred distributors: {', '.join(project_context.sourcing_constraints.preferred_distributors) or 'None'}
- Single source OK: {project_context.sourcing_constraints.single_source_ok}

---

{suppliers_section}{market_intel_section}## LINE ITEMS TO SOURCE

{all_parts_text}

---

For EACH part, evaluate:
1. Stock availability vs quantity needed
2. Lead time vs project deadline
3. Price (consider price breaks)
4. Supplier trust level and performance
5. Authorized vs broker sourcing
6. Market intelligence alerts (shortages, supply chain risks, price trends)

Select the best offer for each part. Factor in any market intelligence about supply chain risks or component shortages.

You MUST provide a decision for every part listed: {', '.join(mpn_list)}""",
            expected_output="Structured sourcing decisions for each part with supplier selection and reasoning",
            agent=self.agent,
            output_pydantic=SourcingBatchResult,
        )

        # No knowledge_sources - all context is pre-aggregated in the task description
        crew = Crew(
            agents=[self.agent],
            tasks=[task],
            verbose=False,
        )

        result = await crew.kickoff_async()

        # Access the structured pydantic output
        if not result.pydantic:
            raise ValueError(f"SourcingAgent: LLM did not return structured output. Raw: {result.raw[:500] if result.raw else 'EMPTY'}")

        batch_result: SourcingBatchResult = result.pydantic

        # Convert to AgentDecision dict
        decisions = {}
        for part_decision in batch_result.decisions:
            status = DecisionStatus.APPROVED if part_decision.decision == "APPROVED" else DecisionStatus.REJECTED
            risk_level = RiskLevel(part_decision.risk_level)

            decisions[part_decision.mpn] = AgentDecision(
                agent_name="SourcingAgent",
                status=status,
                reasoning=part_decision.reasoning,
                output_data={
                    "selected_mpn": part_decision.mpn,
                    "selected_supplier": part_decision.selected_supplier,
                    "selected_supplier_name": part_decision.selected_supplier_name,
                    "unit_price": part_decision.unit_price,
                    "lead_time_days": part_decision.lead_time_days,
                    "risk_level": risk_level.value,
                },
                references=[],
            )

        # Verify all MPNs have decisions
        missing_mpns = set(mpn_list) - set(decisions.keys())
        if missing_mpns:
            raise ValueError(f"SourcingAgent: Missing decisions for MPNs: {missing_mpns}")

        return decisions

    def _build_supplier_context(self, supplier) -> str:
        """Build context string for a supplier (included once per unique supplier)."""
        lines = [
            f"### {supplier.name} (ID: {supplier.supplier_id})",
            f"- Type: {supplier.supplier_type.value}",
            f"- Trust Level: {supplier.trust_level.value}",
            f"- On-time Rate: {supplier.on_time_rate:.0%}",
            f"- Quality Rate: {supplier.quality_rate:.0%}",
            f"- Payment Terms: {supplier.payment_terms}",
        ]

        if supplier.notes:
            lines.append(f"- Notes: {'; '.join(supplier.notes)}")

        return "\n".join(lines)

    def _build_market_intel_section(
        self,
        report: MarketIntelReport,
        line_items: list[BOMLineItem],
    ) -> str:
        """Build market intelligence section for the prompt."""
        lines = ["## Market Intelligence (from Apify web scraping)\n"]

        # Supply chain risks
        if report.supply_chain_risks:
            lines.append("### Supply Chain Risks")
            for risk in report.supply_chain_risks[:5]:
                lines.append(f"- {risk}")
            lines.append("")

        # Shortage alerts
        if report.shortage_alerts:
            lines.append("### Component Shortage Alerts")
            for alert in report.shortage_alerts[:5]:
                lines.append(f"- {alert}")
            lines.append("")

        # Price trends
        if report.price_trends:
            lines.append("### Price Trends")
            for mpn, trend in list(report.price_trends.items())[:10]:
                lines.append(f"- {mpn}: {trend}")
            lines.append("")

        # Manufacturer updates
        if report.manufacturer_updates:
            lines.append("### Manufacturer Updates")
            for update in report.manufacturer_updates[:5]:
                lines.append(f"- {update}")
            lines.append("")

        # Get relevant intel items for parts in this BOM
        mpns = {item.mpn.upper() for item in line_items if item.mpn}
        manufacturers = {item.manufacturer.upper() for item in line_items if item.manufacturer}

        relevant_items = []
        for item in report.items:
            # Check if this intel is relevant to any BOM part
            item_mpns = {m.upper() for m in item.related_mpns}
            item_mfgs = {m.upper() for m in item.related_manufacturers}

            if (mpns & item_mpns) or (manufacturers & item_mfgs) or item.relevance_score >= 0.7:
                relevant_items.append(item)

        if relevant_items:
            lines.append("### Relevant Market Intelligence")
            for intel in relevant_items[:10]:
                sentiment_marker = {"positive": "[+]", "negative": "[-]", "neutral": "[~]"}[intel.sentiment.value]
                lines.append(f"- {sentiment_marker} **{intel.title}**: {intel.summary}")
                if intel.related_mpns:
                    lines.append(f"  - Related parts: {', '.join(intel.related_mpns[:5])}")
            lines.append("")

        # Recommendations
        if report.recommendations:
            lines.append("### Sourcing Recommendations")
            for rec in report.recommendations[:5]:
                lines.append(f"- {rec}")
            lines.append("")

        lines.append("---\n\n")
        return "\n".join(lines)

    def _build_part_context(
        self,
        line_item: BOMLineItem,
        project_context: ProjectContext,
        offers_store: OffersStore,
    ) -> str:
        """Build context string for a single part including offers."""
        # Get all MPNs to consider (primary + approved alternates)
        mpns_to_consider = [line_item.mpn] + line_item.approved_alternates

        lines = [
            f"### Part: {line_item.mpn}",
            f"- Quantity needed: {line_item.quantity}",
            f"- Approved alternates: {', '.join(line_item.approved_alternates) if line_item.approved_alternates else 'None'}",
            "",
            "**Available Offers:**",
        ]

        offer_num = 1
        for mpn in mpns_to_consider:
            part_offers = offers_store.get_offers(mpn)
            if part_offers:
                for offer in part_offers.offers:
                    price_at_qty = offer.get_price_at_qty(line_item.quantity)
                    # Supplier details are now in the top section, just reference by ID
                    lines.append(
                        f"  {offer_num}. {offer.supplier_name} (ID: {offer.supplier_id}): "
                        f"${price_at_qty:.4f}/unit, stock: {offer.stock_qty}, "
                        f"lead: {offer.lead_time_days}d, "
                        f"authorized: {offer.is_authorized}"
                    )
                    offer_num += 1

        if offer_num == 1:
            lines.append("  NO OFFERS AVAILABLE")

        return "\n".join(lines)

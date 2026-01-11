"""Finance review agent with batch processing."""

import logging
from typing import Literal
from crewai import Agent, Task, Crew
from pydantic import BaseModel, Field

from ..models import (
    BOMLineItem,
    ProjectContext,
    AgentDecision,
    DecisionStatus,
)
from ..stores import OffersStore
from .memory_config import get_llm

logger = logging.getLogger(__name__)


# Pydantic models for structured output
class FinancePartDecision(BaseModel):
    """Decision for a single part from finance review."""
    mpn: str = Field(description="The manufacturer part number")
    decision: Literal["APPROVED", "REJECTED"] = Field(description="Whether the purchase is approved or rejected")
    recommended_qty: int = Field(description="Recommended quantity to order (considering MOQ and price breaks)")
    estimated_unit_price: float = Field(description="Estimated unit price based on best available offer")
    estimated_line_cost: float = Field(description="Total estimated cost for this line item")
    budget_impact: str = Field(description="Assessment of impact on overall budget (e.g., 'within budget', 'exceeds allocation')")
    reasoning: str = Field(description="Detailed explanation for the finance decision including cost analysis")


class FinanceBatchResult(BaseModel):
    """Batch result from finance review."""
    decisions: list[FinancePartDecision] = Field(description="List of finance decisions for each part")
    total_estimated_spend: float = Field(description="Total estimated spend across all approved items")
    budget_utilization_pct: float = Field(description="Percentage of budget utilized")


class FinanceAgent:
    """
    Evaluates cost and budget fit.
    Processes all parts in a single LLM call for efficiency.
    Evaluates independently - does not require prior agent decisions.
    """

    def __init__(self):
        """Initialize agent with LLM. All context is pre-aggregated in prompts."""
        self._llm = get_llm()

        self.agent = Agent(
            role="Procurement Finance Analyst",
            goal="Evaluate costs and ensure budget compliance for all BOM items",
            backstory="""You are a procurement finance specialist with expertise in
            cost analysis, budget management, and price optimization.""",
            llm=self._llm,
            verbose=False,
            allow_delegation=False,
        )

    async def evaluate_batch(
        self,
        line_items: list[BOMLineItem],
        project_context: ProjectContext,
        offers_store: OffersStore,
    ) -> dict[str, AgentDecision]:
        """Evaluate finance for all line items in a single LLM call (async).

        Evaluates ALL items independently - does not require prior agent decisions.
        Returns a dict mapping MPN to AgentDecision.
        Raises ValueError if the LLM returns an invalid response.
        """
        if not line_items:
            return {}

        # Build context for all parts with available offers
        parts_context = []
        running_total = 0.0
        offers_found = 0
        for item in line_items:
            part_offers = offers_store.get_offers(item.mpn)
            if part_offers and part_offers.offers:
                offers_found += len(part_offers.offers)
                logger.info(f"[KNOWLEDGE] {len(part_offers.offers)} offers found for {item.mpn}")

            part_ctx, estimated_cost = self._build_part_context(item, project_context, offers_store, running_total)
            parts_context.append(part_ctx)
            running_total += estimated_cost

        logger.info(f"[KNOWLEDGE] Finance analysis: {len(line_items)} parts, {offers_found} total offers, estimated spend ${running_total:,.2f}")

        all_parts_text = "\n\n---\n\n".join(parts_context)
        mpn_list = [item.mpn for item in line_items]

        task = Task(
            description=f"""Review the financial aspects of ALL the following BOM items.

## Budget Overview
- Total budget: ${project_context.budget_total:,.2f}
- Number of items: {len(line_items)}
- Estimated total spend (at best prices): ${running_total:,.2f}
- Budget remaining after estimate: ${project_context.budget_total - running_total:,.2f}

---

## LINE ITEMS TO REVIEW

{all_parts_text}

---

For EACH part, provide a thorough financial evaluation:
1. Analyze the best available pricing from offers
2. Consider MOQ requirements and recommend optimal order quantity
3. Calculate estimated line cost
4. Assess impact on overall project budget
5. Identify any cost optimization opportunities
6. Flag budget concerns if line item is expensive relative to budget

Provide detailed reasoning explaining your cost analysis for each part.

You MUST provide a decision for every part listed: {', '.join(mpn_list)}""",
            expected_output="Structured finance decisions for each part with cost analysis, recommended quantities, and budget impact",
            agent=self.agent,
            output_pydantic=FinanceBatchResult,
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
            raise ValueError(f"FinanceAgent: LLM did not return structured output. Raw: {result.raw[:500] if result.raw else 'EMPTY'}")

        batch_result: FinanceBatchResult = result.pydantic

        # Convert to AgentDecision dict
        decisions = {}
        for part_decision in batch_result.decisions:
            status = DecisionStatus.APPROVED if part_decision.decision == "APPROVED" else DecisionStatus.REJECTED

            decisions[part_decision.mpn] = AgentDecision(
                agent_name="FinanceAgent",
                status=status,
                reasoning=part_decision.reasoning,
                output_data={
                    "recommended_qty": part_decision.recommended_qty,
                    "estimated_unit_price": part_decision.estimated_unit_price,
                    "estimated_line_cost": part_decision.estimated_line_cost,
                    "budget_impact": part_decision.budget_impact,
                    "total_estimated_spend": batch_result.total_estimated_spend,
                    "budget_utilization_pct": batch_result.budget_utilization_pct,
                },
                references=[],
            )

        # Verify all MPNs have decisions
        missing_mpns = set(mpn_list) - set(decisions.keys())
        if missing_mpns:
            raise ValueError(f"FinanceAgent: Missing decisions for MPNs: {missing_mpns}")

        return decisions

    def _build_part_context(
        self,
        line_item: BOMLineItem,
        project_context: ProjectContext,
        offers_store: OffersStore,
        running_total: float,
    ) -> tuple[str, float]:
        """Build context string for a single part. Returns (context, estimated_cost)."""
        part_offers = offers_store.get_offers(line_item.mpn)

        # Find best price from available offers
        best_price = 0.0
        best_moq = 1
        offer_details = []

        if part_offers:
            for offer in part_offers.offers:
                price_at_qty = offer.get_price_at_qty(line_item.quantity)
                offer_details.append(
                    f"  - {offer.supplier_name}: ${price_at_qty:.4f}/unit, MOQ: {offer.moq}, stock: {offer.stock_qty}"
                )
                if best_price == 0 or price_at_qty < best_price:
                    best_price = price_at_qty
                    best_moq = offer.moq

        order_qty = max(line_item.quantity, best_moq)
        estimated_cost = best_price * order_qty
        remaining_budget = project_context.budget_total - running_total

        lines = [
            f"### Part: {line_item.mpn}",
            f"- Description: {line_item.description}",
            f"- Quantity needed: {line_item.quantity}",
            f"- Best available price: ${best_price:.4f}/unit" if best_price > 0 else "- Best available price: NO OFFERS",
            f"- Minimum order qty (best offer): {best_moq}",
            f"- Suggested order qty: {order_qty}",
            f"- Estimated line cost: ${estimated_cost:.2f}",
            f"- Budget remaining before: ${remaining_budget:,.2f}",
            f"- Budget remaining after: ${remaining_budget - estimated_cost:,.2f}",
            "",
            "**Available Offers:**",
        ]

        if offer_details:
            lines.extend(offer_details)
        else:
            lines.append("  NO OFFERS AVAILABLE")

        return "\n".join(lines), estimated_cost

"""Finance review agent with prose output."""

import logging
from crewai import Agent, Task, Crew

from ..models import (
    BOMLineItem,
    ProjectContext,
    SpecialistAgentResult,
)
from ..stores import OffersStore
from .memory_config import get_fast_llm
from ..utils.rich_logger import console, log_specialist_result

logger = logging.getLogger(__name__)


class FinanceAgent:
    """
    Evaluates cost and budget fit.
    Returns prose analysis via SpecialistAgentResult.
    """

    def __init__(self):
        """Initialize agent with fast LLM for prose output."""
        self._llm = get_fast_llm()

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
    ) -> SpecialistAgentResult:
        """Evaluate finance for all line items and return prose analysis.

        Returns SpecialistAgentResult with comprehensive prose analysis.
        """
        if not line_items:
            return SpecialistAgentResult(
                agent_name="FinanceAgent",
                parts_evaluated=[],
                analysis_notes="No parts to evaluate.",
                raw_response="",
            )

        # Build context for all parts with available offers
        parts_context = []
        running_total = 0.0
        offers_found = 0
        key_concerns = []

        for item in line_items:
            part_offers = offers_store.get_offers(item.mpn)
            if part_offers and part_offers.offers:
                offers_found += len(part_offers.offers)
                logger.info(f"[KNOWLEDGE] {len(part_offers.offers)} offers found for {item.mpn}")
            else:
                key_concerns.append(f"{item.mpn}: No pricing data available")

            part_ctx, estimated_cost = self._build_part_context(item, project_context, offers_store, running_total)
            parts_context.append(part_ctx)
            running_total += estimated_cost

        # Check budget concerns
        if running_total > project_context.budget_total:
            key_concerns.append(f"Estimated spend (${running_total:,.2f}) exceeds budget (${project_context.budget_total:,.2f})")
        elif running_total > project_context.budget_total * 0.9:
            key_concerns.append(f"Estimated spend (${running_total:,.2f}) is over 90% of budget")

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

## YOUR TASK

Provide a comprehensive financial analysis for each part. For each part, evaluate:
1. Analyze the best available pricing from offers
2. Consider MOQ requirements and recommend optimal order quantity
3. Calculate estimated line cost
4. Assess impact on overall project budget
5. Identify any cost optimization opportunities
6. Flag budget concerns if line item is expensive relative to budget

Write your analysis in clear prose, organized by part. Include:
- Cost analysis and pricing recommendations for each part
- MOQ considerations and quantity recommendations
- Budget impact assessment
- Cost optimization opportunities
- Overall financial perspective on this BOM

Parts to cover: {', '.join(mpn_list)}""",
            expected_output="Comprehensive financial analysis in prose format covering all parts",
            agent=self.agent,
        )

        crew = Crew(
            agents=[self.agent],
            tasks=[task],
            verbose=True,
        )

        # Log request
        logger.info("=" * 80)
        logger.info("FINANCE AGENT - LLM REQUEST")
        logger.info("=" * 80)
        logger.info(f"PROMPT:\n{task.description}")
        logger.info("=" * 80)

        result = await crew.kickoff_async()

        # Get raw response
        raw_response = result.raw if result.raw else ""

        # Log response
        logger.info("=" * 80)
        logger.info("FINANCE AGENT - LLM RESPONSE")
        logger.info("=" * 80)
        logger.info(f"RAW RESPONSE:\n{raw_response}")
        logger.info("=" * 80)

        # Create specialist result
        specialist_result = SpecialistAgentResult(
            agent_name="FinanceAgent",
            parts_evaluated=mpn_list,
            analysis_notes=raw_response,
            key_concerns=key_concerns,
            recommendations=[],
            raw_response=raw_response,
        )

        # Log with rich formatting
        log_specialist_result(specialist_result)

        return specialist_result

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

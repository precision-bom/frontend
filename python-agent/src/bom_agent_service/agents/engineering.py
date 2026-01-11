"""Engineering review agent with batch processing."""

import logging
from typing import Literal
from crewai import Agent, Task, Crew
from pydantic import BaseModel, Field

from ..models import (
    BOMLineItem,
    ProjectContext,
    AgentDecision,
    DecisionStatus,
    PartOffers,
)
from ..stores import OrgKnowledgeStore, OffersStore
from .memory_config import get_llm

logger = logging.getLogger(__name__)


# Pydantic models for structured output
class EngineeringPartDecision(BaseModel):
    """Decision for a single part from engineering review."""
    mpn: str = Field(description="The manufacturer part number")
    decision: Literal["APPROVED", "REJECTED"] = Field(description="Whether the part is approved or rejected")
    reasoning: str = Field(description="Explanation for the decision")
    concerns: list[str] = Field(default_factory=list, description="List of concerns if any")
    approved_alternates: list[str] = Field(default_factory=list, description="Approved alternate part numbers")


class EngineeringBatchResult(BaseModel):
    """Batch result from engineering review."""
    decisions: list[EngineeringPartDecision] = Field(description="List of decisions for each part")


class EngineeringAgent:
    """
    Evaluates technical acceptability of parts.
    Processes all parts in a single LLM call for efficiency.
    """

    def __init__(self, org_store: OrgKnowledgeStore):
        """Initialize agent with LLM. All context is pre-aggregated in prompts."""
        self.org_store = org_store
        self._llm = get_llm()

        self.agent = Agent(
            role="Electronics Engineering Expert",
            goal="Evaluate technical acceptability of BOM parts and ensure compliance",
            backstory="""You are a senior electronics engineer with expertise in component
            selection, lifecycle management, and compliance requirements.""",
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
        """Evaluate all line items in a single LLM call (async).

        Returns a dict mapping MPN to AgentDecision.
        Raises ValueError if the LLM returns an invalid response.
        """
        if not line_items:
            return {}

        # Build context for all parts
        parts_context = []
        for item in line_items:
            part_offers = offers_store.get_offers(item.mpn)
            is_banned, ban_reason = self.org_store.is_part_banned(item.mpn)
            approved_alternates = self.org_store.get_approved_alternates(item.mpn)
            part_knowledge = self.org_store.get_part(item.mpn)

            # Log knowledge base lookups
            if part_knowledge:
                logger.info(f"[KNOWLEDGE] Part knowledge found for {item.mpn}: times_used={part_knowledge.times_used}, failures={part_knowledge.failure_count}")
            else:
                logger.info(f"[KNOWLEDGE] No prior part knowledge for {item.mpn}")
            if is_banned:
                logger.info(f"[KNOWLEDGE] Part {item.mpn} is BANNED: {ban_reason}")
            if approved_alternates:
                logger.info(f"[KNOWLEDGE] Approved alternates for {item.mpn}: {approved_alternates}")

            parts_context.append(self._build_part_context(
                item, project_context, part_offers, is_banned, ban_reason,
                approved_alternates, part_knowledge
            ))

        all_parts_text = "\n\n---\n\n".join(parts_context)
        mpn_list = [item.mpn for item in line_items]

        task = Task(
            description=f"""Review ALL of the following BOM line items for technical acceptability.

## Project Requirements
- Product type: {project_context.product_type.value}
- Compliance standards: {', '.join(project_context.compliance.standards)}
- Quality class: {project_context.compliance.quality_class}

## Engineering Notes
{project_context.engineering_context.notes or 'None'}

## Critical Parts (require extra scrutiny)
{', '.join(project_context.engineering_context.critical_parts) or 'None'}

---

## LINE ITEMS TO EVALUATE

{all_parts_text}

---

For EACH part, evaluate:
1. Is the part banned in org knowledge? If so, REJECT.
2. Does the part meet compliance requirements?
3. Is the part lifecycle acceptable (active or NRND)?
4. Is this a critical part needing extra scrutiny?
5. Are there approved alternates available?

You MUST provide a decision for every part listed: {', '.join(mpn_list)}""",
            expected_output="Structured decisions for each part with reasoning",
            agent=self.agent,
            output_pydantic=EngineeringBatchResult,
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
            raise ValueError(f"EngineeringAgent: LLM did not return structured output. Raw: {result.raw[:500] if result.raw else 'EMPTY'}")

        batch_result: EngineeringBatchResult = result.pydantic

        # Convert to AgentDecision dict
        decisions = {}
        for part_decision in batch_result.decisions:
            status = DecisionStatus.APPROVED if part_decision.decision == "APPROVED" else DecisionStatus.REJECTED
            decisions[part_decision.mpn] = AgentDecision(
                agent_name="EngineeringAgent",
                status=status,
                reasoning=part_decision.reasoning,
                output_data={
                    "concerns": part_decision.concerns,
                    "approved_alternates": part_decision.approved_alternates,
                },
                references=[],
            )

        # Verify all MPNs have decisions
        missing_mpns = set(mpn_list) - set(decisions.keys())
        if missing_mpns:
            raise ValueError(f"EngineeringAgent: Missing decisions for MPNs: {missing_mpns}")

        return decisions

    def _build_part_context(
        self,
        line_item: BOMLineItem,
        project_context: ProjectContext,
        part_offers: PartOffers | None,
        is_banned: bool,
        ban_reason: str,
        approved_alternates: list[str],
        part_knowledge,
    ) -> str:
        """Build context string for a single part."""
        lines = [
            f"### Part: {line_item.mpn}",
            f"- Manufacturer: {line_item.manufacturer}",
            f"- Description: {line_item.description}",
            f"- Quantity: {line_item.quantity}",
            f"- Reference designators: {', '.join(line_item.reference_designators)}",
            f"- Banned: {is_banned}" + (f" (reason: {ban_reason})" if is_banned else ""),
            f"- Approved alternates: {', '.join(approved_alternates) if approved_alternates else 'None'}",
        ]

        if part_knowledge:
            lines.extend([
                f"- Times used: {part_knowledge.times_used}",
                f"- Failure count: {part_knowledge.failure_count}",
            ])

        if part_offers:
            lines.extend([
                f"- Lifecycle: {part_offers.lifecycle_status.value}",
                f"- RoHS compliant: {part_offers.rohs_compliant}",
            ])

        is_critical = any(
            ref in project_context.engineering_context.critical_parts
            for ref in line_item.reference_designators
        )
        if is_critical:
            lines.append("- **CRITICAL PART**")

        return "\n".join(lines)

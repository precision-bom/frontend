"""Engineering review agent with prose output."""

import logging
from crewai import Agent, Task, Crew

from ..models import (
    BOMLineItem,
    ProjectContext,
    PartOffers,
    SpecialistAgentResult,
)
from ..stores import OrgKnowledgeStore, OffersStore
from .memory_config import get_fast_llm
from ..utils.rich_logger import console, log_specialist_result

logger = logging.getLogger(__name__)


class EngineeringAgent:
    """
    Evaluates technical acceptability of parts.
    Returns prose analysis via SpecialistAgentResult.
    """

    def __init__(self, org_store: OrgKnowledgeStore):
        """Initialize agent with fast LLM for prose output."""
        self.org_store = org_store
        self._llm = get_fast_llm()

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
    ) -> SpecialistAgentResult:
        """Evaluate all line items and return prose analysis.

        Returns SpecialistAgentResult with comprehensive prose analysis.
        """
        if not line_items:
            return SpecialistAgentResult(
                agent_name="EngineeringAgent",
                parts_evaluated=[],
                analysis_notes="No parts to evaluate.",
                raw_response="",
            )

        # Build context for all parts
        parts_context = []
        key_concerns = []
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
                key_concerns.append(f"{item.mpn}: BANNED - {ban_reason}")
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

## YOUR TASK

Provide a comprehensive engineering analysis for each part. For each part, evaluate:
1. Is the part banned in org knowledge? If so, flag it clearly.
2. Does the part meet compliance requirements?
3. Is the part lifecycle acceptable (active or NRND)?
4. Is this a critical part needing extra scrutiny?
5. Are there approved alternates available?

Write your analysis in clear prose, organized by part. Include:
- Your assessment of each part's technical suitability
- Any concerns or risks you identify
- Recommendations for parts that need attention
- Overall engineering perspective on this BOM

Parts to cover: {', '.join(mpn_list)}""",
            expected_output="Comprehensive engineering analysis in prose format covering all parts",
            agent=self.agent,
        )

        crew = Crew(
            agents=[self.agent],
            tasks=[task],
            verbose=True,
        )

        # Log request
        logger.info("=" * 80)
        logger.info("ENGINEERING AGENT - LLM REQUEST")
        logger.info("=" * 80)
        logger.info(f"PROMPT:\n{task.description}")
        logger.info("=" * 80)

        result = await crew.kickoff_async()

        # Get raw response
        raw_response = result.raw if result.raw else ""

        # Log response
        logger.info("=" * 80)
        logger.info("ENGINEERING AGENT - LLM RESPONSE")
        logger.info("=" * 80)
        logger.info(f"RAW RESPONSE:\n{raw_response}")
        logger.info("=" * 80)

        # Create specialist result
        specialist_result = SpecialistAgentResult(
            agent_name="EngineeringAgent",
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

"""Final Decision Agent - Synthesizes specialist analyses into judicial-style decisions."""

import logging
import uuid
from typing import Literal, Optional
from crewai import Agent, Task, Crew
from pydantic import BaseModel, Field

from ..models import (
    BOMLineItem,
    ProjectContext,
    SpecialistAgentResult,
    FinalDecisionReport,
    PartVerdict,
    ProjectSummary,
    FollowUpItem,
)
from .memory_config import get_reasoning_llm
from ..utils.rich_logger import console, log_final_report

logger = logging.getLogger(__name__)


# Pydantic models for structured LLM output
class LLMPartVerdict(BaseModel):
    """LLM output for a single part verdict."""
    mpn: str = Field(description="Manufacturer part number")
    verdict: Literal["APPROVED", "REJECTED"] = Field(description="Final verdict")
    selected_supplier_id: Optional[str] = Field(default=None, description="Selected supplier ID if approved")
    selected_supplier_name: Optional[str] = Field(default=None, description="Selected supplier name if approved")
    final_quantity: int = Field(default=0, description="Final quantity to order")
    final_unit_price: float = Field(default=0.0, description="Final unit price")
    final_line_cost: float = Field(default=0.0, description="Final line cost")
    engineering_findings: str = Field(description="Summary of engineering findings")
    sourcing_findings: str = Field(description="Summary of sourcing findings")
    finance_findings: str = Field(description="Summary of finance findings")
    points_of_agreement: list[str] = Field(default_factory=list, description="Where agents agreed")
    points_of_conflict: list[str] = Field(default_factory=list, description="Where agents disagreed")
    resolution_rationale: str = Field(description="Detailed rationale for the decision")
    risk_factors: list[str] = Field(default_factory=list, description="Risk factors")
    mitigations: list[str] = Field(default_factory=list, description="Risk mitigations")
    conditions: list[str] = Field(default_factory=list, description="Conditions for approval")


class LLMProjectSummary(BaseModel):
    """LLM output for project summary."""
    overall_risk_level: Literal["LOW", "MEDIUM", "HIGH"] = Field(description="Overall risk assessment")
    key_risks: list[str] = Field(default_factory=list, description="Key risks")
    strategic_recommendations: list[str] = Field(default_factory=list, description="Strategic recommendations")


class LLMFollowUpItem(BaseModel):
    """LLM output for follow-up item."""
    priority: Literal["HIGH", "MEDIUM", "LOW"] = Field(description="Priority level")
    category: str = Field(description="Category: engineering, sourcing, finance, compliance")
    description: str = Field(description="Follow-up description")
    related_mpns: list[str] = Field(default_factory=list, description="Related MPNs")


class LLMFinalDecisionOutput(BaseModel):
    """Complete LLM output for final decision."""
    executive_summary: str = Field(description="2-3 paragraph executive summary")
    verdicts: list[LLMPartVerdict] = Field(description="Verdicts for each part")
    project_summary: LLMProjectSummary = Field(description="Project-level summary")
    follow_up_notes: list[LLMFollowUpItem] = Field(default_factory=list, description="Follow-up items")


class FinalDecisionAgent:
    """
    Synthesizes specialist agent analyses into comprehensive judicial-style decisions.

    Uses a reasoning model (gpt-4o) to produce structured output with
    detailed rationale for each decision.
    """

    def __init__(self):
        """Initialize agent with reasoning LLM for structured output."""
        self._llm = get_reasoning_llm()

        self.agent = Agent(
            role="Senior Procurement Decision Authority",
            goal="Synthesize all specialist analyses and render final purchasing decisions with comprehensive judicial-style reasoning",
            backstory="""You are the senior procurement authority responsible for rendering
            final decisions on all BOM purchases. Like a constitutional judge, you must
            carefully weigh all evidence from engineering, sourcing, and finance specialists,
            identify areas of agreement and conflict, and provide comprehensive written
            rationale for each decision. Your decisions must be defensible and traceable.""",
            llm=self._llm,
            verbose=False,
            allow_delegation=False,
        )

    async def make_final_decisions(
        self,
        line_items: list[BOMLineItem],
        project_context: ProjectContext,
        engineering_result: SpecialistAgentResult,
        sourcing_result: SpecialistAgentResult,
        finance_result: SpecialistAgentResult,
    ) -> FinalDecisionReport:
        """
        Synthesize specialist analyses into final decisions.

        Args:
            line_items: BOM line items to decide on
            project_context: Project context and constraints
            engineering_result: Engineering agent's prose analysis
            sourcing_result: Sourcing agent's prose analysis
            finance_result: Finance agent's prose analysis

        Returns FinalDecisionReport with comprehensive judicial-style reasoning.
        """
        if not line_items:
            return FinalDecisionReport(
                report_id=str(uuid.uuid4()),
                project_id=project_context.project_id,
                executive_summary="No parts to evaluate.",
                verdicts=[],
                project_summary=ProjectSummary(
                    total_parts=0,
                    approved_count=0,
                    rejected_count=0,
                    total_estimated_spend=0.0,
                    budget_remaining=project_context.budget_total,
                    overall_risk_level="LOW",
                    key_risks=[],
                    strategic_recommendations=[],
                ),
                follow_up_notes=[],
                total_approved=0,
                total_rejected=0,
                total_spend=0.0,
                budget_utilization_pct=0.0,
            )

        mpn_list = [item.mpn for item in line_items]

        # Build the comprehensive context with all specialist analyses
        parts_overview = self._build_parts_overview(line_items)

        task = Task(
            description=f"""As the Senior Procurement Decision Authority, you must render FINAL decisions on all BOM parts.

## PROJECT CONTEXT

- **Project**: {project_context.project_name or project_context.project_id}
- **Budget**: ${project_context.budget_total:,.2f}
- **Deadline**: {project_context.deadline or 'Not specified'}
- **Product Type**: {project_context.product_type.value}
- **Compliance Standards**: {', '.join(project_context.compliance.standards) or 'None specified'}
- **Quality Class**: {project_context.compliance.quality_class}

---

## PARTS TO DECIDE

{parts_overview}

---

## ENGINEERING SPECIALIST ANALYSIS

{engineering_result.analysis_notes}

**Key Engineering Concerns:**
{chr(10).join('- ' + c for c in engineering_result.key_concerns) if engineering_result.key_concerns else 'None flagged'}

---

## SOURCING SPECIALIST ANALYSIS

{sourcing_result.analysis_notes}

**Key Sourcing Concerns:**
{chr(10).join('- ' + c for c in sourcing_result.key_concerns) if sourcing_result.key_concerns else 'None flagged'}

---

## FINANCE SPECIALIST ANALYSIS

{finance_result.analysis_notes}

**Key Finance Concerns:**
{chr(10).join('- ' + c for c in finance_result.key_concerns) if finance_result.key_concerns else 'None flagged'}

---

## YOUR MANDATE

You must render a FINAL DECISION for each part: {', '.join(mpn_list)}

For each part, you must:

1. **Extract Key Findings** from each specialist's analysis
2. **Identify Agreement** - where all specialists aligned
3. **Identify Conflicts** - where specialists disagreed
4. **Resolve Conflicts** - explain your reasoning for how you weighed competing concerns
5. **Render Verdict** - APPROVED or REJECTED with full justification

If APPROVED, you must specify:
- Selected supplier (ID and name)
- Final quantity to order
- Final unit price
- Final line cost

Your rationale must be:
- **Comprehensive** - reference specific points from each specialist
- **Defensible** - explain the logic behind your decision
- **Traceable** - someone reading this should understand exactly why each decision was made

Also provide:
- **Executive Summary** (2-3 paragraphs) covering the overall BOM evaluation
- **Project Summary** with overall risk assessment and strategic recommendations
- **Follow-Up Items** for any actions that need attention after this review""",
            expected_output="Complete final decision report with judicial-style reasoning for each part",
            agent=self.agent,
            output_pydantic=LLMFinalDecisionOutput,
        )

        crew = Crew(
            agents=[self.agent],
            tasks=[task],
            verbose=True,
        )

        # Log request
        logger.info("=" * 80)
        logger.info("FINAL DECISION AGENT - LLM REQUEST")
        logger.info("=" * 80)
        logger.info(f"PROMPT:\n{task.description}")
        logger.info("=" * 80)

        result = await crew.kickoff_async()

        # Log response
        logger.info("=" * 80)
        logger.info("FINAL DECISION AGENT - LLM RESPONSE")
        logger.info("=" * 80)
        logger.info(f"RAW RESPONSE:\n{result.raw}")
        logger.info("=" * 80)

        # Process structured output
        if not result.pydantic:
            raise ValueError(f"FinalDecisionAgent: LLM did not return structured output. Raw: {result.raw[:500] if result.raw else 'EMPTY'}")

        llm_output: LLMFinalDecisionOutput = result.pydantic

        # Convert to FinalDecisionReport
        verdicts = []
        total_spend = 0.0

        for llm_verdict in llm_output.verdicts:
            verdict = PartVerdict(
                mpn=llm_verdict.mpn,
                verdict=llm_verdict.verdict,
                selected_supplier_id=llm_verdict.selected_supplier_id,
                selected_supplier_name=llm_verdict.selected_supplier_name,
                final_quantity=llm_verdict.final_quantity,
                final_unit_price=llm_verdict.final_unit_price,
                final_line_cost=llm_verdict.final_line_cost,
                engineering_findings=llm_verdict.engineering_findings,
                sourcing_findings=llm_verdict.sourcing_findings,
                finance_findings=llm_verdict.finance_findings,
                points_of_agreement=llm_verdict.points_of_agreement,
                points_of_conflict=llm_verdict.points_of_conflict,
                resolution_rationale=llm_verdict.resolution_rationale,
                risk_factors=llm_verdict.risk_factors,
                mitigations=llm_verdict.mitigations,
                conditions=llm_verdict.conditions,
            )
            verdicts.append(verdict)
            if verdict.verdict == "APPROVED":
                total_spend += verdict.final_line_cost

        total_approved = sum(1 for v in verdicts if v.verdict == "APPROVED")
        total_rejected = sum(1 for v in verdicts if v.verdict == "REJECTED")

        follow_up_notes = [
            FollowUpItem(
                priority=item.priority,
                category=item.category,
                description=item.description,
                related_mpns=item.related_mpns,
            )
            for item in llm_output.follow_up_notes
        ]

        project_summary = ProjectSummary(
            total_parts=len(line_items),
            approved_count=total_approved,
            rejected_count=total_rejected,
            total_estimated_spend=total_spend,
            budget_remaining=project_context.budget_total - total_spend,
            overall_risk_level=llm_output.project_summary.overall_risk_level,
            key_risks=llm_output.project_summary.key_risks,
            strategic_recommendations=llm_output.project_summary.strategic_recommendations,
        )

        budget_utilization = (total_spend / project_context.budget_total * 100) if project_context.budget_total > 0 else 0.0

        final_report = FinalDecisionReport(
            report_id=str(uuid.uuid4()),
            project_id=project_context.project_id,
            executive_summary=llm_output.executive_summary,
            verdicts=verdicts,
            project_summary=project_summary,
            follow_up_notes=follow_up_notes,
            total_approved=total_approved,
            total_rejected=total_rejected,
            total_spend=total_spend,
            budget_utilization_pct=budget_utilization,
        )

        # Log with rich formatting
        log_final_report(final_report)

        return final_report

    def _build_parts_overview(self, line_items: list[BOMLineItem]) -> str:
        """Build overview of parts being decided."""
        lines = []
        for item in line_items:
            lines.append(f"- **{item.mpn}**: {item.description} (Qty: {item.quantity}, Mfg: {item.manufacturer})")
        return "\n".join(lines)

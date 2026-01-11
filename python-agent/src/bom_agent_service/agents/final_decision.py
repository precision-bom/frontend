"""Final Decision Agent - Aggregates sub-agent outputs and makes final purchasing decisions."""

from typing import Literal, Optional
from crewai import Agent, Task, Crew
from pydantic import BaseModel, Field

from ..models import (
    BOMLineItem,
    ProjectContext,
    AgentDecision,
    DecisionStatus,
)
from .memory_config import get_llm


# Pydantic models for structured output
class FinalPartDecision(BaseModel):
    """Final decision for a single part after aggregating all agent inputs."""
    mpn: str = Field(description="The manufacturer part number")
    decision: Literal["APPROVED", "REJECTED"] = Field(description="Final decision on whether to purchase this part")

    # Selected sourcing details (only if approved)
    selected_supplier_id: Optional[str] = Field(default=None, description="ID of the selected supplier")
    selected_supplier_name: Optional[str] = Field(default=None, description="Name of the selected supplier")
    final_quantity: int = Field(description="Final quantity to order")
    final_unit_price: float = Field(description="Final unit price")
    final_line_cost: float = Field(description="Final total cost for this line item")

    # Aggregated assessment
    engineering_summary: str = Field(description="Summary of engineering assessment")
    sourcing_summary: str = Field(description="Summary of sourcing assessment")
    finance_summary: str = Field(description="Summary of finance assessment")

    # Final rationale
    reasoning: str = Field(description="Comprehensive rationale explaining the final decision, synthesizing all agent inputs")
    risk_factors: list[str] = Field(default_factory=list, description="Key risk factors identified across all assessments")
    recommendations: list[str] = Field(default_factory=list, description="Recommendations for this purchase")


class FinalDecisionResult(BaseModel):
    """Complete result from final decision agent."""
    decisions: list[FinalPartDecision] = Field(description="Final decisions for each part")
    total_approved_spend: float = Field(description="Total spend for all approved items")
    total_items_approved: int = Field(description="Number of items approved for purchase")
    total_items_rejected: int = Field(description="Number of items rejected")
    overall_assessment: str = Field(description="Overall assessment of the BOM and purchasing recommendations")


class FinalDecisionAgent:
    """
    Aggregates outputs from Engineering, Sourcing, and Finance agents
    to make final purchasing decisions for each BOM item.

    This agent synthesizes all perspectives and provides a comprehensive
    rationale for each decision.
    """

    def __init__(self):
        """Initialize agent with LLM."""
        self._llm = get_llm()

        self.agent = Agent(
            role="Senior Procurement Manager",
            goal="Make final purchasing decisions by synthesizing engineering, sourcing, and finance assessments",
            backstory="""You are a senior procurement manager who synthesizes engineering,
            sourcing, and finance assessments to make final purchasing decisions.""",
            llm=self._llm,
            verbose=False,
            allow_delegation=False,
        )

    async def make_final_decisions(
        self,
        line_items: list[BOMLineItem],
        project_context: ProjectContext,
        engineering_decisions: dict[str, AgentDecision],
        sourcing_decisions: dict[str, AgentDecision],
        finance_decisions: dict[str, AgentDecision],
    ) -> dict[str, AgentDecision]:
        """
        Make final decisions for all line items based on sub-agent outputs (async).

        Returns a dict mapping MPN to final AgentDecision.
        Raises ValueError if the LLM returns an invalid response.
        """
        if not line_items:
            return {}

        # Build context for all parts with all agent decisions
        parts_context = []
        for item in line_items:
            eng = engineering_decisions.get(item.mpn)
            src = sourcing_decisions.get(item.mpn)
            fin = finance_decisions.get(item.mpn)
            parts_context.append(self._build_part_context(item, eng, src, fin))

        all_parts_text = "\n\n" + "="*60 + "\n\n".join(parts_context)
        mpn_list = [item.mpn for item in line_items]

        task = Task(
            description=f"""As the Senior Procurement Manager, review ALL agent assessments and make FINAL purchasing decisions.

## Project Overview
- Project: {project_context.project_name or 'Unnamed Project'}
- Budget: ${project_context.budget_total:,.2f}
- Deadline: {project_context.deadline or 'Not specified'}
- Product Type: {project_context.product_type.value}
- Compliance Standards: {', '.join(project_context.compliance.standards) or 'None specified'}

---

## AGENT ASSESSMENTS FOR EACH PART
{all_parts_text}

---

## YOUR TASK

For EACH part, you must:

1. **Review all three agent assessments** (Engineering, Sourcing, Finance)
2. **Identify any conflicts or concerns** across the assessments
3. **Make a FINAL decision** (APPROVED or REJECTED)
4. **If APPROVED**: Select the best supplier, quantity, and price
5. **Provide comprehensive reasoning** that synthesizes all inputs

Your reasoning MUST:
- Reference specific points from each agent's assessment
- Explain how you weighed conflicting recommendations
- Justify your supplier/quantity selection
- Identify any residual risks or recommendations

Be thorough in your rationale - these decisions need to be defensible and traceable.

You MUST provide a final decision for every part: {', '.join(mpn_list)}""",
            expected_output="Final purchasing decisions for each part with comprehensive rationale synthesizing all agent inputs",
            agent=self.agent,
            output_pydantic=FinalDecisionResult,
        )

        crew = Crew(
            agents=[self.agent],
            tasks=[task],
            verbose=False,
        )

        result = await crew.kickoff_async()

        # Access the structured pydantic output
        if not result.pydantic:
            raise ValueError(f"FinalDecisionAgent: LLM did not return structured output. Raw: {result.raw[:500] if result.raw else 'EMPTY'}")

        batch_result: FinalDecisionResult = result.pydantic

        # Convert to AgentDecision dict
        decisions = {}
        for part_decision in batch_result.decisions:
            status = DecisionStatus.APPROVED if part_decision.decision == "APPROVED" else DecisionStatus.REJECTED

            decisions[part_decision.mpn] = AgentDecision(
                agent_name="FinalDecisionAgent",
                status=status,
                reasoning=part_decision.reasoning,
                output_data={
                    "selected_supplier_id": part_decision.selected_supplier_id,
                    "selected_supplier_name": part_decision.selected_supplier_name,
                    "final_quantity": part_decision.final_quantity,
                    "final_unit_price": part_decision.final_unit_price,
                    "final_line_cost": part_decision.final_line_cost,
                    "engineering_summary": part_decision.engineering_summary,
                    "sourcing_summary": part_decision.sourcing_summary,
                    "finance_summary": part_decision.finance_summary,
                    "risk_factors": part_decision.risk_factors,
                    "recommendations": part_decision.recommendations,
                    "total_approved_spend": batch_result.total_approved_spend,
                    "overall_assessment": batch_result.overall_assessment,
                },
                references=[],
            )

        # Verify all MPNs have decisions
        missing_mpns = set(mpn_list) - set(decisions.keys())
        if missing_mpns:
            raise ValueError(f"FinalDecisionAgent: Missing decisions for MPNs: {missing_mpns}")

        return decisions

    def _build_part_context(
        self,
        line_item: BOMLineItem,
        eng_decision: Optional[AgentDecision],
        src_decision: Optional[AgentDecision],
        fin_decision: Optional[AgentDecision],
    ) -> str:
        """Build context string for a single part with all agent decisions."""
        lines = [
            f"## Part: {line_item.mpn}",
            f"**Description:** {line_item.description}",
            f"**Manufacturer:** {line_item.manufacturer}",
            f"**Quantity Needed:** {line_item.quantity}",
            "",
        ]

        # Engineering Assessment
        lines.append("### Engineering Assessment")
        if eng_decision:
            lines.extend([
                f"- **Decision:** {eng_decision.status.value}",
                f"- **Reasoning:** {eng_decision.reasoning}",
            ])
            if eng_decision.output_data.get("concerns"):
                lines.append(f"- **Concerns:** {', '.join(eng_decision.output_data['concerns'])}")
            if eng_decision.output_data.get("approved_alternates"):
                lines.append(f"- **Approved Alternates:** {', '.join(eng_decision.output_data['approved_alternates'])}")
        else:
            lines.append("- **No engineering assessment available**")
        lines.append("")

        # Sourcing Assessment
        lines.append("### Sourcing Assessment")
        if src_decision:
            lines.extend([
                f"- **Decision:** {src_decision.status.value}",
                f"- **Reasoning:** {src_decision.reasoning}",
                f"- **Selected Supplier:** {src_decision.output_data.get('selected_supplier_name', 'N/A')} (ID: {src_decision.output_data.get('selected_supplier', 'N/A')})",
                f"- **Unit Price:** ${src_decision.output_data.get('unit_price', 0):.4f}",
                f"- **Lead Time:** {src_decision.output_data.get('lead_time_days', 'N/A')} days",
                f"- **Risk Level:** {src_decision.output_data.get('risk_level', 'N/A')}",
            ])
        else:
            lines.append("- **No sourcing assessment available**")
        lines.append("")

        # Finance Assessment
        lines.append("### Finance Assessment")
        if fin_decision:
            lines.extend([
                f"- **Decision:** {fin_decision.status.value}",
                f"- **Reasoning:** {fin_decision.reasoning}",
                f"- **Recommended Qty:** {fin_decision.output_data.get('recommended_qty', 'N/A')}",
                f"- **Estimated Unit Price:** ${fin_decision.output_data.get('estimated_unit_price', 0):.4f}",
                f"- **Estimated Line Cost:** ${fin_decision.output_data.get('estimated_line_cost', 0):.2f}",
                f"- **Budget Impact:** {fin_decision.output_data.get('budget_impact', 'N/A')}",
            ])
        else:
            lines.append("- **No finance assessment available**")

        return "\n".join(lines)

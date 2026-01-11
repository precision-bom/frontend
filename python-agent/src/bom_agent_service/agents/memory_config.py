"""Shared LLM and knowledge configuration for CrewAI agents."""

import os
from typing import Optional

from crewai import LLM
from crewai.knowledge.source.string_knowledge_source import StringKnowledgeSource

from ..stores import OrgKnowledgeStore


# Default model - can be overridden via environment variable
DEFAULT_MODEL = os.environ.get("CREWAI_MODEL", "gpt-5-nano")


def get_llm(model: Optional[str] = None) -> LLM:
    """Get configured LLM for agents.

    Args:
        model: Optional model override. Defaults to CREWAI_MODEL env var or gpt-4o-mini.
    """
    return LLM(
        model=model or DEFAULT_MODEL,
        temperature=0.3,  # Lower temperature for more consistent outputs
    )


def build_org_knowledge_source(org_store: OrgKnowledgeStore) -> Optional[StringKnowledgeSource]:
    """Build a knowledge source from org knowledge store.

    Converts structured org knowledge into a text format for RAG retrieval.
    """
    lines = ["# Organization Knowledge Base\n"]

    # Add supplier knowledge
    suppliers = org_store.list_suppliers()
    if suppliers:
        lines.append("## Approved Suppliers\n")
        for s in suppliers:
            lines.append(f"### {s.name} (ID: {s.supplier_id})")
            lines.append(f"- Type: {s.supplier_type.value}")
            lines.append(f"- Trust Level: {s.trust_level.value}")
            lines.append(f"- On-Time Rate: {s.on_time_rate:.0%}")
            lines.append(f"- Quality Rate: {s.quality_rate:.0%}")
            if s.notes:
                lines.append(f"- Notes: {'; '.join(s.notes)}")
            lines.append("")

    # Add parts knowledge
    parts = org_store.list_parts()
    if parts:
        lines.append("## Parts Knowledge\n")
        for p in parts:
            lines.append(f"### {p.mpn}")
            if p.banned:
                lines.append(f"- **BANNED**: {p.ban_reason}")
            if p.approved_alternates:
                lines.append(f"- Approved Alternates: {', '.join(p.approved_alternates)}")
            lines.append(f"- Times Used: {p.times_used}")
            lines.append(f"- Failure Count: {p.failure_count}")
            if p.notes:
                lines.append(f"- Notes: {'; '.join(p.notes)}")
            lines.append("")

    content = "\n".join(lines)

    if len(content) > 100:  # Only create if there's meaningful content
        return StringKnowledgeSource(
            content=content,
            metadata={"source": "org_knowledge_store"}
        )
    return None


def build_project_knowledge_source(project_context) -> StringKnowledgeSource:
    """Build a knowledge source from project context.

    Provides project-specific context for agent decisions.
    """
    lines = [
        "# Project Context\n",
        f"## Project: {project_context.project_name or project_context.project_id}",
        f"- Product Type: {project_context.product_type.value}",
        f"- Quantity: {project_context.quantity}",
        f"- Budget: ${project_context.budget_total:,.2f}",
        f"- Deadline: {project_context.deadline or 'Not specified'}",
        "",
        "## Compliance Requirements",
        f"- Standards: {', '.join(project_context.compliance.standards) or 'None specified'}",
        f"- Quality Class: {project_context.compliance.quality_class}",
        "",
        "## Sourcing Constraints",
        f"- Allow Brokers: {project_context.sourcing_constraints.allow_brokers}",
        f"- Allow Alternates: {project_context.sourcing_constraints.allow_alternates}",
        f"- Single Source OK: {project_context.sourcing_constraints.single_source_ok}",
        f"- Preferred Distributors: {', '.join(project_context.sourcing_constraints.preferred_distributors) or 'None'}",
        f"- Max Lead Time: {project_context.sourcing_constraints.max_lead_time_days} days",
        "",
    ]

    # Engineering context
    eng = project_context.engineering_context
    if eng.notes:
        lines.extend([
            "## Engineering Notes",
            eng.notes,
            "",
        ])

    if eng.critical_parts:
        lines.append(f"## Critical Parts (require extra scrutiny): {', '.join(eng.critical_parts)}")
        lines.append("")

    # Preferred manufacturers
    pref = eng.preferred_manufacturers
    if any([pref.capacitors, pref.resistors, pref.mcu, pref.connectors]):
        lines.append("## Preferred Manufacturers")
        if pref.capacitors:
            lines.append(f"- Capacitors: {', '.join(pref.capacitors)}")
        if pref.resistors:
            lines.append(f"- Resistors: {', '.join(pref.resistors)}")
        if pref.mcu:
            lines.append(f"- MCU: {', '.join(pref.mcu)}")
        if pref.connectors:
            lines.append(f"- Connectors: {', '.join(pref.connectors)}")
        lines.append("")

    return StringKnowledgeSource(
        content="\n".join(lines),
        metadata={"source": "project_context"}
    )


# Standard policies that apply to all projects - these are static and cached
SOURCING_POLICIES = StringKnowledgeSource(
    content="""
# Electronics Sourcing Policies

## Supplier Selection Priorities
1. Always prefer authorized distributors over brokers
2. For critical parts, require at least 2 approved sources
3. Prefer suppliers with >90% on-time delivery rate
4. Prefer suppliers with >95% quality rate

## Risk Assessment Guidelines
- HIGH RISK: Broker sourcing, single source, long lead time (>30 days)
- MEDIUM RISK: New supplier, lead time 15-30 days
- LOW RISK: Authorized distributor, multiple sources, short lead time

## Price Evaluation
- Consider total cost of ownership, not just unit price
- Factor in shipping, minimum order quantities, and payment terms
- Look for price breaks at higher quantities
- Compare across multiple distributors

## Compliance Requirements
- RoHS compliance is mandatory for all new designs
- REACH compliance required for EU markets
- Document all compliance certifications
- Avoid parts from restricted countries if specified

## Counterfeit Prevention
- Never use parts from unauthorized sources for critical applications
- Require certificates of conformance for high-reliability parts
- Flag any unusually low prices as potential counterfeit risk
- Maintain chain of custody documentation
""",
    metadata={"source": "sourcing_policies"}
)

ENGINEERING_POLICIES = StringKnowledgeSource(
    content="""
# Engineering Review Policies

## Part Selection Criteria
1. Prefer parts with ACTIVE lifecycle status
2. NRND (Not Recommended for New Designs) parts require justification
3. Reject EOL (End of Life) and OBSOLETE parts
4. Verify manufacturer reputation and quality history

## Alternate Part Approval
- Form, fit, function equivalence required
- Verify electrical specifications match or exceed original
- Check package compatibility
- Confirm temperature range meets application requirements

## Critical Part Handling
- Critical parts require extra scrutiny
- Verify multiple sourcing options
- Check for known issues or failure modes
- Require engineering sign-off for any alternates

## Quality Standards
- IPC Class 2: Standard electronics (consumer, industrial)
- IPC Class 3: High reliability (medical, aerospace, automotive)
- AEC-Q qualified parts required for automotive applications

## Manufacturer Preferences
- Prefer established manufacturers with good quality history
- Avoid unknown or unverified manufacturers for critical parts
- Consider supply chain stability and longevity
""",
    metadata={"source": "engineering_policies"}
)

FINANCE_POLICIES = StringKnowledgeSource(
    content="""
# Finance Review Policies

## Budget Management
- Never approve spend that exceeds remaining budget
- Flag items that consume >20% of total budget
- Consider buffer for unexpected costs (recommend 10%)

## Price Break Analysis
- Always evaluate if ordering more saves money
- Calculate break-even for higher quantity orders
- Consider storage costs for excess inventory

## MOQ Handling
- If MOQ exceeds quantity needed, calculate excess cost
- Consider if excess can be used for spares/future builds
- Flag significant MOQ premiums (>50% excess)

## Cost Optimization
- Look for volume consolidation opportunities
- Consider total cost of ownership (shipping, duties, storage)
- Prefer suppliers with better payment terms when prices are similar

## Risk Considerations
- Lower price from unknown supplier = higher risk
- Factor in potential quality issues and returns
- Consider supply chain disruption costs
""",
    metadata={"source": "finance_policies"}
)

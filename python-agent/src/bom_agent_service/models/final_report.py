"""Final decision report models for judicial-style output."""

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


class FollowUpItem(BaseModel):
    """Follow-up action item identified during the review."""
    priority: Literal["HIGH", "MEDIUM", "LOW"] = Field(description="Priority level of the follow-up")
    category: str = Field(description="Category: engineering, sourcing, finance, compliance")
    description: str = Field(description="Description of the follow-up action needed")
    related_mpns: list[str] = Field(default_factory=list, description="MPNs related to this follow-up")
    suggested_owner: Optional[str] = Field(default=None, description="Suggested owner for this action")


class ProjectSummary(BaseModel):
    """Structured project summary for the final report."""
    total_parts: int = Field(description="Total number of parts evaluated")
    approved_count: int = Field(description="Number of parts approved")
    rejected_count: int = Field(description="Number of parts rejected")
    total_estimated_spend: float = Field(description="Total estimated spend for approved parts")
    budget_remaining: float = Field(description="Remaining budget after approved spend")
    overall_risk_level: Literal["LOW", "MEDIUM", "HIGH"] = Field(description="Overall risk assessment")
    key_risks: list[str] = Field(default_factory=list, description="Key risks identified across all parts")
    strategic_recommendations: list[str] = Field(default_factory=list, description="Strategic recommendations for the project")


class PartVerdict(BaseModel):
    """Final verdict for a single part - judicial style."""
    mpn: str = Field(description="Manufacturer part number")
    verdict: Literal["APPROVED", "REJECTED"] = Field(description="Final verdict")

    # Sourcing details (only populated if approved)
    selected_supplier_id: Optional[str] = Field(default=None, description="Selected supplier ID")
    selected_supplier_name: Optional[str] = Field(default=None, description="Selected supplier name")
    final_quantity: int = Field(default=0, description="Final quantity to order")
    final_unit_price: float = Field(default=0.0, description="Final unit price")
    final_line_cost: float = Field(default=0.0, description="Final total line cost")

    # Judicial-style reasoning sections
    engineering_findings: str = Field(description="Summary of engineering assessment findings")
    sourcing_findings: str = Field(description="Summary of sourcing assessment findings")
    finance_findings: str = Field(description="Summary of finance assessment findings")

    points_of_agreement: list[str] = Field(default_factory=list, description="Points where all agents agreed")
    points_of_conflict: list[str] = Field(default_factory=list, description="Points where agents disagreed")
    resolution_rationale: str = Field(description="Comprehensive rationale explaining how the decision was reached")

    risk_factors: list[str] = Field(default_factory=list, description="Risk factors identified for this part")
    mitigations: list[str] = Field(default_factory=list, description="Recommended risk mitigations")
    conditions: list[str] = Field(default_factory=list, description="Conditions attached to approval (if any)")


class FinalDecisionReport(BaseModel):
    """Complete judicial-style decision report for a BOM review.

    This is the comprehensive output from the final decision agent,
    providing detailed reasoning and structured data for each part decision.
    """
    report_id: str = Field(description="Unique identifier for this report")
    project_id: str = Field(description="Project ID this report is for")
    generated_at: datetime = Field(default_factory=datetime.now, description="When the report was generated")

    # Executive summary
    executive_summary: str = Field(description="2-3 paragraph executive summary of the review")

    # Per-part verdicts
    verdicts: list[PartVerdict] = Field(description="Individual verdicts for each part")

    # Project-level summary
    project_summary: ProjectSummary = Field(description="Structured project summary")

    # Follow-up items
    follow_up_notes: list[FollowUpItem] = Field(default_factory=list, description="Follow-up action items")

    # Metadata
    total_approved: int = Field(description="Total parts approved")
    total_rejected: int = Field(description="Total parts rejected")
    total_spend: float = Field(description="Total approved spend")
    budget_utilization_pct: float = Field(description="Percentage of budget utilized")

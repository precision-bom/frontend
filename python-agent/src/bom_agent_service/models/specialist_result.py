"""Specialist agent result model for intermediate analysis."""

from datetime import datetime
from pydantic import BaseModel, Field


class SpecialistAgentResult(BaseModel):
    """Result from a specialist agent (Engineering/Sourcing/Finance).

    This captures the prose analysis from specialist agents without
    requiring structured decisions. The final decision agent will
    synthesize these inputs into structured verdicts.
    """
    agent_name: str = Field(description="Name of the agent (EngineeringAgent, SourcingAgent, FinanceAgent)")
    timestamp: datetime = Field(default_factory=datetime.now, description="When the analysis was generated")
    parts_evaluated: list[str] = Field(description="List of MPNs that were evaluated")
    analysis_notes: str = Field(description="Full prose analysis from the agent")
    key_concerns: list[str] = Field(default_factory=list, description="Key concerns identified (optional)")
    recommendations: list[str] = Field(default_factory=list, description="Recommendations from the agent (optional)")
    raw_response: str = Field(description="Full raw LLM response for debugging")

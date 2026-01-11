"""Project and BOM line item models."""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field
import uuid

from .enums import DecisionStatus, LineItemStatus, ProductType


class ComplianceRequirements(BaseModel):
    """Compliance requirements for a project."""
    standards: list[str] = Field(default_factory=list)  # ["RoHS", "CE", "FDA"]
    quality_class: str = "IPC Class 2"
    country_of_origin_restrictions: list[str] = Field(default_factory=list)


class SourcingConstraints(BaseModel):
    """Sourcing constraints for a project."""
    allow_brokers: bool = False
    allow_alternates: bool = True
    single_source_ok: bool = False
    preferred_distributors: list[str] = Field(default_factory=list)
    max_lead_time_days: int = 30


class PreferredManufacturers(BaseModel):
    """Preferred manufacturers by component category."""
    capacitors: list[str] = Field(default_factory=list)
    resistors: list[str] = Field(default_factory=list)
    mcu: list[str] = Field(default_factory=list)
    connectors: list[str] = Field(default_factory=list)
    other: dict[str, list[str]] = Field(default_factory=dict)


class AvoidPart(BaseModel):
    """A part to avoid."""
    mpn: str
    reason: str


class EngineeringContext(BaseModel):
    """Engineering context for decision making."""
    notes: str = ""
    critical_parts: list[str] = Field(default_factory=list)  # Reference designators
    preferred_manufacturers: PreferredManufacturers = Field(default_factory=PreferredManufacturers)
    avoid_parts: list[AvoidPart] = Field(default_factory=list)


class ProjectContext(BaseModel):
    """Full project context from intake sheet."""
    # Project info
    project_id: str = Field(default_factory=lambda: f"PRJ-{uuid.uuid4().hex[:8].upper()}")
    project_name: str = ""
    owner: str = ""
    engineering_contact: str = ""

    # Requirements
    product_type: ProductType = ProductType.CONSUMER
    quantity: int = 1
    deadline: Optional[date] = None
    budget_total: float = 0.0

    # Compliance
    compliance: ComplianceRequirements = Field(default_factory=ComplianceRequirements)

    # Sourcing
    sourcing_constraints: SourcingConstraints = Field(default_factory=SourcingConstraints)

    # Engineering
    engineering_context: EngineeringContext = Field(default_factory=EngineeringContext)


class AgentDecision(BaseModel):
    """Decision output from an agent."""
    agent_name: str
    status: DecisionStatus
    reasoning: str = ""
    output_data: dict = Field(default_factory=dict)
    references: list[str] = Field(default_factory=list)  # Data sources used
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class BOMLineItem(BaseModel):
    """A single line item from a BOM."""
    line_id: str = Field(default_factory=lambda: f"L{uuid.uuid4().hex[:8].upper()}")
    project_id: str = ""

    # From BOM upload
    reference_designators: list[str] = Field(default_factory=list)  # ["R1", "R2"]
    quantity: int = 1
    mpn: str = ""
    manufacturer: str = ""
    description: str = ""

    # Optional from BOM
    package: str = ""
    value: str = ""  # "10K", "100nF"

    # Processing state
    status: LineItemStatus = LineItemStatus.PENDING_ENRICHMENT
    approved_alternates: list[str] = Field(default_factory=list)
    selected_mpn: Optional[str] = None
    selected_supplier: Optional[str] = None

    # Decision trail
    engineering_decision: Optional[AgentDecision] = None
    sourcing_decision: Optional[AgentDecision] = None
    finance_decision: Optional[AgentDecision] = None
    final_decision: Optional[AgentDecision] = None  # Aggregated decision from FinalDecisionAgent
    purchasing_decision: Optional[AgentDecision] = None


class FlowTraceStep(BaseModel):
    """A step in the flow execution trace."""
    step: str
    agent: Optional[str] = None
    message: str
    reasoning: Optional[str] = None
    references: list[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class Project(BaseModel):
    """A BOM processing project."""
    project_id: str
    context: ProjectContext

    # BOM
    line_items: list[BOMLineItem] = Field(default_factory=list)

    # Status
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "created"  # created, enriching, decisioning, ordering, complete, failed

    # Execution trace
    trace: list[FlowTraceStep] = Field(default_factory=list)

    # Outputs
    purchase_orders: list[dict] = Field(default_factory=list)

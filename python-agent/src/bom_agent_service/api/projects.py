"""Projects API router."""

import csv
import tempfile
from datetime import date, datetime
from pathlib import Path
from typing import Optional
from io import StringIO

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

from ..models import (
    ProjectContext,
    BOMLineItem,
    ComplianceRequirements,
    SourcingConstraints,
    EngineeringContext,
    ProductType,
    FlowTraceStep,
)
from ..stores import ProjectStore, OrgKnowledgeStore
from ..stores.org_knowledge import seed_default_suppliers
from ..flows import run_flow_async

# Rich console for formatted output
console = Console()

# Agent colors for visual distinction (light-background friendly)
AGENT_COLORS = {
    "EngineeringAgent": "dark_cyan",
    "SourcingAgent": "dark_green",
    "FinanceAgent": "dark_orange",
    "FinalDecisionAgent": "dark_magenta",
}

STEP_ICONS = {
    "intake": "📥",
    "enrich": "🔍",
    "parallel_review": "⚡",
    "engineering": "🔧",
    "sourcing": "📦",
    "finance": "💰",
    "final_decision": "⚖️",
    "complete": "✅",
}


def log_flow_step(step: FlowTraceStep) -> None:
    """Log a flow step with reasoning to the console using Rich formatting."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    icon = STEP_ICONS.get(step.step, "•")

    # Build the header line
    if step.agent:
        agent_color = AGENT_COLORS.get(step.agent, "default")
        header = Text()
        header.append(f"{timestamp} ", style="dim")
        header.append(f"{icon} ", style="bold")
        header.append(f"[{step.step}] ", style="bold blue")
        header.append(f"[{step.agent}] ", style=f"bold {agent_color}")
        header.append(step.message, style="default")
        console.print(header)
    else:
        header = Text()
        header.append(f"{timestamp} ", style="dim")
        header.append(f"{icon} ", style="bold")
        header.append(f"[{step.step}] ", style="bold blue")
        header.append(step.message, style="default")
        console.print(header)

    # Show reasoning in a subtle indented format
    if step.reasoning:
        reasoning_text = Text()
        reasoning_text.append("         └─ ", style="dim")
        reasoning_text.append(step.reasoning, style="italic dark_cyan")
        console.print(reasoning_text)

router = APIRouter(prefix="/projects", tags=["projects"])

DATA_DIR = "data"


# Request/Response models
class ProjectCreateRequest(BaseModel):
    """Request to create a project."""
    project_name: Optional[str] = None
    owner: Optional[str] = None
    product_type: str = "consumer"
    quantity: int = 1
    deadline: Optional[date] = None
    budget_total: float = 0.0
    compliance_standards: list[str] = Field(default_factory=list)
    quality_class: str = "IPC Class 2"
    allow_brokers: bool = False
    allow_alternates: bool = True
    preferred_distributors: list[str] = Field(default_factory=list)
    max_lead_time_days: int = 30
    engineering_notes: Optional[str] = None
    critical_parts: list[str] = Field(default_factory=list)


class ProjectSummary(BaseModel):
    """Summary of a project."""
    project_id: str
    project_name: Optional[str]
    status: str
    line_item_count: int
    created_at: str
    updated_at: str


class ProjectResponse(BaseModel):
    """Full project response."""
    project_id: str
    context: dict
    line_items: list[dict]
    status: str
    created_at: str
    updated_at: str
    trace: list[dict]


class ProcessResponse(BaseModel):
    """Response from processing a project."""
    project_id: str
    status: str
    message: str


# Store instances (would be dependency injected in production)
def get_project_store() -> ProjectStore:
    return ProjectStore(f"{DATA_DIR}/projects.db")


def get_org_store() -> OrgKnowledgeStore:
    store = OrgKnowledgeStore(f"{DATA_DIR}/org_knowledge.db")
    seed_default_suppliers(store)
    return store


@router.get("", response_model=list[ProjectSummary])
async def list_projects(limit: int = 100):
    """List all projects."""
    store = get_project_store()
    projects = store.list_projects(limit=limit)

    return [
        ProjectSummary(
            project_id=p.project_id,
            project_name=p.context.project_name,
            status=p.status,
            line_item_count=len(p.line_items),
            created_at=p.created_at.isoformat(),
            updated_at=p.updated_at.isoformat(),
        )
        for p in projects
    ]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    """Get a project by ID."""
    store = get_project_store()
    project = store.get_project(project_id)

    if not project:
        raise HTTPException(status_code=404, detail=f"Project not found: {project_id}")

    return ProjectResponse(
        project_id=project.project_id,
        context=project.context.model_dump(),
        line_items=[item.model_dump() for item in project.line_items],
        status=project.status,
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat(),
        trace=[step.model_dump() for step in project.trace],
    )


@router.get("/{project_id}/trace", response_model=list[dict])
async def get_project_trace(project_id: str):
    """Get execution trace for a project."""
    store = get_project_store()
    project = store.get_project(project_id)

    if not project:
        raise HTTPException(status_code=404, detail=f"Project not found: {project_id}")

    return [step.model_dump() for step in project.trace]


@router.post("", response_model=ProjectSummary)
async def create_project(
    bom_file: UploadFile = File(...),
    project_name: Optional[str] = Form(None),
    owner: Optional[str] = Form(None),
    product_type: str = Form("consumer"),
    quantity: int = Form(1),
    deadline: Optional[str] = Form(None),
    budget_total: float = Form(0.0),
    compliance_standards: str = Form(""),  # Comma-separated
    quality_class: str = Form("IPC Class 2"),
    allow_brokers: bool = Form(False),
    allow_alternates: bool = Form(True),
    preferred_distributors: str = Form(""),  # Comma-separated
    max_lead_time_days: int = Form(30),
    engineering_notes: Optional[str] = Form(None),
    critical_parts: str = Form(""),  # Comma-separated
):
    """Create a new project from BOM CSV upload."""

    # Parse BOM CSV
    content = await bom_file.read()
    content_str = content.decode("utf-8")

    line_items = []
    reader = csv.DictReader(StringIO(content_str))
    for row in reader:
        ref_des = row.get("Reference Designators", row.get("Ref Des", row.get("Part Number", "")))
        line_items.append(BOMLineItem(
            reference_designators=[ref_des] if ref_des else [],
            quantity=int(row.get("Quantity", row.get("Qty", 1))),
            mpn=row.get("MPN", row.get("Part Number", "")),
            manufacturer=row.get("Manufacturer", ""),
            description=row.get("Description", ""),
            package=row.get("Package", ""),
            value=row.get("Value", ""),
        ))

    if not line_items:
        raise HTTPException(status_code=400, detail="No valid line items found in BOM")

    # Parse comma-separated fields
    standards = [s.strip() for s in compliance_standards.split(",") if s.strip()]
    distributors = [d.strip() for d in preferred_distributors.split(",") if d.strip()]
    critical = [c.strip() for c in critical_parts.split(",") if c.strip()]

    # Build context
    context = ProjectContext(
        project_name=project_name or "",
        owner=owner or "",
        product_type=ProductType(product_type),
        quantity=quantity,
        deadline=date.fromisoformat(deadline) if deadline else None,
        budget_total=budget_total,
        compliance=ComplianceRequirements(
            standards=standards,
            quality_class=quality_class,
        ),
        sourcing_constraints=SourcingConstraints(
            allow_brokers=allow_brokers,
            allow_alternates=allow_alternates,
            preferred_distributors=distributors,
            max_lead_time_days=max_lead_time_days,
        ),
        engineering_context=EngineeringContext(
            notes=engineering_notes or "",
            critical_parts=critical,
        ),
    )

    # Create project
    store = get_project_store()
    project = store.create_project(context, line_items)

    return ProjectSummary(
        project_id=project.project_id,
        project_name=project.context.project_name,
        status=project.status,
        line_item_count=len(project.line_items),
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat(),
    )


@router.post("/upload-and-process", response_model=ProcessResponse)
async def upload_and_process(
    bom_file: UploadFile = File(...),
    intake_file: Optional[UploadFile] = File(None),
):
    """Upload BOM (and optional intake YAML) and process through agent flow."""

    # Save files temporarily
    bom_content = await bom_file.read()

    with tempfile.NamedTemporaryFile(mode="wb", suffix=".csv", delete=False) as f:
        f.write(bom_content)
        bom_path = f.name

    intake_path = None
    if intake_file:
        intake_content = await intake_file.read()
        with tempfile.NamedTemporaryFile(mode="wb", suffix=".yaml", delete=False) as f:
            f.write(intake_content)
            intake_path = f.name

    # Run flow asynchronously with logging callback
    try:
        project = await run_flow_async(
            bom_path=bom_path,
            intake_path=intake_path,
            data_dir=DATA_DIR,
            on_step=log_flow_step,
        )

        return ProcessResponse(
            project_id=project.project_id,
            status=project.status,
            message=f"Processed {len(project.line_items)} line items",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temp files
        Path(bom_path).unlink(missing_ok=True)
        if intake_path:
            Path(intake_path).unlink(missing_ok=True)


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """Delete a project."""
    store = get_project_store()

    if not store.get_project(project_id):
        raise HTTPException(status_code=404, detail=f"Project not found: {project_id}")

    store.delete_project(project_id)
    return {"deleted": project_id}

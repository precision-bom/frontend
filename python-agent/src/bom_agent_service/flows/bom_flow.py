"""BOM Processing Flow using CrewAI with parallel agent execution."""

import asyncio
import csv
from typing import Optional, Callable
import yaml

from crewai.flow.flow import Flow, listen, start
from pydantic import BaseModel

from ..models import (
    ProjectContext,
    BOMLineItem,
    Project,
    FlowTraceStep,
    LineItemStatus,
    DecisionStatus,
    ComplianceRequirements,
    SourcingConstraints,
    EngineeringContext,
    PreferredManufacturers,
    ProductType,
    AgentDecision,
    SpecialistAgentResult,
    FinalDecisionReport,
)
from ..models.market_intel import MarketIntelReport
from ..stores import ProjectStore, OffersStore, OrgKnowledgeStore
from ..stores.offers_store import create_mock_offers
from ..stores.org_knowledge import seed_default_suppliers
from ..stores.market_intel_store import MarketIntelStore
from ..agents import EngineeringAgent, SourcingAgent, FinanceAgent, FinalDecisionAgent, MarketIntelAgent
from ..services.apify_client import ApifyClient
from ..utils.rich_logger import console, log_flow_step


class BOMFlowState(BaseModel):
    """State maintained throughout the flow."""
    project_id: str = ""
    bom_path: str = ""
    intake_path: str = ""
    error: Optional[str] = None


class BOMProcessingFlow(Flow[BOMFlowState]):
    """Flow for processing a BOM with parallel agent execution."""

    def __init__(
        self,
        project_store: ProjectStore,
        org_store: OrgKnowledgeStore,
        engineering_agent: EngineeringAgent,
        sourcing_agent: SourcingAgent,
        finance_agent: FinanceAgent,
        final_decision_agent: FinalDecisionAgent,
        market_intel_agent: Optional[MarketIntelAgent] = None,
        on_step: Optional[Callable[[FlowTraceStep], None]] = None,
    ):
        super().__init__()
        self.project_store = project_store
        self.org_store = org_store
        self.on_step = on_step
        self.offers_store: Optional[OffersStore] = None
        self._project: Optional[Project] = None

        # Use pre-initialized agents
        self._engineering_agent = engineering_agent
        self._sourcing_agent = sourcing_agent
        self._finance_agent = finance_agent
        self._final_decision_agent = final_decision_agent
        self._market_intel_agent = market_intel_agent

        # Store specialist agent results
        self._engineering_result: Optional[SpecialistAgentResult] = None
        self._sourcing_result: Optional[SpecialistAgentResult] = None
        self._finance_result: Optional[SpecialistAgentResult] = None

        # Store final decision report
        self._final_report: Optional[FinalDecisionReport] = None

        # Market intelligence report
        self._market_intel_report: Optional[MarketIntelReport] = None

    def _log_step(self, step: str, message: str, agent: str = None, reasoning: str = None, references: list[str] = None):
        """Log a step and notify callback."""
        trace_step = FlowTraceStep(
            step=step,
            agent=agent,
            message=message,
            reasoning=reasoning,
            references=references or [],
        )
        if self._project:
            self._project.trace.append(trace_step)
            self.project_store.update_project(self._project)
        if self.on_step:
            self.on_step(trace_step)

        # Also log with rich formatting
        log_flow_step(step, message, agent)

    @start()
    def intake(self):
        """Parse BOM and create project."""
        self._log_step("intake", f"Starting intake from {self.state.bom_path}")

        try:
            context = self._parse_intake(self.state.intake_path) if self.state.intake_path else ProjectContext()
            line_items = self._parse_bom(self.state.bom_path)

            self._project = self.project_store.create_project(context, line_items)
            self.state.project_id = self._project.project_id

            self.offers_store = OffersStore(self._project.project_id)

            self._log_step(
                "intake",
                f"Created project {self._project.project_id} with {len(line_items)} line items"
            )

            return self.state

        except Exception as e:
            self.state.error = str(e)
            self._log_step("intake", f"ERROR: {e}")
            return self.state

    @listen(intake)
    def enrich(self):
        """Enrich line items with supplier offers."""
        if self.state.error:
            return self.state

        self._log_step("enrich", "Starting enrichment")

        self._project = self.project_store.get_project(self.state.project_id)
        self._project.status = "enriching"

        enriched = 0
        for item in self._project.line_items:
            mock = create_mock_offers(item.mpn, item.manufacturer, item.description)
            self.offers_store.set_offers(item.mpn, mock)
            item.status = LineItemStatus.ENRICHED
            enriched += 1

        self.project_store.update_project(self._project)
        self._log_step("enrich", f"Enriched {enriched}/{len(self._project.line_items)} items with supplier data")

        return self.state

    @listen(enrich)
    async def gather_market_intel(self):
        """Gather market intelligence using Apify web scraping."""
        if self.state.error:
            return self.state

        if not self._market_intel_agent:
            self._log_step("market_intel", "Market intelligence agent not configured - skipping")
            return self.state

        self._log_step("market_intel", "Starting market intelligence gathering via Apify")

        self._project = self.project_store.get_project(self.state.project_id)

        try:
            self._market_intel_report = await self._market_intel_agent.gather_intel(
                self._project.line_items,
                self._project.context,
            )

            if self._market_intel_report.items:
                self._log_step(
                    "market_intel",
                    f"Gathered {len(self._market_intel_report.items)} intel items from {self._market_intel_report.total_sources_scraped} sources",
                    agent="MarketIntelAgent",
                )

                # Log key findings
                if self._market_intel_report.supply_chain_risks:
                    self._log_step(
                        "market_intel",
                        f"Supply chain risks identified: {len(self._market_intel_report.supply_chain_risks)}",
                        agent="MarketIntelAgent",
                        reasoning="\n".join(f"- {r}" for r in self._market_intel_report.supply_chain_risks[:5]),
                    )

                if self._market_intel_report.shortage_alerts:
                    self._log_step(
                        "market_intel",
                        f"Shortage alerts: {len(self._market_intel_report.shortage_alerts)}",
                        agent="MarketIntelAgent",
                        reasoning="\n".join(f"- {a}" for a in self._market_intel_report.shortage_alerts[:5]),
                    )
            else:
                self._log_step(
                    "market_intel",
                    "No market intelligence gathered (Apify may not be configured)",
                    agent="MarketIntelAgent",
                )

        except Exception as e:
            self._log_step("market_intel", f"Market intel gathering failed: {e}", agent="MarketIntelAgent")
            # Don't fail the flow, just continue without market intel

        return self.state

    @listen(gather_market_intel)
    async def parallel_agent_review(self):
        """Run Engineering, Sourcing, and Finance agents in parallel using asyncio."""
        import time
        if self.state.error:
            return self.state

        start_time = time.time()
        self._log_step("parallel_review", "Starting parallel agent review (Engineering, Sourcing, Finance)")

        self._project = self.project_store.get_project(self.state.project_id)
        self._project.status = "agent_review"

        # Get all enriched items
        items_to_evaluate = [
            item for item in self._project.line_items
            if item.status == LineItemStatus.ENRICHED
        ]

        if not items_to_evaluate:
            self._log_step("parallel_review", "No items to evaluate")
            return self.state

        # Run all three agents in parallel using asyncio.gather
        # Now returns SpecialistAgentResult instead of dict[str, AgentDecision]
        (
            self._engineering_result,
            self._sourcing_result,
            self._finance_result,
        ) = await asyncio.gather(
            self._engineering_agent.evaluate_batch(
                items_to_evaluate,
                self._project.context,
                self.offers_store,
            ),
            self._sourcing_agent.evaluate_batch(
                items_to_evaluate,
                self._project.context,
                self.offers_store,
                market_intel_report=self._market_intel_report,
            ),
            self._finance_agent.evaluate_batch(
                items_to_evaluate,
                self._project.context,
                self.offers_store,
            ),
        )

        parallel_time = time.time() - start_time
        self._log_step("parallel_review", f"Parallel LLM calls completed in {parallel_time:.1f}s")

        # Log specialist results
        self._log_step(
            "engineering",
            f"Engineering analysis complete for {len(self._engineering_result.parts_evaluated)} parts",
            agent="EngineeringAgent",
            reasoning=self._engineering_result.analysis_notes[:500] + "..." if len(self._engineering_result.analysis_notes) > 500 else self._engineering_result.analysis_notes,
        )
        self._log_step(
            "sourcing",
            f"Sourcing analysis complete for {len(self._sourcing_result.parts_evaluated)} parts",
            agent="SourcingAgent",
            reasoning=self._sourcing_result.analysis_notes[:500] + "..." if len(self._sourcing_result.analysis_notes) > 500 else self._sourcing_result.analysis_notes,
        )
        self._log_step(
            "finance",
            f"Finance analysis complete for {len(self._finance_result.parts_evaluated)} parts",
            agent="FinanceAgent",
            reasoning=self._finance_result.analysis_notes[:500] + "..." if len(self._finance_result.analysis_notes) > 500 else self._finance_result.analysis_notes,
        )

        # Mark items as pending final decision
        for item in items_to_evaluate:
            item.status = LineItemStatus.PENDING_FINAL_DECISION

        self.project_store.update_project(self._project)

        self._log_step(
            "parallel_review",
            f"Parallel review complete: All specialist analyses collected for {len(items_to_evaluate)} parts"
        )

        return self.state

    @listen(parallel_agent_review)
    async def final_decision(self):
        """Run Final Decision Agent to synthesize all inputs and make final decisions."""
        import time
        if self.state.error:
            return self.state

        start_time = time.time()
        self._log_step("final_decision", "Starting final decision synthesis")

        self._project = self.project_store.get_project(self.state.project_id)
        self._project.status = "final_decision"

        # Get items pending final decision
        items_to_decide = [
            item for item in self._project.line_items
            if item.status == LineItemStatus.PENDING_FINAL_DECISION
        ]

        if not items_to_decide:
            self._log_step("final_decision", "No items pending final decision")
            return self.state

        # Run final decision agent with specialist results
        self._final_report = await self._final_decision_agent.make_final_decisions(
            items_to_decide,
            self._project.context,
            self._engineering_result,
            self._sourcing_result,
            self._finance_result,
        )

        final_time = time.time() - start_time
        self._log_step("final_decision", f"Final decision LLM call completed in {final_time:.1f}s")

        # Convert FinalDecisionReport to AgentDecision for storage on line items
        # This preserves API compatibility
        verdict_map = {v.mpn: v for v in self._final_report.verdicts}

        for item in items_to_decide:
            verdict = verdict_map.get(item.mpn)
            if verdict:
                # Create AgentDecision from verdict for API compatibility
                item.final_decision = AgentDecision(
                    agent_name="FinalDecisionAgent",
                    status=DecisionStatus.APPROVED if verdict.verdict == "APPROVED" else DecisionStatus.REJECTED,
                    reasoning=verdict.resolution_rationale,
                    output_data={
                        "selected_supplier_id": verdict.selected_supplier_id,
                        "selected_supplier_name": verdict.selected_supplier_name,
                        "final_quantity": verdict.final_quantity,
                        "final_unit_price": verdict.final_unit_price,
                        "final_line_cost": verdict.final_line_cost,
                        "engineering_findings": verdict.engineering_findings,
                        "sourcing_findings": verdict.sourcing_findings,
                        "finance_findings": verdict.finance_findings,
                        "points_of_agreement": verdict.points_of_agreement,
                        "points_of_conflict": verdict.points_of_conflict,
                        "risk_factors": verdict.risk_factors,
                        "mitigations": verdict.mitigations,
                        "conditions": verdict.conditions,
                        # Include report-level data
                        "executive_summary": self._final_report.executive_summary,
                        "total_approved_spend": self._final_report.total_spend,
                        "budget_utilization_pct": self._final_report.budget_utilization_pct,
                    },
                    references=[],
                )

                if verdict.verdict == "APPROVED":
                    item.selected_mpn = item.mpn
                    item.selected_supplier = verdict.selected_supplier_id
                    item.status = LineItemStatus.PENDING_PURCHASE
                else:
                    item.status = LineItemStatus.FAILED

                # Log each verdict
                self._log_step(
                    "final_decision",
                    f"{item.mpn}: {verdict.verdict} - "
                    f"Supplier: {verdict.selected_supplier_name or 'N/A'}, "
                    f"Qty: {verdict.final_quantity}, "
                    f"Cost: ${verdict.final_line_cost:.2f}",
                    agent="FinalDecisionAgent",
                    reasoning=verdict.resolution_rationale,
                )

        self.project_store.update_project(self._project)

        self._log_step(
            "final_decision",
            f"Final decisions complete: {self._final_report.total_approved}/{len(items_to_decide)} approved, "
            f"${self._final_report.total_spend:,.2f} total spend "
            f"({self._final_report.budget_utilization_pct:.1f}% of budget)"
        )

        return self.state

    @listen(final_decision)
    def complete(self):
        """Mark project as complete."""
        if self.state.error:
            return self.state

        self._project = self.project_store.get_project(self.state.project_id)
        self._project.status = "complete"
        self.project_store.update_project(self._project)

        self._log_step("complete", f"Project {self._project.project_id} processing complete")

        # Print final summary using rich
        if self._final_report:
            console.rule("[bold green]PROCESSING COMPLETE[/bold green]", style="green")
            console.print(f"[bold]Project:[/bold] {self._project.project_id}")
            console.print(f"[bold]Parts:[/bold] {self._final_report.total_approved} approved, {self._final_report.total_rejected} rejected")
            console.print(f"[bold]Total Spend:[/bold] ${self._final_report.total_spend:,.2f}")
            console.print(f"[bold]Budget Utilization:[/bold] {self._final_report.budget_utilization_pct:.1f}%")
            console.print()

        return self.state

    def _parse_bom(self, bom_path: str) -> list[BOMLineItem]:
        """Parse a BOM CSV file."""
        items = []
        with open(bom_path, newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ref_des = row.get("Reference Designators", row.get("Ref Des", row.get("Part Number", "")))
                items.append(BOMLineItem(
                    reference_designators=[ref_des] if ref_des else [],
                    quantity=int(row.get("Quantity", row.get("Qty", 1))),
                    mpn=row.get("MPN", row.get("Part Number", "")),
                    manufacturer=row.get("Manufacturer", ""),
                    description=row.get("Description", ""),
                    package=row.get("Package", ""),
                    value=row.get("Value", ""),
                ))
        return items

    def _parse_intake(self, intake_path: str) -> ProjectContext:
        """Parse a project intake YAML file."""
        with open(intake_path) as f:
            data = yaml.safe_load(f)

        project = data.get("project", {})
        requirements = data.get("requirements", {})
        compliance = data.get("compliance", {})
        sourcing = data.get("sourcing_constraints", {})
        engineering = data.get("engineering_context", {})

        pref_mfg_data = engineering.get("preferred_manufacturers", {})
        pref_mfg = PreferredManufacturers(
            capacitors=pref_mfg_data.get("capacitors", []),
            resistors=pref_mfg_data.get("resistors", []),
            mcu=pref_mfg_data.get("mcu", []),
            connectors=pref_mfg_data.get("connectors", []),
        )

        return ProjectContext(
            project_id=project.get("id", ""),
            project_name=project.get("name", ""),
            owner=project.get("owner", ""),
            engineering_contact=project.get("engineering_contact", ""),
            product_type=ProductType(requirements.get("product_type", "consumer")),
            quantity=requirements.get("quantity", 1),
            deadline=requirements.get("deadline"),
            budget_total=requirements.get("budget_total", 0.0),
            compliance=ComplianceRequirements(
                standards=compliance.get("standards", []),
                quality_class=compliance.get("quality_class", "IPC Class 2"),
                country_of_origin_restrictions=compliance.get("country_of_origin_restrictions", []),
            ),
            sourcing_constraints=SourcingConstraints(
                allow_brokers=sourcing.get("allow_brokers", False),
                allow_alternates=sourcing.get("allow_alternates", True),
                single_source_ok=sourcing.get("single_source_ok", False),
                preferred_distributors=sourcing.get("preferred_distributors", []),
                max_lead_time_days=sourcing.get("max_lead_time_days", 30),
            ),
            engineering_context=EngineeringContext(
                notes=engineering.get("notes", ""),
                critical_parts=engineering.get("critical_parts", []),
                preferred_manufacturers=pref_mfg,
            ),
        )


# Global agent instances - initialized at startup
_engineering_agent: Optional[EngineeringAgent] = None
_sourcing_agent: Optional[SourcingAgent] = None
_finance_agent: Optional[FinanceAgent] = None
_final_decision_agent: Optional[FinalDecisionAgent] = None
_market_intel_agent: Optional[MarketIntelAgent] = None
_org_store: Optional[OrgKnowledgeStore] = None
_intel_store: Optional[MarketIntelStore] = None
_apify_client: Optional[ApifyClient] = None


def initialize_agents(data_dir: str = "data"):
    """Initialize agents at startup. Call this once when server starts."""
    global _engineering_agent, _sourcing_agent, _finance_agent, _final_decision_agent
    global _market_intel_agent, _org_store, _intel_store, _apify_client

    console.rule("[bold blue]Initializing BOM Processing Agents[/bold blue]", style="blue")

    _org_store = OrgKnowledgeStore(f"{data_dir}/org_knowledge.db")
    seed_default_suppliers(_org_store)

    _engineering_agent = EngineeringAgent(_org_store)
    _sourcing_agent = SourcingAgent(_org_store)
    _finance_agent = FinanceAgent()
    _final_decision_agent = FinalDecisionAgent()

    # Initialize Apify client and Market Intelligence agent
    _apify_client = ApifyClient()
    _intel_store = MarketIntelStore(f"{data_dir}/market_intel.db")

    if _apify_client.is_configured():
        _market_intel_agent = MarketIntelAgent(_apify_client, _intel_store)
        console.print("[green]Market Intelligence agent initialized with Apify[/green]")
    else:
        _market_intel_agent = None
        console.print("[yellow]Apify not configured - Market Intelligence agent disabled[/yellow]")

    console.print(f"[bold]Parallel agents model:[/bold] {_engineering_agent._llm.model}")
    console.print(f"[bold]Final decision model:[/bold] {_final_decision_agent._llm.model}")
    console.print()
    console.print("[dim]Flow: Intake -> Enrich -> Market Intel -> [Engineering | Sourcing | Finance] (parallel) -> Final Decision -> Complete[/dim]")
    console.print()


def get_agents():
    """Get initialized agents. Returns (engineering, sourcing, finance, final_decision, market_intel, org_store)."""
    if _engineering_agent is None:
        raise RuntimeError("Agents not initialized. Call initialize_agents() first.")
    return _engineering_agent, _sourcing_agent, _finance_agent, _final_decision_agent, _market_intel_agent, _org_store


async def run_flow_async(
    bom_path: str,
    intake_path: Optional[str] = None,
    data_dir: str = "data",
    on_step: Optional[Callable[[FlowTraceStep], None]] = None,
) -> Project:
    """Run the BOM processing flow asynchronously."""
    global _engineering_agent, _sourcing_agent, _finance_agent, _final_decision_agent
    global _market_intel_agent, _org_store

    if _engineering_agent is None:
        initialize_agents(data_dir)

    project_store = ProjectStore(f"{data_dir}/projects.db")

    flow = BOMProcessingFlow(
        project_store,
        _org_store,
        _engineering_agent,
        _sourcing_agent,
        _finance_agent,
        _final_decision_agent,
        market_intel_agent=_market_intel_agent,
        on_step=on_step,
    )
    flow.state.bom_path = bom_path
    flow.state.intake_path = intake_path or ""

    await flow.kickoff_async()

    return project_store.get_project(flow.state.project_id)


def run_flow(
    bom_path: str,
    intake_path: Optional[str] = None,
    data_dir: str = "data",
    on_step: Optional[Callable[[FlowTraceStep], None]] = None,
) -> Project:
    """Run the BOM processing flow synchronously (for CLI usage)."""
    import asyncio
    return asyncio.run(run_flow_async(bom_path, intake_path, data_dir, on_step))

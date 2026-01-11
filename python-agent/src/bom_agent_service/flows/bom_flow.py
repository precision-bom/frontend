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
)
from ..models.market_intel import MarketIntelReport
from ..stores import ProjectStore, OffersStore, OrgKnowledgeStore
from ..stores.offers_store import create_mock_offers
from ..stores.org_knowledge import seed_default_suppliers
from ..stores.market_intel_store import MarketIntelStore
from ..agents import EngineeringAgent, SourcingAgent, FinanceAgent, FinalDecisionAgent, MarketIntelAgent
from ..services.apify_client import ApifyClient


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

        # Store agent decisions for aggregation
        self._engineering_decisions: dict[str, AgentDecision] = {}
        self._sourcing_decisions: dict[str, AgentDecision] = {}
        self._finance_decisions: dict[str, AgentDecision] = {}

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
        (
            self._engineering_decisions,
            self._sourcing_decisions,
            self._finance_decisions,
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

        # Log each agent's decisions with full reasoning
        self._log_agent_decisions("engineering", self._engineering_decisions, items_to_evaluate)
        self._log_agent_decisions("sourcing", self._sourcing_decisions, items_to_evaluate)
        self._log_agent_decisions("finance", self._finance_decisions, items_to_evaluate)

        # Store decisions on line items for reference
        for item in items_to_evaluate:
            item.engineering_decision = self._engineering_decisions.get(item.mpn)
            item.sourcing_decision = self._sourcing_decisions.get(item.mpn)
            item.finance_decision = self._finance_decisions.get(item.mpn)
            item.status = LineItemStatus.PENDING_FINAL_DECISION

        self.project_store.update_project(self._project)

        eng_approved = sum(1 for d in self._engineering_decisions.values() if d.status == DecisionStatus.APPROVED)
        src_approved = sum(1 for d in self._sourcing_decisions.values() if d.status == DecisionStatus.APPROVED)
        fin_approved = sum(1 for d in self._finance_decisions.values() if d.status == DecisionStatus.APPROVED)

        self._log_step(
            "parallel_review",
            f"Parallel review complete: Engineering {eng_approved}/{len(items_to_evaluate)} approved, "
            f"Sourcing {src_approved}/{len(items_to_evaluate)} approved, "
            f"Finance {fin_approved}/{len(items_to_evaluate)} approved"
        )

        return self.state

    def _log_agent_decisions(self, agent_type: str, decisions: dict[str, AgentDecision], items: list[BOMLineItem]):
        """Log each decision from an agent with full reasoning."""
        agent_name = f"{agent_type.title()}Agent"
        for item in items:
            decision = decisions.get(item.mpn)
            if decision:
                # Log the full reasoning, not truncated
                self._log_step(
                    agent_type,
                    f"{item.mpn}: {decision.status.value}",
                    agent=agent_name,
                    reasoning=decision.reasoning,  # Full reasoning, no truncation
                )

    @listen(parallel_agent_review)
    async def final_decision(self):
        """Run Final Decision Agent to aggregate all inputs and make final decisions."""
        import time
        if self.state.error:
            return self.state

        start_time = time.time()
        self._log_step("final_decision", "Starting final decision aggregation")

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

        # Run final decision agent
        final_decisions = await self._final_decision_agent.make_final_decisions(
            items_to_decide,
            self._project.context,
            self._engineering_decisions,
            self._sourcing_decisions,
            self._finance_decisions,
        )
        final_time = time.time() - start_time
        self._log_step("final_decision", f"Final decision LLM call completed in {final_time:.1f}s")

        # Apply final decisions
        approved = 0
        total_spend = 0.0
        for item in items_to_decide:
            decision = final_decisions.get(item.mpn)
            if decision:
                item.final_decision = decision

                if decision.status == DecisionStatus.APPROVED:
                    item.selected_mpn = item.mpn  # Could be alternate in future
                    item.selected_supplier = decision.output_data.get("selected_supplier_id")
                    item.status = LineItemStatus.PENDING_PURCHASE
                    total_spend += decision.output_data.get("final_line_cost", 0.0)
                    approved += 1
                else:
                    item.status = LineItemStatus.FAILED

                # Log with full reasoning
                self._log_step(
                    "final_decision",
                    f"{item.mpn}: {decision.status.value} - "
                    f"Supplier: {decision.output_data.get('selected_supplier_name', 'N/A')}, "
                    f"Qty: {decision.output_data.get('final_quantity', 0)}, "
                    f"Cost: ${decision.output_data.get('final_line_cost', 0):.2f}",
                    agent="FinalDecisionAgent",
                    reasoning=decision.reasoning,  # Full comprehensive rationale
                )

        self.project_store.update_project(self._project)
        self._log_step(
            "final_decision",
            f"Final decisions complete: {approved}/{len(items_to_decide)} approved, ${total_spend:,.2f} total spend"
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

    print("Initializing BOM processing agents...")

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
        print("Market Intelligence agent initialized with Apify")
    else:
        _market_intel_agent = None
        print("Apify not configured - Market Intelligence agent disabled (set APIFY_API_TOKEN to enable)")

    print(f"Agents initialized with model: {_engineering_agent._llm.model}")
    print("Flow: Intake → Enrich → Market Intel → [Engineering | Sourcing | Finance] (parallel) → Final Decision → Complete")


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

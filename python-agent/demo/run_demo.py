#!/usr/bin/env python3
"""NeuroLink Mini - BOM Agent Interactive Demo

A step-by-step walkthrough of the multi-agent BOM processing system.
Run with: uv run python demo/run_demo.py
"""

import subprocess
import sys
import time
import threading
from pathlib import Path

import httpx
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich import box

console = Console()

# Demo files
DEMO_DIR = Path(__file__).parent
BOM_FILE = DEMO_DIR / "neurolink_bom.csv"
INTAKE_FILE = DEMO_DIR / "neurolink_intake.yaml"


def run_cmd(cmd: str, capture: bool = False, show_cmd: bool = True) -> str:
    """Run a CLI command and optionally capture output."""
    if show_cmd:
        console.print(f"\n[green]$[/green] [bold]{cmd}[/bold]\n")

    if capture:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.stdout + result.stderr
    else:
        subprocess.run(cmd, shell=True)
        return ""


def run_cmd_with_spinner(cmd: str, message: str, show_cmd: bool = True) -> tuple[str, float]:
    """Run a CLI command with a Rich spinner, returning output and elapsed time."""
    if show_cmd:
        console.print(f"\n[green]$[/green] [bold]{cmd}[/bold]\n")

    result_holder = {"stdout": "", "stderr": "", "done": False}

    def run_in_thread():
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        result_holder["stdout"] = result.stdout
        result_holder["stderr"] = result.stderr
        result_holder["done"] = True

    thread = threading.Thread(target=run_in_thread)
    start_time = time.time()
    thread.start()

    # Show spinner while command runs
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        TimeElapsedColumn(),
        console=console,
        transient=True,
    ) as progress:
        progress.add_task(message, total=None)
        while not result_holder["done"]:
            time.sleep(0.1)

    elapsed = time.time() - start_time
    output = result_holder["stdout"] + result_holder["stderr"]

    # Print the output after spinner completes
    if output.strip():
        console.print(output)

    return output, elapsed


def wait_for_user():
    """Wait for user to press Enter."""
    console.print()
    console.print("[yellow]━" * 70 + "[/yellow]")
    console.input("[bold]Press Enter to continue (or Ctrl+C to exit)...[/bold]")
    console.print()


def banner(title: str):
    """Display a banner."""
    console.print()
    console.print(Panel(
        f"[bold]{title}[/bold]",
        border_style="blue",
        padding=(0, 2),
    ))
    console.print()


def section(title: str):
    """Display a section header."""
    console.print()
    console.print(Panel(
        title,
        border_style="cyan",
        box=box.ROUNDED,
    ))
    console.print()


def explain(text: str):
    """Display an explanation."""
    console.print(f"[yellow]📖 {text}[/yellow]")


def detail(text: str):
    """Display a detail line."""
    console.print(f"[dim]   {text}[/dim]")


def check_server() -> bool:
    """Check if API server is running."""
    try:
        resp = httpx.get("http://localhost:8000/health", timeout=2.0)
        return resp.status_code == 200
    except Exception:
        return False


def main():
    console.clear()

    # =========================================================================
    # INTRO
    # =========================================================================
    banner("🧠 NeuroLink Mini - BOM Agent System Demo")

    console.print("Welcome to the BOM Agent Service demonstration!")
    console.print()
    console.print("This demo walks through a multi-agent system for processing Bills of Materials.")
    console.print("We'll source components for a [bold]portable brain-computer interface[/bold] device.")
    console.print()

    console.print("[cyan]What you'll see:[/cyan]")
    console.print("  1. System architecture and authentication options")
    console.print("  2. x402 payment protocol for pay-per-use API access")
    console.print("  3. Four AI agents reviewing parts (3 in PARALLEL)")
    console.print("  4. Market intelligence gathering via web scraping")
    console.print("  5. Knowledge base management for parts and suppliers")
    console.print("  6. Full audit trail with agent reasoning")
    console.print()

    console.print("[yellow]Prerequisites:[/yellow]")
    console.print("  • API server running: [bold]uv run sourcing-server[/bold]")
    console.print("  • LLM API key (OPENAI_API_KEY or ANTHROPIC_API_KEY)")
    console.print()

    # Check server
    if not check_server():
        console.print("[red]❌ API server not running![/red]")
        console.print("[dim]Start it with: uv run sourcing-server[/dim]")
        sys.exit(1)
    else:
        console.print("[green]✓ API server is running[/green]")

    wait_for_user()

    # =========================================================================
    # STEP 1: Architecture Overview
    # =========================================================================
    banner("Step 1: System Architecture")

    explain("The BOM Agent Service has a layered architecture:")
    console.print()

    arch_diagram = """
┌─────────────────────────────────────────────────────────────────┐
│                         CLI (Rich)                              │
│        'uv run sourcing <command>' sends HTTP requests          │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Server (:8000)                       │
│        /projects  /knowledge  /health  /v1/chat/completions     │
├─────────────────────────────────────────────────────────────────┤
│    Auth Chain: API Key → JWT/OIDC → x402 Payment → Anonymous    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┬───────────────┐
          ▼               ▼               ▼               ▼
  ┌─────────────┐   ┌───────────┐  ┌──────────────┐ ┌───────────┐
  │ProjectStore │   │OffersStore│  │OrgKnowledge  │ │MarketIntel│
  │  (SQLite/   │   │(in-memory)│  │    Store     │ │   Store   │
  │  Postgres)  │   │           │  │              │ │           │
  └─────────────┘   └───────────┘  └──────────────┘ └───────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CrewAI Flow Engine                           │
│  Intake → Enrich → Market Intel (Apify) →                       │
│  [Engineering | Sourcing | Finance] (parallel LLM) →            │
│  Final Decision (LLM) → Complete                                │
└─────────────────────────────────────────────────────────────────┘
"""
    console.print(arch_diagram)

    explain("Each CLI command makes HTTP requests to the FastAPI server.")
    detail("The server orchestrates data stores and AI agents.")

    wait_for_user()

    # =========================================================================
    # STEP 2: x402 Payment Protocol
    # =========================================================================
    banner("Step 2: x402 Payment Protocol")

    explain("The API supports the x402 payment protocol for pay-per-use access.")
    detail("This enables permissionless API monetization via cryptocurrency micropayments.")
    console.print()

    section("How x402 Works")

    x402_diagram = """
┌─────────────────┐                    ┌─────────────────┐
│   Client App    │                    │  BOM Agent API  │
│  (with wallet)  │                    │                 │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │  1. POST /projects/process           │
         │─────────────────────────────────────>│
         │                                      │
         │  2. 402 Payment Required             │
         │     X-Payment-Required: {price, ...} │
         │<─────────────────────────────────────│
         │                                      │
         │  3. Sign payment with wallet         │
         │                                      │
         │  4. Retry with X-Payment header      │
         │─────────────────────────────────────>│
         │                                      │
         │     ┌──────────────────────────────┐ │
         │     │  5. Verify with Facilitator  │ │
         │     │  6. Settle payment (USDC)    │ │
         │     │  7. Create ephemeral client  │ │
         │     └──────────────────────────────┘ │
         │                                      │
         │  8. 200 OK + Results                 │
         │<─────────────────────────────────────│
"""
    console.print(x402_diagram)

    section("Authentication Chain")

    auth_table = Table(box=box.SIMPLE)
    auth_table.add_column("Priority", style="cyan")
    auth_table.add_column("Method", style="bold")
    auth_table.add_column("Use Case", style="dim")
    auth_table.add_row("1", "API Key", "Server-to-server, CLI access")
    auth_table.add_row("2", "JWT/OIDC", "Enterprise SSO integration")
    auth_table.add_row("3", "x402 Payment", "Pay-per-use, permissionless access")
    auth_table.add_row("4", "Anonymous", "Development mode only")
    console.print(auth_table)

    console.print()
    explain("Pricing model:")
    detail("• Base price: $0.05 per project submission")
    detail("• Per-item price: $0.005 per BOM line item")
    detail("• Network: Base Sepolia (testnet) or Base mainnet")
    detail("• Payment: USDC stablecoin")

    console.print()
    section("Environment Variables for x402")

    console.print("  [dim]AUTH_X402_ENABLED=true[/dim]")
    console.print("  [dim]AUTH_X402_PAY_TO_ADDRESS=0x...[/dim]  [yellow]# Your wallet[/yellow]")
    console.print("  [dim]AUTH_X402_NETWORK=base-sepolia[/dim]")
    console.print("  [dim]AUTH_X402_BASE_PRICE=0.05[/dim]")
    console.print("  [dim]AUTH_X402_PER_ITEM_PRICE=0.005[/dim]")

    wait_for_user()

    # =========================================================================
    # STEP 3: Health Check
    # =========================================================================
    banner("Step 3: API Health Check")

    explain("First, let's verify the API server is running.")
    detail("The CLI always checks /health before making requests.")

    run_cmd("curl -s http://localhost:8000/health | python3 -m json.tool")

    console.print()
    explain("The API also exposes a root endpoint showing available routes:")

    run_cmd("curl -s http://localhost:8000/ | python3 -m json.tool")

    wait_for_user()

    # =========================================================================
    # STEP 4: Knowledge Base - Suppliers
    # =========================================================================
    banner("Step 4: Knowledge Base - Suppliers")

    explain("The system maintains organizational knowledge about suppliers.")
    detail("This includes trust levels, on-time rates, and quality metrics.")
    detail("Agents use this knowledge when making sourcing decisions.")
    console.print()

    run_cmd("uv run sourcing kb suppliers list")

    console.print()
    explain("Each supplier has:")
    detail("• Trust Level: high/medium/low/blocked - affects agent preference")
    detail("• On-Time Rate: historical delivery performance")
    detail("• Quality Rate: defect-free delivery percentage")

    wait_for_user()

    # =========================================================================
    # STEP 5: Knowledge Base - Parts
    # =========================================================================
    banner("Step 5: Knowledge Base - Parts")

    explain("The system also tracks knowledge about specific parts.")
    detail("Parts can be banned, have approved alternates, or track failure history.")
    console.print()

    run_cmd("uv run sourcing kb parts list")

    console.print()
    explain("Parts knowledge includes:")
    detail("• Banned status: parts that should never be used")
    detail("• Approved alternates: pre-vetted substitutes")
    detail("• Times used: historical usage count")
    detail("• Failure count: quality issues encountered")

    wait_for_user()

    # =========================================================================
    # STEP 6: The Project - NeuroLink Mini
    # =========================================================================
    banner("Step 6: The Project - NeuroLink Mini")

    explain("We're sourcing parts for a portable brain-computer interface device.")
    detail("This is a medical-grade 8-channel neural signal acquisition unit.")
    console.print()

    section("Device Overview")

    device_table = Table(box=box.SIMPLE)
    device_table.add_column("Property", style="cyan")
    device_table.add_column("Value", style="bold")
    device_table.add_row("Product", "NeuroLink Mini v1.0")
    device_table.add_row("Purpose", "Capture brain signals for BCI research")
    device_table.add_row("Key ICs", "ADS1299 (ADC), STM32H743 (MCU), INA333 (Amp)")
    console.print(device_table)

    section("Project Requirements (from intake YAML)")

    req_table = Table(box=box.SIMPLE)
    req_table.add_column("Requirement", style="cyan")
    req_table.add_column("Value", style="bold")
    req_table.add_row("Compliance", "IEC 60601-1, ISO 13485, FDA Class II, RoHS")
    req_table.add_row("Quality", "IPC Class 3 (highest reliability)")
    req_table.add_row("Quantity", "50 units")
    req_table.add_row("Budget", "$15,000 total")
    req_table.add_row("Lead Time", "21 days maximum")
    req_table.add_row("Brokers", "NOT allowed (authorized distributors only)")
    console.print(req_table)

    console.print()
    explain("Let's look at the BOM CSV file:")

    run_cmd(f"head -10 {BOM_FILE}")

    wait_for_user()

    # =========================================================================
    # STEP 7: Process BOM - Agent Pipeline
    # =========================================================================
    banner("Step 7: Process BOM - The Agent Pipeline")

    explain("Now we'll run the full agent pipeline on this BOM.")
    detail("This is the core functionality - AI agents review each part.")
    console.print()

    section("The Agent Pipeline")

    pipeline = """
  ┌──────────┐   ┌──────────┐   ┌─────────────┐
  │  INTAKE  │ → │  ENRICH  │ → │MARKET INTEL │
  │Parse BOM │   │Get Offers│   │   (Apify)   │
  └──────────┘   └──────────┘   └──────┬──────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                ▼                      ▼                      ▼
        ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
        │ ENGINEERING │        │  SOURCING   │        │   FINANCE   │
        │   REVIEW    │        │   REVIEW    │        │   REVIEW    │
        │   (LLM)     │        │   (LLM)     │        │   (LLM)     │
        └─────────────┘        └─────────────┘        └─────────────┘
                └──────────────────────┼──────────────────────┘
                                       │
                                       ▼                  ⚡ PARALLEL
                              ┌────────────────┐
                              │ FINAL DECISION │          ⚖️ Aggregates
                              │     (LLM)      │          all inputs
                              └───────┬────────┘
                                      │
                                      ▼
                              ┌────────────────┐
                              │    COMPLETE    │          ✅
                              └────────────────┘
"""
    console.print(pipeline)

    console.print("[cyan]Agent Roles:[/cyan]")
    console.print("  🔧 [bold cyan]EngineeringAgent[/]  Technical compliance, lifecycle status, preferred manufacturers")
    console.print("  📦 [bold green]SourcingAgent[/]     Supplier trust, lead times, stock availability, market intel")
    console.print("  💰 [bold yellow]FinanceAgent[/]      Budget constraints, price breaks, cost optimization")
    console.print("  ⚖️  [bold magenta]FinalDecisionAgent[/] Synthesizes all inputs, selects supplier, final approval")
    console.print()

    explain("LLM calls happen at: Parallel Review (3 agents) + Final Decision (1 agent)")

    wait_for_user()

    console.print()
    section("Running Agent Pipeline")
    console.print()

    # Use spinner for the LLM-heavy processing step
    _, elapsed = run_cmd_with_spinner(
        f"uv run sourcing process {BOM_FILE} --intake {INTAKE_FILE}",
        "[bold cyan]Processing BOM with AI agents...[/] Engineering, Sourcing, Finance running in parallel",
    )

    console.print()
    console.print(f"[green]✓ Processing completed in {elapsed:.1f}s[/green]")

    wait_for_user()

    # =========================================================================
    # STEP 8: View Results
    # =========================================================================
    banner("Step 8: View Project Results")

    explain("The project is now stored in the database. Let's view the results.")
    console.print()

    run_cmd("uv run sourcing status")

    # Get latest project ID
    project_id = None
    try:
        resp = httpx.get("http://localhost:8000/projects")
        projects = resp.json()
        if projects:
            project_id = projects[-1]["project_id"]
            console.print()
            explain(f"Let's get detailed status for project: [bold]{project_id}[/bold]")
            console.print()
            run_cmd(f"uv run sourcing status {project_id}")
    except Exception:
        pass

    wait_for_user()

    # =========================================================================
    # STEP 9: Agent Reasoning Trace
    # =========================================================================
    banner("Step 9: Agent Reasoning Trace")

    explain("Every agent decision is logged with full reasoning.")
    detail("This provides an audit trail and helps understand why parts were approved/rejected.")
    console.print()

    if project_id:
        console.print("[dim]Showing first 80 lines of trace...[/dim]")
        console.print()
        run_cmd(f"uv run sourcing trace {project_id} | head -80")
    else:
        console.print("[dim]No project found - skipping trace view[/dim]")

    wait_for_user()

    # =========================================================================
    # STEP 10: Modify Knowledge Base
    # =========================================================================
    banner("Step 10: Modify Knowledge Base")

    explain("Knowledge base changes persist and affect future processing.")
    detail("Let's simulate discovering a quality issue with a capacitor.")
    console.print()

    section("Scenario: Quality Issue Discovered")
    console.print("  We received a batch of GRM188R71H104KA93D capacitors with")
    console.print("  delamination issues. We need to:")
    console.print("    1. Ban the problematic part")
    console.print("    2. Add an approved automotive-grade alternate")
    console.print()

    explain("Banning a part:")
    run_cmd("uv run sourcing kb parts ban 'GRM188R71H104KA93D' --reason 'Delamination issues in recent batches'")

    console.print()
    explain("Adding an approved alternate:")
    run_cmd("uv run sourcing kb parts alternate 'GRM188R71H104KA93D' 'GRM188R71H104MA93D' --reason 'Automotive grade replacement'")

    console.print()
    explain("Viewing updated part knowledge:")
    run_cmd("uv run sourcing kb parts show GRM188R71H104KA93D")

    wait_for_user()

    # =========================================================================
    # STEP 11: Modify Supplier Trust
    # =========================================================================
    banner("Step 11: Modify Supplier Trust")

    explain("Supplier trust levels affect agent sourcing decisions.")
    detail("Higher trust suppliers are preferred when offers are similar.")
    console.print()

    section("Scenario: Delivery Issues")
    console.print("  Mouser has had some recent delivery delays.")
    console.print("  We'll downgrade their trust from 'high' to 'medium'.")
    console.print()

    run_cmd("uv run sourcing kb suppliers trust mouser medium --reason 'Recent delivery delays'")

    console.print()
    explain("Viewing updated supplier:")
    run_cmd("uv run sourcing kb suppliers show mouser")

    wait_for_user()

    # =========================================================================
    # SUMMARY
    # =========================================================================
    banner("🎉 Demo Complete!")

    console.print("[green]✓[/green] You've walked through the complete BOM Agent system!")
    console.print()

    section("What We Covered")
    covered = [
        "System architecture (CLI → API → Stores → Agents)",
        "x402 payment protocol for pay-per-use access",
        "Health check and API endpoints",
        "Knowledge base: suppliers and parts",
        "Multi-agent pipeline with parallel LLM execution",
        "Market intelligence gathering via web scraping",
        "Final Decision agent aggregating all inputs",
        "Agent reasoning and audit trace",
        "Modifying knowledge (ban parts, add alternates)",
        "Supplier trust management",
    ]
    for item in covered:
        console.print(f"  [green]✓[/green] {item}")

    console.print()
    section("Try Next")
    console.print("  [cyan]Interactive Chat:[/cyan]")
    console.print("    uv run sourcing chat")
    console.print()
    console.print("  [cyan]Re-process with Updated Knowledge:[/cyan]")
    console.print(f"    uv run sourcing process {BOM_FILE} --intake {INTAKE_FILE}")
    console.print("    (The banned capacitor should now trigger different behavior)")
    console.print()
    console.print("  [cyan]Enable x402 Payments:[/cyan]")
    console.print("    Set AUTH_X402_ENABLED=true and AUTH_X402_PAY_TO_ADDRESS")
    console.print()

    console.print("[blue]Thanks for walking through the demo![/blue]")
    console.print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[dim]Demo interrupted.[/dim]")
        sys.exit(0)

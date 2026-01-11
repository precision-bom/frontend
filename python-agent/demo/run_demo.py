#!/usr/bin/env python3
"""NeuroLink Mini - BOM Agent Interactive Demo

A step-by-step walkthrough of the multi-agent BOM processing system.
Run with: uv run python demo/run_demo.py
"""

import subprocess
import sys
import time
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.markdown import Markdown
from rich import box

console = Console()

# Demo files
DEMO_DIR = Path(__file__).parent
BOM_FILE = DEMO_DIR / "neurolink_bom.csv"
INTAKE_FILE = DEMO_DIR / "neurolink_intake.yaml"


def run_cmd(cmd: str, capture: bool = False, show_cmd: bool = True) -> str:
    """Run a CLI command and optionally capture output."""
    if show_cmd:
        console.print(f"\n[green]$[/green] [white]{cmd}[/white]\n")

    if capture:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.stdout + result.stderr
    else:
        subprocess.run(cmd, shell=True)
        return ""


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
        f"[bold white]{title}[/bold white]",
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
    import httpx
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

    console.print("[white]Welcome to the BOM Agent Service demonstration![/white]")
    console.print()
    console.print("This demo walks through a multi-agent system for processing Bills of Materials.")
    console.print("We'll be sourcing components for a [bold]portable brain-computer interface[/bold] device.")
    console.print()

    console.print("[cyan]What you'll see:[/cyan]")
    console.print("  1. How the CLI interacts with the FastAPI backend")
    console.print("  2. Three AI agents reviewing parts in PARALLEL")
    console.print("  3. Final Decision agent aggregating all inputs")
    console.print("  4. Knowledge base management for parts and suppliers")
    console.print("  5. Full audit trail with agent reasoning")
    console.print()

    console.print("[yellow]Prerequisites:[/yellow]")
    console.print("  • API server running: [white]uv run sourcing-server[/white]")
    console.print("  • OPENAI_API_KEY environment variable set")
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
│   /projects  /knowledge  /v1/chat/completions  /health          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
  │ ProjectStore  │ │ OffersStore   │ │OrgKnowledge   │
  │   (SQLite)    │ │  (in-memory)  │ │   Store       │
  └───────────────┘ └───────────────┘ └───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CrewAI Flow Engine                           │
│   [Engineering | Sourcing | Finance] → FinalDecisionAgent       │
│         (parallel)                    (aggregates all)          │
└─────────────────────────────────────────────────────────────────┘
"""
    console.print(arch_diagram)

    explain("Each CLI command makes HTTP requests to the FastAPI server.")
    detail("The server orchestrates data stores and AI agents.")

    wait_for_user()

    # =========================================================================
    # STEP 2: Health Check
    # =========================================================================
    banner("Step 2: API Health Check")

    explain("First, let's verify the API server is running.")
    detail("The CLI always checks /health before making requests.")

    run_cmd("curl -s http://localhost:8000/health | python3 -m json.tool")

    console.print()
    explain("The API also exposes a root endpoint showing available routes:")

    run_cmd("curl -s http://localhost:8000/ | python3 -m json.tool")

    wait_for_user()

    # =========================================================================
    # STEP 3: Knowledge Base - Suppliers
    # =========================================================================
    banner("Step 3: Knowledge Base - Suppliers")

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
    # STEP 4: Knowledge Base - Parts
    # =========================================================================
    banner("Step 4: Knowledge Base - Parts")

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
    # STEP 5: The Project - NeuroLink Mini
    # =========================================================================
    banner("Step 5: The Project - NeuroLink Mini")

    explain("We're sourcing parts for a portable brain-computer interface device.")
    detail("This is a medical-grade 8-channel neural signal acquisition unit.")
    console.print()

    section("Device Overview")

    device_table = Table(box=box.SIMPLE)
    device_table.add_column("Property", style="cyan")
    device_table.add_column("Value", style="white")
    device_table.add_row("Product", "NeuroLink Mini v1.0")
    device_table.add_row("Purpose", "Capture brain signals for BCI research")
    device_table.add_row("Key ICs", "ADS1299 (ADC), STM32H743 (MCU), INA333 (Amp)")
    console.print(device_table)

    section("Project Requirements (from intake YAML)")

    req_table = Table(box=box.SIMPLE)
    req_table.add_column("Requirement", style="cyan")
    req_table.add_column("Value", style="white")
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
    # STEP 6: Process BOM - Agent Pipeline
    # =========================================================================
    banner("Step 6: Process BOM - The Agent Pipeline")

    explain("Now we'll run the full agent pipeline on this BOM.")
    detail("This is the core functionality - AI agents review each part.")
    console.print()

    section("The Agent Pipeline")

    pipeline = """
  ┌────────────┐   ┌────────────┐
  │   INTAKE   │ → │  ENRICH    │
  │ Parse BOM  │   │ Get Offers │
  └────────────┘   └────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
  ┌────────────┐   ┌────────────┐   ┌────────────┐
  │ ENGINEERING│   │  SOURCING  │   │  FINANCE   │  ⚡ PARALLEL
  │   REVIEW   │   │   REVIEW   │   │   REVIEW   │
  └────────────┘   └────────────┘   └────────────┘
         └───────────────┼───────────────┘
                         ▼
              ┌────────────────┐
              │ FINAL DECISION │  ⚖️  Aggregates all inputs
              │   (LLM call)   │
              └────────────────┘
                         │
                         ▼
              ┌────────────────┐
              │    COMPLETE    │  ✅
              └────────────────┘
"""
    console.print(pipeline)

    console.print("[cyan]Agent Roles:[/cyan]")
    console.print("  🔧 [cyan]EngineeringAgent[/cyan]: Compliance, lifecycle, preferred manufacturers")
    console.print("  📦 [green]SourcingAgent[/green]: Supplier trust, lead times, stock availability")
    console.print("  💰 [yellow]FinanceAgent[/yellow]: Budget constraints, price breaks, cost optimization")
    console.print("  ⚖️  [magenta]FinalDecisionAgent[/magenta]: Synthesizes all inputs, makes final call")
    console.print()

    explain("This will take 1-2 minutes as agents reason through each part...")
    console.print("[dim]Watch the server terminal for real-time reasoning output![/dim]")

    wait_for_user()

    console.print("[yellow]Running agent pipeline...[/yellow]")
    console.print()

    start_time = time.time()
    run_cmd(f"uv run sourcing process {BOM_FILE} --intake {INTAKE_FILE}")
    elapsed = time.time() - start_time

    console.print()
    console.print(f"[green]✓ Processing completed in {elapsed:.1f}s[/green]")

    wait_for_user()

    # =========================================================================
    # STEP 7: View Results
    # =========================================================================
    banner("Step 7: View Project Results")

    explain("The project is now stored in the database. Let's view the results.")
    console.print()

    run_cmd("uv run sourcing status")

    # Get latest project ID
    import httpx
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
        project_id = None

    wait_for_user()

    # =========================================================================
    # STEP 8: Agent Reasoning Trace
    # =========================================================================
    banner("Step 8: Agent Reasoning Trace")

    explain("Every agent decision is logged with full reasoning.")
    detail("This provides an audit trail and helps understand why parts were approved/rejected.")
    console.print()

    if project_id:
        console.print("[dim]Showing first 80 lines of trace...[/dim]")
        console.print()
        run_cmd(f"uv run sourcing trace {project_id} | head -80")

    wait_for_user()

    # =========================================================================
    # STEP 9: Modify Knowledge Base
    # =========================================================================
    banner("Step 9: Modify Knowledge Base")

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
    # STEP 10: Modify Supplier Trust
    # =========================================================================
    banner("Step 10: Modify Supplier Trust")

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
        "Health check and API endpoints",
        "Knowledge base: suppliers and parts",
        "BOM processing through parallel agent pipeline",
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

    console.print("[blue]Thanks for walking through the demo![/blue]")
    console.print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[dim]Demo interrupted.[/dim]")
        sys.exit(0)

#!/usr/bin/env python3
"""Demo entry point - runs the NeuroLink Mini BOM Agent demo."""

import subprocess
import sys
import time
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box

console = Console()

# Demo files (relative to project root)
# __file__ is src/bom_agent_service/demo.py, so .parent.parent.parent gets us to project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
DEMO_DIR = PROJECT_ROOT / "demo"
BOM_FILE = DEMO_DIR / "neurolink_bom.csv"
INTAKE_FILE = DEMO_DIR / "neurolink_intake.yaml"


def run_cmd(cmd: str, capture: bool = False, show_cmd: bool = True) -> str:
    """Run a CLI command and optionally capture output."""
    if show_cmd:
        console.print(f"\n[dark_green]$[/dark_green] [bold]{cmd}[/bold]\n")

    if capture:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.stdout + result.stderr
    else:
        subprocess.run(cmd, shell=True)
        return ""


def wait_for_user():
    """Wait for user to press Enter."""
    console.print()
    console.print("[dark_orange]━" * 70 + "[/dark_orange]")
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
    console.print(Panel(title, border_style="dark_cyan", box=box.ROUNDED))
    console.print()


def explain(text: str):
    """Display an explanation."""
    console.print(f"[dark_orange]📖 {text}[/dark_orange]")


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

    console.print("Welcome to the BOM Agent Service demonstration!")
    console.print()
    console.print("This demo walks through a multi-agent system for processing Bills of Materials.")
    console.print("We'll be sourcing components for a [bold]portable brain-computer interface[/bold] device.")
    console.print()

    console.print("[dark_cyan]What you'll see:[/dark_cyan]")
    console.print("  1. How the CLI interacts with the FastAPI backend")
    console.print("  2. Three AI agents reviewing parts in PARALLEL")
    console.print("  3. Final Decision agent aggregating all inputs")
    console.print("  4. Knowledge base management for parts and suppliers")
    console.print("  5. Full audit trail with agent reasoning")
    console.print()

    console.print("[dark_orange]Prerequisites:[/dark_orange]")
    console.print("  • API server running: [bold]uv run sourcing-server[/bold]")
    console.print("  • OPENAI_API_KEY environment variable set")
    console.print()

    # Check server
    if not check_server():
        console.print("[red]❌ API server not running![/red]")
        console.print("[dim]Start it with: uv run sourcing-server[/dim]")
        sys.exit(1)
    else:
        console.print("[dark_green]✓ API server is running[/dark_green]")

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

    wait_for_user()

    # =========================================================================
    # STEP 2: Knowledge Base
    # =========================================================================
    banner("Step 2: Knowledge Base")

    explain("The system maintains organizational knowledge about suppliers and parts.")
    console.print()

    run_cmd("uv run sourcing kb suppliers list")
    console.print()
    run_cmd("uv run sourcing kb parts list")

    wait_for_user()

    # =========================================================================
    # STEP 3: The Project
    # =========================================================================
    banner("Step 3: The Project - NeuroLink Mini")

    explain("We're sourcing parts for a portable brain-computer interface device.")
    console.print()

    section("Project Requirements")

    req_table = Table(box=box.SIMPLE)
    req_table.add_column("Requirement", style="dark_cyan")
    req_table.add_column("Value", style="default")
    req_table.add_row("Compliance", "IEC 60601-1, ISO 13485, FDA Class II, RoHS")
    req_table.add_row("Quality", "IPC Class 3 (highest reliability)")
    req_table.add_row("Quantity", "50 units")
    req_table.add_row("Budget", "$15,000 total")
    req_table.add_row("Lead Time", "21 days maximum")
    req_table.add_row("Brokers", "NOT allowed")
    console.print(req_table)

    console.print()
    explain("BOM has 20 components including:")
    detail("• ADS1299 - 8-channel 24-bit neural ADC")
    detail("• STM32H743 - ARM Cortex-M7 480MHz MCU")
    detail("• INA333 - Instrumentation amplifier")

    wait_for_user()

    # =========================================================================
    # STEP 4: Process BOM
    # =========================================================================
    banner("Step 4: Process BOM - Agent Pipeline")

    section("The Agent Pipeline")

    pipeline = """
  ┌────────────┐   ┌────────────┐
  │   INTAKE   │ → │  ENRICH    │
  └────────────┘   └────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
  ┌────────────┐   ┌────────────┐   ┌────────────┐
  │ ENGINEERING│   │  SOURCING  │   │  FINANCE   │  ⚡ PARALLEL
  └────────────┘   └────────────┘   └────────────┘
         └───────────────┼───────────────┘
                         ▼
              ┌────────────────┐
              │ FINAL DECISION │  ⚖️
              └────────────────┘
"""
    console.print(pipeline)

    console.print("[dark_cyan]Agent Roles:[/dark_cyan]")
    console.print("  🔧 [dark_cyan]EngineeringAgent[/dark_cyan]: Compliance, lifecycle, preferred manufacturers")
    console.print("  📦 [dark_green]SourcingAgent[/dark_green]: Supplier trust, lead times, stock")
    console.print("  💰 [dark_orange]FinanceAgent[/dark_orange]: Budget constraints, price optimization")
    console.print("  ⚖️  [dark_magenta]FinalDecisionAgent[/dark_magenta]: Synthesizes all inputs")
    console.print()

    explain("With --watch, you'll see each agent's reasoning as it happens!")

    wait_for_user()

    console.print("[dark_orange]Running agent pipeline with live progress...[/dark_orange]")
    console.print()
    start_time = time.time()
    run_cmd(f"uv run sourcing process {BOM_FILE} --intake {INTAKE_FILE} --watch")
    elapsed = time.time() - start_time
    console.print(f"\n[dark_green]✓ Completed in {elapsed:.1f}s[/dark_green]")

    wait_for_user()

    # =========================================================================
    # STEP 5: View Results
    # =========================================================================
    banner("Step 5: View Results")

    run_cmd("uv run sourcing status")

    # Get latest project
    import httpx
    try:
        resp = httpx.get("http://localhost:8000/projects")
        projects = resp.json()
        if projects:
            project_id = projects[-1]["project_id"]
            console.print()
            run_cmd(f"uv run sourcing trace {project_id} | head -60")
    except Exception:
        pass

    wait_for_user()

    # =========================================================================
    # SUMMARY
    # =========================================================================
    banner("🎉 Demo Complete!")

    console.print("[dark_green]✓[/dark_green] Multi-agent BOM processing system demonstrated!")
    console.print()
    console.print("[dark_cyan]Try next:[/dark_cyan]")
    console.print("  • uv run sourcing chat - Interactive chat mode")
    console.print("  • uv run sourcing kb parts ban <MPN> - Ban a part")
    console.print("  • Re-run with different intake requirements")
    console.print()
    console.print("[blue]Thanks for walking through the demo![/blue]")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[dim]Demo interrupted.[/dim]")
        sys.exit(0)

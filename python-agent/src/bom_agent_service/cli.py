#!/usr/bin/env python3
"""CLI tool for BOM Agent Service - uses API endpoints."""

import os
import sys
import time
from pathlib import Path

import click
import httpx
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
from rich.text import Text
from rich.live import Live
from rich import box

console = Console()
DEFAULT_API_URL = "http://localhost:8000"
DEFAULT_API_KEY = os.environ.get("SERVICE_API_KEY", "")

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


class APIClient:
    """HTTP client for BOM Agent Service API."""

    def __init__(self, base_url: str = DEFAULT_API_URL, api_key: str = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or DEFAULT_API_KEY
        headers = {}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        self.client = httpx.Client(timeout=300.0, headers=headers)  # Long timeout for processing

    def health_check(self) -> bool:
        """Check if API is healthy."""
        try:
            resp = self.client.get(f"{self.base_url}/health")
            return resp.status_code == 200
        except Exception:
            return False

    # Projects API
    def list_projects(self) -> list[dict]:
        resp = self.client.get(f"{self.base_url}/projects")
        resp.raise_for_status()
        return resp.json()

    def get_project(self, project_id: str) -> dict:
        resp = self.client.get(f"{self.base_url}/projects/{project_id}")
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json()

    def get_trace(self, project_id: str) -> list[dict]:
        resp = self.client.get(f"{self.base_url}/projects/{project_id}/trace")
        resp.raise_for_status()
        return resp.json()

    def upload_and_process(self, bom_path: str, intake_path: str = None) -> dict:
        files = {"bom_file": open(bom_path, "rb")}
        if intake_path:
            files["intake_file"] = open(intake_path, "rb")

        try:
            resp = self.client.post(
                f"{self.base_url}/projects/upload-and-process",
                files=files,
            )
            resp.raise_for_status()
            return resp.json()
        finally:
            for f in files.values():
                f.close()

    # Knowledge API - Parts
    def list_parts(self) -> list[dict]:
        resp = self.client.get(f"{self.base_url}/knowledge/parts")
        resp.raise_for_status()
        return resp.json()

    def get_part(self, mpn: str) -> dict:
        resp = self.client.get(f"{self.base_url}/knowledge/parts/{mpn}")
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json()

    def ban_part(self, mpn: str, reason: str) -> dict:
        resp = self.client.post(
            f"{self.base_url}/knowledge/parts/{mpn}/ban",
            json={"reason": reason, "user": "cli"},
        )
        resp.raise_for_status()
        return resp.json()

    def unban_part(self, mpn: str) -> dict:
        resp = self.client.post(
            f"{self.base_url}/knowledge/parts/{mpn}/unban",
            params={"user": "cli"},
        )
        resp.raise_for_status()
        return resp.json()

    def add_alternate(self, mpn: str, alt_mpn: str, reason: str) -> dict:
        resp = self.client.post(
            f"{self.base_url}/knowledge/parts/{mpn}/alternates",
            json={"alternate_mpn": alt_mpn, "reason": reason, "user": "cli"},
        )
        resp.raise_for_status()
        return resp.json()

    def get_alternates(self, mpn: str) -> list[str]:
        resp = self.client.get(f"{self.base_url}/knowledge/parts/{mpn}/alternates")
        resp.raise_for_status()
        return resp.json()

    # Knowledge API - Suppliers
    def list_suppliers(self) -> list[dict]:
        resp = self.client.get(f"{self.base_url}/knowledge/suppliers")
        resp.raise_for_status()
        return resp.json()

    def get_supplier(self, supplier_id: str) -> dict:
        resp = self.client.get(f"{self.base_url}/knowledge/suppliers/{supplier_id}")
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.json()

    def set_supplier_trust(self, supplier_id: str, level: str, reason: str) -> dict:
        resp = self.client.post(
            f"{self.base_url}/knowledge/suppliers/{supplier_id}/trust",
            json={"trust_level": level, "reason": reason, "user": "cli"},
        )
        resp.raise_for_status()
        return resp.json()


def get_client(url: str, api_key: str = None) -> APIClient:
    """Get API client, checking health first."""
    client = APIClient(url, api_key=api_key)
    if not client.health_check():
        console.print(f"[red]API not available at {url}[/]")
        console.print("[dim]Start the service with: uv run uvicorn bom_agent_service.main:app --reload[/]")
        sys.exit(1)
    return client


def format_trace_step(step: dict, show_reasoning: bool = True, duration_ms: int = None) -> Text:
    """Format a trace step for rich output."""
    text = Text()
    timestamp = step.get("timestamp", "")[:19].replace("T", " ")
    icon = STEP_ICONS.get(step.get("step"), "•")
    agent = step.get("agent")

    # Build the header line
    text.append(f"{timestamp} ", style="dim")
    text.append(f"{icon} ", style="bold")
    text.append(f"[{step.get('step')}] ", style="bold blue")

    if agent:
        agent_color = AGENT_COLORS.get(agent, "default")
        text.append(f"[{agent}] ", style=f"bold {agent_color}")

    text.append(step.get("message", ""), style="default")

    # Add duration if provided
    if duration_ms is not None and duration_ms > 0:
        if duration_ms >= 1000:
            text.append(f" ({duration_ms/1000:.1f}s)", style="dim")
        else:
            text.append(f" ({duration_ms}ms)", style="dim")

    # Add reasoning on next line if present
    if show_reasoning and step.get("reasoning"):
        text.append("\n         └─ ", style="dim")
        text.append(step.get("reasoning"), style="italic dark_cyan")

    return text


def print_trace_step(step: dict, show_reasoning: bool = True, duration_ms: int = None):
    """Print a single trace step."""
    console.print(format_trace_step(step, show_reasoning, duration_ms))


def calculate_step_durations(trace_data: list[dict]) -> list[int]:
    """Calculate duration in ms for each step based on timestamps."""
    from datetime import datetime

    durations = []
    for i, step in enumerate(trace_data):
        if i == 0:
            durations.append(0)
        else:
            try:
                prev_ts = trace_data[i-1].get("timestamp", "")
                curr_ts = step.get("timestamp", "")
                # Parse ISO format timestamps
                prev_dt = datetime.fromisoformat(prev_ts.replace("Z", "+00:00"))
                curr_dt = datetime.fromisoformat(curr_ts.replace("Z", "+00:00"))
                duration_ms = int((curr_dt - prev_dt).total_seconds() * 1000)
                durations.append(max(0, duration_ms))
            except (ValueError, TypeError):
                durations.append(0)
    return durations


@click.group()
@click.option("--api-url", envvar="BOM_API_URL", default=DEFAULT_API_URL, help="API base URL")
@click.option("--api-key", envvar="SERVICE_API_KEY", default=DEFAULT_API_KEY, help="API key for authentication")
@click.version_option(version="0.1.0")
@click.pass_context
def main(ctx, api_url: str, api_key: str):
    """BOM Agent Service CLI - Process BOMs through multi-agent review."""
    ctx.ensure_object(dict)
    ctx.obj["api_url"] = api_url
    ctx.obj["api_key"] = api_key


# =============================================================================
# Process Command
# =============================================================================

@main.command()
@click.argument("bom", type=click.Path(exists=True))
@click.option("--intake", "-i", type=click.Path(exists=True), help="Project intake YAML file")
@click.option("--watch", "-w", is_flag=True, help="Watch progress in real-time (requires second terminal)")
@click.option("--verbose", "-v", is_flag=True, help="Show detailed output")
@click.pass_context
def process(ctx, bom: str, intake: str | None, watch: bool, verbose: bool):
    """Process a BOM through the full agent flow.

    BOM is the path to a CSV file containing the bill of materials.

    Use --watch to see step-by-step progress. This runs the API call in
    the background and polls for updates.
    """
    console.print(Panel.fit(
        "[bold dark_cyan]BOM Processing Flow[/]",
        border_style="dark_cyan",
    ))

    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))

    console.print(f"\n[bold]BOM:[/] {bom}")
    if intake:
        console.print(f"[bold]Intake:[/] {intake}")
    console.print()

    if watch:
        # Run with watching - use threading to poll while processing
        import threading
        import queue

        result_queue = queue.Queue()

        # Get existing project state to detect changes
        existing_projects = {p["project_id"]: p["updated_at"] for p in client.list_projects()}

        def do_process():
            try:
                result = client.upload_and_process(bom, intake)
                result_queue.put(("success", result))
            except Exception as e:
                result_queue.put(("error", str(e)))

        # Start processing in background thread
        thread = threading.Thread(target=do_process)
        thread.start()

        console.print("[dim]Processing started, watching for updates...[/dim]")
        console.print()

        # Poll for new or updated project
        project_id = None
        max_wait = 30
        waited = 0
        while project_id is None and waited < max_wait and thread.is_alive():
            projects = client.list_projects()
            for p in projects:
                # Check for completely new project
                if p["project_id"] not in existing_projects:
                    project_id = p["project_id"]
                    break
                # Check if an existing project is being re-processed (updated timestamp changed)
                if p["updated_at"] != existing_projects.get(p["project_id"]):
                    project_id = p["project_id"]
                    break
                # Check if an existing project is currently processing
                if p["status"] not in ("complete", "failed"):
                    project_id = p["project_id"]
                    break
            time.sleep(0.2)
            waited += 0.2

        if project_id:
            console.print(f"[dim]Watching project: {project_id}[/dim]")
            console.print()

            # Watch the project with timing and spinner
            seen_steps = 0
            last_timestamp = None
            spinner_chars = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
            spinner_idx = 0
            last_step_time = time.time()

            while thread.is_alive():
                try:
                    trace_data = client.get_trace(project_id)
                    if len(trace_data) > seen_steps:
                        # Clear spinner line if we were showing one
                        console.print("\r" + " " * 60 + "\r", end="")

                        for step in trace_data[seen_steps:]:
                            duration_ms = None
                            if last_timestamp:
                                try:
                                    from datetime import datetime
                                    curr_ts = step.get("timestamp", "")
                                    prev_dt = datetime.fromisoformat(last_timestamp.replace("Z", "+00:00"))
                                    curr_dt = datetime.fromisoformat(curr_ts.replace("Z", "+00:00"))
                                    duration_ms = int((curr_dt - prev_dt).total_seconds() * 1000)
                                    if duration_ms < 0:
                                        duration_ms = 0
                                except (ValueError, TypeError):
                                    pass
                            print_trace_step(step, show_reasoning=True, duration_ms=duration_ms)
                            last_timestamp = step.get("timestamp")
                        seen_steps = len(trace_data)
                        last_step_time = time.time()
                    else:
                        # Show spinner while waiting for LLM
                        elapsed = time.time() - last_step_time
                        if elapsed > 1.0:  # Only show after 1 second of waiting
                            spinner = spinner_chars[spinner_idx % len(spinner_chars)]
                            console.print(f"\r[dim]{spinner} Waiting for LLM response... ({elapsed:.0f}s)[/dim]", end="")
                            spinner_idx += 1
                except Exception:
                    pass
                time.sleep(0.2)

            # Clear spinner line
            console.print("\r" + " " * 60 + "\r", end="")

            # Get any remaining trace entries after thread completes
            try:
                trace_data = client.get_trace(project_id)
                for step in trace_data[seen_steps:]:
                    duration_ms = None
                    if last_timestamp:
                        try:
                            from datetime import datetime
                            curr_ts = step.get("timestamp", "")
                            prev_dt = datetime.fromisoformat(last_timestamp.replace("Z", "+00:00"))
                            curr_dt = datetime.fromisoformat(curr_ts.replace("Z", "+00:00"))
                            duration_ms = int((curr_dt - prev_dt).total_seconds() * 1000)
                            if duration_ms < 0:
                                duration_ms = 0
                        except (ValueError, TypeError):
                            pass
                    print_trace_step(step, show_reasoning=True, duration_ms=duration_ms)
                    last_timestamp = step.get("timestamp")
            except Exception:
                pass

        # Get the result
        thread.join()
        status, result = result_queue.get()

        if status == "error":
            console.print(f"\n[red]Error: {result}[/]")
            sys.exit(1)

    else:
        # Standard processing with spinner
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            progress.add_task("[dark_cyan]Processing BOM (this may take a while)...", total=None)

            try:
                result = client.upload_and_process(bom, intake)
            except httpx.HTTPStatusError as e:
                console.print(f"\n[red]Error: {e.response.text}[/]")
                sys.exit(1)
            except Exception as e:
                console.print(f"\n[red]Error: {e}[/]")
                sys.exit(1)

    # Display results
    console.print()
    console.print(Panel.fit(
        f"[bold dark_green]Project Complete[/]\n"
        f"ID: {result['project_id']}\n"
        f"Status: {result['status']}\n"
        f"Message: {result['message']}",
        border_style="dark_green",
    ))

    # Fetch full project details
    project = client.get_project(result["project_id"])
    if project:
        table = Table(title="Line Item Summary", box=box.ROUNDED)
        table.add_column("MPN", style="dark_cyan")
        table.add_column("Qty", justify="right")
        table.add_column("Status", style="dark_orange")

        for item in project.get("line_items", []):
            table.add_row(
                item.get("mpn", "-"),
                str(item.get("quantity", 0)),
                item.get("status", "-"),
            )

        console.print(table)


# =============================================================================
# Status Command
# =============================================================================

@main.command()
@click.argument("project_id", required=False)
@click.pass_context
def status(ctx, project_id: str | None):
    """Show project status.

    If PROJECT_ID is omitted, lists all projects.
    """
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))

    if project_id:
        project = client.get_project(project_id)
        if not project:
            console.print(f"[red]Project not found: {project_id}[/]")
            sys.exit(1)

        ctx_data = project.get("context", {})
        console.print(Panel.fit(
            f"[bold]Project:[/] {project['project_id']}\n"
            f"[bold]Name:[/] {ctx_data.get('project_name') or 'N/A'}\n"
            f"[bold]Status:[/] {project['status']}\n"
            f"[bold]Created:[/] {project['created_at']}\n"
            f"[bold]Items:[/] {len(project.get('line_items', []))}",
            title="Project Details",
            border_style="cyan",
        ))

        table = Table(title="Line Items", box=box.ROUNDED)
        table.add_column("MPN", style="cyan")
        table.add_column("Manufacturer")
        table.add_column("Qty", justify="right")
        table.add_column("Status", style="yellow")

        for item in project.get("line_items", []):
            table.add_row(
                item.get("mpn", "-"),
                item.get("manufacturer") or "-",
                str(item.get("quantity", 0)),
                item.get("status", "-"),
            )

        console.print(table)
    else:
        projects = client.list_projects()
        if not projects:
            console.print("[dim]No projects found.[/]")
            return

        table = Table(title="Projects", box=box.ROUNDED)
        table.add_column("Project ID", style="cyan")
        table.add_column("Name")
        table.add_column("Status", style="yellow")
        table.add_column("Items", justify="right")
        table.add_column("Created")

        for p in projects:
            table.add_row(
                p["project_id"],
                p.get("project_name") or "-",
                p["status"],
                str(p["line_item_count"]),
                p["created_at"][:19],
            )

        console.print(table)


# =============================================================================
# Trace Command
# =============================================================================

@main.command()
@click.argument("project_id")
@click.option("--no-reasoning", is_flag=True, help="Hide agent reasoning")
@click.option("--no-timing", is_flag=True, help="Hide step timing")
@click.pass_context
def trace(ctx, project_id: str, no_reasoning: bool, no_timing: bool):
    """Show project execution trace with agent reasoning and timing."""
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))

    try:
        trace_data = client.get_trace(project_id)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            console.print(f"[red]Project not found: {project_id}[/]")
        else:
            console.print(f"[red]Error: {e.response.text}[/]")
        sys.exit(1)

    console.print(Panel.fit(
        f"[bold]Execution Trace[/] for {project_id}",
        border_style="dark_cyan",
    ))

    if not trace_data:
        console.print("[dim]No trace entries.[/]")
        return

    # Calculate durations between steps
    durations = calculate_step_durations(trace_data) if not no_timing else [0] * len(trace_data)

    for step, duration in zip(trace_data, durations):
        print_trace_step(step, show_reasoning=not no_reasoning, duration_ms=duration if not no_timing else None)


# =============================================================================
# Watch Command
# =============================================================================

@main.command()
@click.argument("project_id")
@click.option("--interval", "-i", default=1.0, help="Polling interval in seconds")
@click.pass_context
def watch(ctx, project_id: str, interval: float):
    """Watch project progress in real-time.

    Polls the API and displays new trace entries as they appear.
    Use Ctrl+C to stop watching.
    """
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))

    # Check project exists
    project = client.get_project(project_id)
    if not project:
        console.print(f"[red]Project not found: {project_id}[/]")
        sys.exit(1)

    console.print(Panel.fit(
        f"[bold]Watching[/] {project_id}\n[dim]Press Ctrl+C to stop[/]",
        border_style="dark_cyan",
    ))

    seen_steps = 0
    last_status = None
    last_timestamp = None

    try:
        while True:
            # Get current trace
            try:
                trace_data = client.get_trace(project_id)
                project = client.get_project(project_id)
            except Exception as e:
                console.print(f"[red]Error polling: {e}[/]")
                time.sleep(interval)
                continue

            current_status = project.get("status") if project else None

            # Print new steps with timing
            if len(trace_data) > seen_steps:
                for step in trace_data[seen_steps:]:
                    duration_ms = None
                    if last_timestamp:
                        try:
                            from datetime import datetime
                            curr_ts = step.get("timestamp", "")
                            prev_dt = datetime.fromisoformat(last_timestamp.replace("Z", "+00:00"))
                            curr_dt = datetime.fromisoformat(curr_ts.replace("Z", "+00:00"))
                            duration_ms = int((curr_dt - prev_dt).total_seconds() * 1000)
                            if duration_ms < 0:
                                duration_ms = 0
                        except (ValueError, TypeError):
                            pass
                    print_trace_step(step, show_reasoning=True, duration_ms=duration_ms)
                    last_timestamp = step.get("timestamp")
                seen_steps = len(trace_data)

            # Check if processing is complete
            if current_status != last_status:
                last_status = current_status
                if current_status in ("complete", "failed"):
                    console.print()
                    if current_status == "complete":
                        console.print("[dark_green]✓ Processing complete[/dark_green]")
                    else:
                        console.print("[red]✗ Processing failed[/red]")
                    break

            time.sleep(interval)

    except KeyboardInterrupt:
        console.print("\n[dim]Stopped watching.[/dim]")


# =============================================================================
# Knowledge Base Commands
# =============================================================================

@main.group()
def kb():
    """Knowledge base management."""
    pass


@kb.command("seed")
def kb_seed():
    """Seed knowledge base with demo data for NeuroLink Mini project."""
    from .seed_demo_data import seed_demo_data
    from .stores import OrgKnowledgeStore

    console.print("[bold]Seeding knowledge base with demo data...[/bold]")
    store = OrgKnowledgeStore()
    stats = seed_demo_data(store)

    console.print(f"\n[green]Seeded {stats['suppliers']} suppliers and {stats['parts']} parts[/green]")

    # Show summary
    console.print("\n[bold]Suppliers:[/bold]")
    for s in store.list_suppliers():
        console.print(f"  [cyan]{s.name}[/cyan] ({s.supplier_id}): {s.trust_level.value} trust, {len(s.notes)} notes")

    console.print("\n[bold]Parts:[/bold]")
    for p in store.list_parts():
        status = "[red]BANNED[/red]" if p.banned else ("[green]preferred[/green]" if p.preferred else "")
        console.print(f"  [cyan]{p.mpn}[/cyan]: {status} used {p.times_used}x, {len(p.notes)} notes")


# -----------------------------------------------------------------------------
# KB Parts
# -----------------------------------------------------------------------------

@kb.group()
def parts():
    """Manage parts knowledge."""
    pass


@parts.command("list")
@click.pass_context
def parts_list(ctx):
    """List all parts in knowledge base."""
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))
    parts_data = client.list_parts()

    if not parts_data:
        console.print("[dim]No parts in knowledge base.[/]")
        return

    table = Table(title="Parts Knowledge", box=box.ROUNDED)
    table.add_column("MPN", style="cyan")
    table.add_column("Times Used", justify="right")
    table.add_column("Failures", justify="right", style="red")
    table.add_column("Banned?", style="yellow")
    table.add_column("Notes")

    for part in parts_data:
        banned = "Yes" if part.get("banned") else "No"
        notes = part.get("notes", [])
        notes_str = "; ".join(notes) if notes else "-"
        notes_str = notes_str[:30] + "..." if len(notes_str) > 30 else notes_str
        table.add_row(
            part["mpn"],
            str(part.get("times_used", 0)),
            str(part.get("failure_count", 0)),
            banned,
            notes_str,
        )

    console.print(table)


@parts.command("show")
@click.argument("mpn")
@click.pass_context
def parts_show(ctx, mpn: str):
    """Show details for a specific part."""
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))
    part = client.get_part(mpn)

    if not part:
        console.print(f"[dim]No knowledge for MPN: {mpn}[/]")
        return

    notes = part.get("notes", [])
    notes_str = "; ".join(notes) if notes else "None"
    console.print(Panel.fit(
        f"[bold]MPN:[/] {part['mpn']}\n"
        f"[bold]Times Used:[/] {part.get('times_used', 0)}\n"
        f"[bold]Failures:[/] {part.get('failure_count', 0)}\n"
        f"[bold]Banned:[/] {'Yes - ' + part.get('ban_reason', '') if part.get('banned') else 'No'}\n"
        f"[bold]Notes:[/] {notes_str}",
        title="Part Knowledge",
        border_style="cyan",
    ))

    alternates = client.get_alternates(mpn)
    if alternates:
        console.print(f"\n[bold]Approved Alternates:[/] {', '.join(alternates)}")


@parts.command("ban")
@click.argument("mpn")
@click.option("--reason", "-r", required=True, help="Reason for banning")
@click.pass_context
def parts_ban(ctx, mpn: str, reason: str):
    """Ban a part from use."""
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))
    client.ban_part(mpn, reason)
    console.print(f"[green]Banned part: {mpn}[/]")


@parts.command("unban")
@click.argument("mpn")
@click.pass_context
def parts_unban(ctx, mpn: str):
    """Remove ban from a part."""
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))
    client.unban_part(mpn)
    console.print(f"[green]Unbanned part: {mpn}[/]")


@parts.command("alternate")
@click.argument("mpn")
@click.argument("alt_mpn")
@click.option("--reason", "-r", default="Added via CLI", help="Reason for adding alternate")
@click.pass_context
def parts_alternate(ctx, mpn: str, alt_mpn: str, reason: str):
    """Add an approved alternate for a part."""
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))
    client.add_alternate(mpn, alt_mpn, reason)
    console.print(f"[green]Added alternate {alt_mpn} for {mpn}[/]")


# -----------------------------------------------------------------------------
# KB Suppliers
# -----------------------------------------------------------------------------

@kb.group()
def suppliers():
    """Manage supplier knowledge."""
    pass


@suppliers.command("list")
@click.pass_context
def suppliers_list(ctx):
    """List all suppliers in knowledge base."""
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))
    suppliers_data = client.list_suppliers()

    if not suppliers_data:
        console.print("[dim]No suppliers in knowledge base.[/]")
        return

    table = Table(title="Supplier Knowledge", box=box.ROUNDED)
    table.add_column("ID", style="cyan")
    table.add_column("Name")
    table.add_column("Trust", style="yellow")
    table.add_column("On-Time", justify="right", style="green")
    table.add_column("Quality", justify="right", style="blue")
    table.add_column("Orders", justify="right")

    for s in suppliers_data:
        table.add_row(
            s["supplier_id"],
            s["name"],
            s["trust_level"],
            f"{s['on_time_rate']:.0%}",
            f"{s['quality_rate']:.0%}",
            str(s.get("order_count_ytd", 0)),
        )

    console.print(table)


@suppliers.command("show")
@click.argument("supplier_id")
@click.pass_context
def suppliers_show(ctx, supplier_id: str):
    """Show details for a specific supplier."""
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))
    supplier = client.get_supplier(supplier_id)

    if not supplier:
        console.print(f"[dim]No knowledge for supplier: {supplier_id}[/]")
        return

    notes = supplier.get("notes", [])
    notes_str = "; ".join(notes) if notes else "None"
    console.print(Panel.fit(
        f"[bold]ID:[/] {supplier['supplier_id']}\n"
        f"[bold]Name:[/] {supplier['name']}\n"
        f"[bold]Trust Level:[/] {supplier['trust_level']}\n"
        f"[bold]On-Time Rate:[/] {supplier['on_time_rate']:.0%}\n"
        f"[bold]Quality Rate:[/] {supplier['quality_rate']:.0%}\n"
        f"[bold]Orders YTD:[/] {supplier.get('order_count_ytd', 0)}\n"
        f"[bold]Notes:[/] {notes_str}",
        title="Supplier Knowledge",
        border_style="cyan",
    ))


@suppliers.command("trust")
@click.argument("supplier_id")
@click.argument("level", type=click.Choice(["high", "medium", "low", "blocked"]))
@click.option("--reason", "-r", default="Updated via CLI", help="Reason for change")
@click.pass_context
def suppliers_trust(ctx, supplier_id: str, level: str, reason: str):
    """Set supplier trust level."""
    client = get_client(ctx.obj["api_url"], ctx.obj.get("api_key"))
    client.set_supplier_trust(supplier_id, level, reason)
    console.print(f"[green]Set trust level for {supplier_id} to {level}[/]")


# =============================================================================
# Chat Command
# =============================================================================

@main.command()
@click.pass_context
def chat(ctx):
    """Interactive chat mode."""
    api_url = ctx.obj["api_url"]
    client = get_client(api_url)

    console.print(Panel.fit(
        "[bold cyan]BOM Agent CLI[/] - Chat Mode\n[dim]Type 'quit' to exit[/]",
        border_style="cyan",
    ))

    console.print(f"[green]Connected to {api_url}[/]")

    system_prompt = """You are an electronics parts sourcing expert. You help users identify parts,
find alternatives, and optimize their Bill of Materials for cost, availability, and reliability.
Be concise and practical in your responses."""

    while True:
        console.print()
        try:
            user_input = console.input("[bold cyan]You:[/] ")
        except (KeyboardInterrupt, EOFError):
            break

        if user_input.lower() in ("quit", "exit", "q"):
            break

        if not user_input.strip():
            continue

        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console,
            ) as progress:
                progress.add_task("[cyan]Thinking...", total=None)

                resp = client.client.post(
                    f"{api_url}/v1/chat/completions",
                    json={
                        "model": "bom-agent",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_input},
                        ],
                    },
                )

            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                console.print()
                console.print(Panel(content, title="[bold green]Agent[/]", border_style="green"))
            else:
                console.print(f"[red]Error: {resp.text}[/]")

        except Exception as e:
            console.print(f"[red]Error: {e}[/]")

    console.print("\n[dim]Goodbye![/]")


# =============================================================================
# API Key Commands
# =============================================================================

@main.group()
def apikey():
    """API key management for service authentication."""
    pass


@apikey.command("create")
@click.option("--name", "-n", required=True, help="Name for the API key (e.g., 'nextjs-service')")
@click.option("--scopes", "-s", default="all", help="Comma-separated scopes (default: all)")
def apikey_create(name: str, scopes: str):
    """Create a new API key for service authentication."""
    from .stores import ApiKeyStore

    store = ApiKeyStore("data/api_keys.db")
    scope_list = [s.strip() for s in scopes.split(",")]

    api_key, raw_key = store.create_key(name=name, scopes=scope_list)

    console.print()
    console.print(Panel.fit(
        f"[bold green]API Key Created Successfully[/]\n\n"
        f"[bold]Name:[/] {api_key.name}\n"
        f"[bold]Key ID:[/] {api_key.key_id}\n"
        f"[bold]Scopes:[/] {', '.join(api_key.scopes)}\n"
        f"[bold]Created:[/] {api_key.created_at.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        f"[bold yellow]API Key:[/] [bold cyan]{raw_key}[/]\n\n"
        f"[dim italic]Save this key - it will not be shown again![/]",
        border_style="green",
    ))
    console.print()


@apikey.command("list")
def apikey_list():
    """List all API keys."""
    from .stores import ApiKeyStore

    store = ApiKeyStore("data/api_keys.db")
    keys = store.list_keys()

    if not keys:
        console.print("[dim]No API keys found.[/]")
        return

    table = Table(title="API Keys", box=box.ROUNDED)
    table.add_column("Key ID", style="cyan")
    table.add_column("Name")
    table.add_column("Scopes")
    table.add_column("Active", justify="center")
    table.add_column("Created")
    table.add_column("Last Used")

    for key in keys:
        active = "[green]Yes[/]" if key.is_active else "[red]No[/]"
        last_used = key.last_used.strftime("%Y-%m-%d %H:%M") if key.last_used else "[dim]Never[/]"
        table.add_row(
            key.key_id,
            key.name,
            ", ".join(key.scopes),
            active,
            key.created_at.strftime("%Y-%m-%d %H:%M"),
            last_used,
        )

    console.print(table)


@apikey.command("revoke")
@click.argument("key_id")
@click.confirmation_option(prompt="Are you sure you want to revoke this API key?")
def apikey_revoke(key_id: str):
    """Revoke an API key."""
    from .stores import ApiKeyStore

    store = ApiKeyStore("data/api_keys.db")

    # Check if key exists first
    existing = store.get_key(key_id)
    if not existing:
        console.print(f"[red]API key not found: {key_id}[/]")
        return

    if not existing.is_active:
        console.print(f"[yellow]API key is already revoked: {key_id}[/]")
        return

    if store.revoke_key(key_id):
        console.print(f"[green]Revoked API key: {key_id} ({existing.name})[/]")
    else:
        console.print(f"[red]Failed to revoke API key: {key_id}[/]")


if __name__ == "__main__":
    main()

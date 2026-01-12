"""Rich console logging utilities for BOM Agent Service."""

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.markdown import Markdown
from rich.text import Text
from rich import box

from ..models.specialist_result import SpecialistAgentResult
from ..models.final_report import FinalDecisionReport, PartVerdict

# Global console instance
console = Console()


# Agent icons
AGENT_ICONS = {
    "EngineeringAgent": "[bold blue]ENG[/bold blue]",
    "SourcingAgent": "[bold green]SRC[/bold green]",
    "FinanceAgent": "[bold yellow]FIN[/bold yellow]",
    "FinalDecisionAgent": "[bold magenta]FINAL[/bold magenta]",
    "MarketIntelAgent": "[bold cyan]INTEL[/bold cyan]",
}


def log_flow_step(step: str, message: str, agent: str = None):
    """Log a flow step with optional agent attribution."""
    agent_tag = AGENT_ICONS.get(agent, f"[dim]{agent}[/dim]") if agent else ""
    step_tag = f"[bold white on blue] {step.upper()} [/bold white on blue]"

    if agent_tag:
        console.print(f"{step_tag} {agent_tag} {message}")
    else:
        console.print(f"{step_tag} {message}")


def log_specialist_result(result: SpecialistAgentResult):
    """Log specialist agent result with nice formatting."""
    icon = AGENT_ICONS.get(result.agent_name, result.agent_name)

    # Build panel content
    content_parts = []

    # Parts evaluated
    parts_str = ", ".join(result.parts_evaluated[:10])
    if len(result.parts_evaluated) > 10:
        parts_str += f" (+{len(result.parts_evaluated) - 10} more)"
    content_parts.append(f"[bold]Parts Evaluated:[/bold] {parts_str}")
    content_parts.append(f"[bold]Timestamp:[/bold] {result.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
    content_parts.append("")

    # Analysis notes (render as markdown)
    content_parts.append("[bold underline]ANALYSIS NOTES[/bold underline]")
    content_parts.append("")

    # Create the panel
    panel_content = "\n".join(content_parts)

    console.print(Panel(
        panel_content,
        title=f"{icon} {result.agent_name.upper().replace('AGENT', ' AGENT')} ANALYSIS",
        border_style="blue" if "Engineering" in result.agent_name else
                     "green" if "Sourcing" in result.agent_name else
                     "yellow",
        padding=(1, 2),
    ))

    # Print analysis as markdown in a separate block for better rendering
    console.print(Markdown(result.analysis_notes))
    console.print()

    # Key concerns if any
    if result.key_concerns:
        console.print("[bold red]KEY CONCERNS:[/bold red]")
        for concern in result.key_concerns:
            console.print(f"  [red]•[/red] {concern}")
        console.print()

    # Recommendations if any
    if result.recommendations:
        console.print("[bold green]RECOMMENDATIONS:[/bold green]")
        for rec in result.recommendations:
            console.print(f"  [green]•[/green] {rec}")
        console.print()

    console.rule(style="dim")


def log_part_verdict(verdict: PartVerdict):
    """Log individual part verdict."""
    status_icon = "[bold green]APPROVED[/bold green]" if verdict.verdict == "APPROVED" else "[bold red]REJECTED[/bold red]"

    # Create verdict panel
    content_lines = [
        f"[bold]Verdict:[/bold] {status_icon}",
    ]

    if verdict.verdict == "APPROVED":
        content_lines.extend([
            f"[bold]Supplier:[/bold] {verdict.selected_supplier_name or 'N/A'} ({verdict.selected_supplier_id or 'N/A'})",
            f"[bold]Quantity:[/bold] {verdict.final_quantity:,}",
            f"[bold]Unit Price:[/bold] ${verdict.final_unit_price:.4f}",
            f"[bold]Line Cost:[/bold] ${verdict.final_line_cost:,.2f}",
        ])

    content_lines.append("")
    content_lines.append("[bold underline]ENGINEERING FINDINGS[/bold underline]")
    content_lines.append(verdict.engineering_findings)
    content_lines.append("")
    content_lines.append("[bold underline]SOURCING FINDINGS[/bold underline]")
    content_lines.append(verdict.sourcing_findings)
    content_lines.append("")
    content_lines.append("[bold underline]FINANCE FINDINGS[/bold underline]")
    content_lines.append(verdict.finance_findings)

    if verdict.points_of_agreement:
        content_lines.append("")
        content_lines.append("[bold green]POINTS OF AGREEMENT[/bold green]")
        for point in verdict.points_of_agreement:
            content_lines.append(f"  [green]✓[/green] {point}")

    if verdict.points_of_conflict:
        content_lines.append("")
        content_lines.append("[bold yellow]POINTS OF CONFLICT[/bold yellow]")
        for point in verdict.points_of_conflict:
            content_lines.append(f"  [yellow]⚡[/yellow] {point}")

    content_lines.append("")
    content_lines.append("[bold underline]RESOLUTION RATIONALE[/bold underline]")
    content_lines.append(verdict.resolution_rationale)

    if verdict.risk_factors:
        content_lines.append("")
        content_lines.append("[bold red]RISK FACTORS[/bold red]")
        for risk in verdict.risk_factors:
            content_lines.append(f"  [red]⚠[/red] {risk}")

    if verdict.mitigations:
        content_lines.append("")
        content_lines.append("[bold blue]MITIGATIONS[/bold blue]")
        for mitigation in verdict.mitigations:
            content_lines.append(f"  [blue]→[/blue] {mitigation}")

    if verdict.conditions:
        content_lines.append("")
        content_lines.append("[bold magenta]CONDITIONS[/bold magenta]")
        for condition in verdict.conditions:
            content_lines.append(f"  [magenta]•[/magenta] {condition}")

    border_color = "green" if verdict.verdict == "APPROVED" else "red"
    console.print(Panel(
        "\n".join(content_lines),
        title=f"PART VERDICT: {verdict.mpn}",
        border_style=border_color,
        padding=(1, 2),
    ))


def log_final_report(report: FinalDecisionReport):
    """Log final decision report with panels and tables."""
    # Header
    console.print()
    console.rule("[bold magenta]FINAL DECISION REPORT[/bold magenta]", style="magenta")
    console.print(f"[bold]Report ID:[/bold] {report.report_id}")
    console.print(f"[bold]Project ID:[/bold] {report.project_id}")
    console.print(f"[bold]Generated:[/bold] {report.generated_at.strftime('%Y-%m-%d %H:%M:%S')}")
    console.print()

    # Executive Summary
    console.print(Panel(
        Markdown(report.executive_summary),
        title="[bold]EXECUTIVE SUMMARY[/bold]",
        border_style="magenta",
        padding=(1, 2),
    ))

    # Per-part verdicts
    console.print()
    console.rule("[bold]PART VERDICTS[/bold]", style="dim")
    console.print()

    for verdict in report.verdicts:
        log_part_verdict(verdict)
        console.print()

    # Project Summary Table
    summary = report.project_summary
    summary_table = Table(title="PROJECT SUMMARY", box=box.ROUNDED)
    summary_table.add_column("Metric", style="bold")
    summary_table.add_column("Value", justify="right")

    summary_table.add_row("Total Parts", str(summary.total_parts))
    summary_table.add_row("Approved", f"[green]{summary.approved_count}[/green]")
    summary_table.add_row("Rejected", f"[red]{summary.rejected_count}[/red]")
    summary_table.add_row("Total Spend", f"${summary.total_estimated_spend:,.2f}")
    summary_table.add_row("Budget Remaining", f"${summary.budget_remaining:,.2f}")

    risk_color = {"LOW": "green", "MEDIUM": "yellow", "HIGH": "red"}[summary.overall_risk_level]
    summary_table.add_row("Overall Risk", f"[{risk_color}]{summary.overall_risk_level}[/{risk_color}]")

    console.print(summary_table)
    console.print()

    # Key Risks
    if summary.key_risks:
        console.print("[bold red]KEY RISKS:[/bold red]")
        for risk in summary.key_risks:
            console.print(f"  [red]⚠[/red] {risk}")
        console.print()

    # Strategic Recommendations
    if summary.strategic_recommendations:
        console.print("[bold blue]STRATEGIC RECOMMENDATIONS:[/bold blue]")
        for rec in summary.strategic_recommendations:
            console.print(f"  [blue]→[/blue] {rec}")
        console.print()

    # Follow-up Items Table
    if report.follow_up_notes:
        follow_up_table = Table(title="FOLLOW-UP ITEMS", box=box.ROUNDED)
        follow_up_table.add_column("Priority", style="bold", width=8)
        follow_up_table.add_column("Category", width=12)
        follow_up_table.add_column("Description")
        follow_up_table.add_column("Related MPNs", width=20)

        priority_icons = {
            "HIGH": "[red]HIGH[/red]",
            "MEDIUM": "[yellow]MED[/yellow]",
            "LOW": "[green]LOW[/green]",
        }

        for item in report.follow_up_notes:
            mpns = ", ".join(item.related_mpns[:3])
            if len(item.related_mpns) > 3:
                mpns += f" (+{len(item.related_mpns) - 3})"
            follow_up_table.add_row(
                priority_icons.get(item.priority, item.priority),
                item.category,
                item.description,
                mpns,
            )

        console.print(follow_up_table)
        console.print()

    # Final summary line
    console.rule(style="magenta")
    approved_pct = (report.total_approved / (report.total_approved + report.total_rejected) * 100) if (report.total_approved + report.total_rejected) > 0 else 0
    console.print(
        f"[bold]FINAL:[/bold] {report.total_approved} approved, {report.total_rejected} rejected "
        f"({approved_pct:.0f}% approval rate) | "
        f"Total Spend: ${report.total_spend:,.2f} ({report.budget_utilization_pct:.1f}% of budget)"
    )
    console.print()

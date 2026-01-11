# BOM Agent Service - Claude Code Instructions

## Project Overview

This is a multi-agent BOM (Bill of Materials) processing service built with CrewAI and FastAPI. The system automates the review of electronic component sourcing through specialized AI agents (Engineering, Sourcing, Finance, Market Intelligence) that evaluate parts based on compliance, supply chain risk, budget constraints, and real-time market intelligence gathered via Apify web scraping.

## Quick Start

```bash
# Start the API server
uv run uvicorn bom_agent_service.main:app --reload

# In another terminal, process a BOM
uv run sourcing process sample_bom.csv --intake project_intake.yaml

# View results
uv run sourcing status
uv run sourcing trace <project_id>
```

## Key Architecture Decisions

1. **CLI → API → Stores**: The CLI uses HTTP to communicate with the API. Never access stores directly from CLI.
2. **CrewAI Flows**: Orchestration uses `@start()` and `@listen()` decorators for sequential agent execution.
3. **Hybrid Data**: Structured SQLite stores + CrewAI memory/knowledge for RAG retrieval.
4. **Mock Enrichment**: Currently uses mock supplier data. Real API integration is planned.

## Important Files

| File | Purpose |
|------|---------|
| `src/bom_agent_service/main.py` | FastAPI app entry point |
| `src/bom_agent_service/cli.py` | CLI using API via httpx |
| `src/bom_agent_service/flows/bom_flow.py` | CrewAI Flow orchestration |
| `src/bom_agent_service/agents/*.py` | Agent definitions |
| `src/bom_agent_service/agents/market_intel.py` | Market Intelligence agent using Apify |
| `src/bom_agent_service/stores/*.py` | SQLite data stores |
| `src/bom_agent_service/stores/market_intel_store.py` | Market intelligence cache |
| `src/bom_agent_service/services/apify_client.py` | Apify API client for web scraping |
| `src/bom_agent_service/api/*.py` | FastAPI routers |

## Environment Variables

Required in `.env`:
```
# At least one LLM key required
OPENAI_API_KEY=sk-...         # For gpt-5-nano (default)
ANTHROPIC_API_KEY=sk-ant-...  # For Claude models

# Optional
CREWAI_MODEL=gpt-5-nano       # Override default model
PORT=8000                      # Server port (default: 8000)

# Market Intelligence (Apify)
APIFY_API_TOKEN=apify_api_... # Enables market intelligence gathering via web scraping
```

## Agents

| Agent | Role | Data Sources |
|-------|------|--------------|
| EngineeringAgent | Technical compliance review | Org knowledge, part lifecycle data |
| SourcingAgent | Supply chain risk assessment | Supplier data, market intelligence |
| FinanceAgent | Cost and budget analysis | Pricing data, MOQ requirements |
| MarketIntelAgent | Market intelligence gathering | Apify web scraping (news, manufacturer pages) |
| FinalDecisionAgent | Decision aggregation | All agent outputs |

## Flow

```
Intake → Enrich → Market Intel (Apify) → [Engineering | Sourcing | Finance] (parallel) → Final Decision → Complete
```

The Market Intelligence step uses Apify to scrape:
- Industry news for supply chain risks
- Manufacturer pages for product updates
- Component shortage alerts
- Price trend information

This intel is passed to the SourcingAgent to inform supply chain risk decisions.

## Testing

```bash
# Verify imports
uv run python -c "from bom_agent_service.main import app; print('OK')"

# Test API endpoints
curl http://localhost:8000/health
curl http://localhost:8000/projects
curl http://localhost:8000/knowledge/suppliers

# Test CLI
uv run sourcing kb suppliers list
uv run sourcing status
```

## Common Tasks

### Adding a New Agent
1. Create agent file in `agents/` following existing patterns
2. Add to flow in `flows/bom_flow.py` with `@listen()` decorator
3. Update imports in `agents/__init__.py`

### Adding a New API Endpoint
1. Add route in appropriate `api/*.py` file
2. Update CLI in `cli.py` to use new endpoint
3. Update DESIGN.md with new endpoint

### Modifying Store Schema
1. Update model in `models/`
2. Update store in `stores/`
3. Delete existing `.db` files to recreate schema

---

# Session Journaling Protocol

## Purpose

Maintain a development journal to track decisions, progress, and context across sessions. This helps with:
- Continuity when context is compacted
- Understanding why decisions were made
- Tracking what works and what doesn't

## Journal Location

All journal entries go in: `docs/journal/`

## Entry Format

Create entries with filename: `YYYY-MM-DD-<short-description>.md`

### Template

```markdown
# Journal: <Title>

**Date**: YYYY-MM-DD
**Session**: <morning/afternoon/evening>

## Summary
<2-3 sentence summary of what was accomplished>

## Goals
- [ ] Goal 1
- [x] Goal 2 (completed)

## Changes Made

### <Component/Area>
- What changed
- Why it changed
- Files affected: `path/to/file.py`

## Decisions

### Decision: <Title>
**Context**: Why this decision was needed
**Options Considered**:
1. Option A - pros/cons
2. Option B - pros/cons
**Chosen**: Option X
**Rationale**: Why this was chosen

## Issues Encountered
- Issue: <description>
  - Cause: <root cause>
  - Resolution: <how it was fixed>

## Next Steps
- [ ] Next task 1
- [ ] Next task 2

## Notes
<Any additional context, ideas, or observations>
```

## When to Journal

1. **Start of Session**: Review previous entry, note current goals
2. **After Major Changes**: Document what changed and why
3. **When Making Decisions**: Record options considered and rationale
4. **End of Session**: Summarize progress, note next steps

## Journal Index

Maintain `docs/journal/INDEX.md` with links to all entries:

```markdown
# Development Journal Index

## 2025
- [2025-01-10 - Initial Implementation](./2025-01-10-initial-implementation.md)
- [2025-01-11 - API Integration](./2025-01-11-api-integration.md)
```

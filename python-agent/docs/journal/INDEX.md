# Development Journal Index

This journal tracks the development of the BOM Agent Service. Each entry documents goals, changes, decisions, and lessons learned.

## How to Use

- Start each session by reviewing the most recent entry
- Create new entries following the template in `CLAUDE.md`
- Update this index when adding new entries

---

## 2025

### January

- [2025-01-10 - Initial Implementation](./2025-01-10-initial-implementation.md)
  - Built complete multi-agent system with CrewAI Flows
  - Implemented SQLite stores, FastAPI endpoints, Rich CLI
  - Integrated CrewAI memory and knowledge primitives

- [2025-01-10 - Demo Script](./2025-01-10-demo-script.md)
  - Created NeuroLink Mini sample project (BCI device)
  - Built interactive 11-step demo walkthrough
  - Added `uv run sourcing-server` command

- [2025-01-10 - Batch Processing](./2025-01-10-batch-processing.md)
  - Refactored agents for batch processing (1 LLM call per step)
  - Switched to gpt-4o-mini, removed memory overhead
  - Reduced 20-part BOM processing from ~10 min to ~3 min

- [2025-01-11 - Parallel Agents & Final Decision](./2025-01-11-parallel-agents-final-decision.md)
  - Parallelized Engineering, Sourcing, Finance agents with asyncio.gather()
  - Added Final Decision Agent to aggregate sub-agent outputs
  - Implemented Pydantic structured output for reliable LLM responses
  - Removed dead code, updated tests (45/45 passing)

- [2025-01-11 - Watch Mode, Knowledge Logging & Demo Data](./2025-01-11-watch-mode-knowledge-logging.md)
  - Added `--watch` flag with animated spinner for real-time CLI output
  - Added `[KNOWLEDGE]` logging when attaching supplier/part knowledge
  - Refactored supplier context to appear once per unique supplier
  - Seeded demo data: 4 suppliers with notes, 10 parts with history

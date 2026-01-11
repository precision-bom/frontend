# Journal: Watch Mode, Knowledge Logging & Demo Data Seeding

**Date**: 2025-01-11
**Session**: Evening

## Summary

Added real-time watch mode with spinner for CLI, implemented logging for knowledge base enrichment, refactored supplier context to avoid duplication, and seeded demo data for the NeuroLink Mini project.

## Goals
- [x] Add real-time streaming output during BOM processing
- [x] Add spinner/activity indicator while waiting for LLM responses
- [x] Add logging when attaching knowledge from knowledge base
- [x] Ensure supplier notes are only included once per supplier
- [x] Seed SQLite with demo data for suppliers and parts

## Changes Made

### Watch Mode with Spinner (`cli.py`)
- Added `--watch` flag to `process` command that shows real-time trace updates
- Implemented animated spinner (`⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏`) with elapsed time counter
- Spinner activates after 1 second of waiting for LLM response
- Added standalone `watch` command to monitor existing project processing
- Added duration timing between consecutive trace steps
- Files affected: `src/bom_agent_service/cli.py`

### Knowledge Base Logging (`agents/*.py`)
- Added `logger = logging.getLogger(__name__)` to all agent files
- **Engineering Agent** logs:
  - Part knowledge found/not found with usage stats
  - Banned parts with reason
  - Approved alternates
- **Sourcing Agent** logs:
  - Attaching supplier knowledge (once per unique supplier)
- **Finance Agent** logs:
  - Offers found per part
  - Summary of analysis (parts, offers, estimated spend)
- Configured logging in `main.py` with timestamp format
- Files affected: `agents/engineering.py`, `agents/sourcing.py`, `agents/finance.py`, `main.py`

### Supplier Context Deduplication (`agents/sourcing.py`)
- Refactored to collect unique suppliers across all parts first
- Added "Known Supplier Information" section at top of prompt
- Each supplier's notes, metrics, trust level appear only once
- Part offers now reference suppliers by ID (details in top section)
- New method: `_build_supplier_context(supplier)` for supplier details
- Files affected: `agents/sourcing.py`

### Demo Data Seeding
- Created `seed_demo_data.py` with comprehensive demo data
- **Suppliers seeded** (4): Digi-Key, Mouser, Newark, Arrow
  - Each has: notes from different teams, performance metrics, contact info
- **Parts seeded** (10): All parts from sample BOM + 2 banned parts
  - RC0805FR-0710KL, ECA-1EM101, ATMEGA328P-PU, CL21B104KBCNNNC, etc.
  - Each has: usage history, engineering notes, approved alternates
- **Banned parts**: ADS1298, STM32F4 (from NeuroLink intake requirements)
- Added `uv run sourcing kb seed` CLI command
- Files affected: `seed_demo_data.py` (new), `cli.py`

## Decisions

### Decision: Supplier Context at Top vs Per-Part
**Context**: Supplier notes were being repeated for each part that had offers from the same supplier, bloating prompts
**Options Considered**:
1. Keep per-part (more context but redundant)
2. Aggregate unique suppliers at top of prompt
**Chosen**: Option 2 - Aggregate at top
**Rationale**: Reduces token usage, cleaner structure, allows agent to reference by ID

### Decision: Log "No Knowledge Found" vs Silence
**Context**: Engineering agent only logged when knowledge exists
**Options Considered**:
1. Only log when knowledge found (less noise)
2. Also log when no knowledge exists (more visibility)
**Chosen**: Option 2 - Log both cases
**Rationale**: Useful to see that the system checked but found nothing, helps debugging

## Log Output Examples

```
18:41:07 [bom_agent_service.agents.sourcing] INFO: [KNOWLEDGE] Attaching supplier knowledge for: Digi-Key (digikey)
18:41:07 [bom_agent_service.agents.sourcing] INFO: [KNOWLEDGE] Attaching supplier knowledge for: Mouser (mouser)
18:41:07 [bom_agent_service.agents.finance] INFO: [KNOWLEDGE] 2 offers found for RC0805FR-0710KL
18:41:07 [bom_agent_service.agents.finance] INFO: [KNOWLEDGE] Finance analysis: 10 parts, 20 total offers, estimated spend $444.00
```

## Performance Impact

- Watch mode: Polls trace endpoint every 0.5s (minimal overhead)
- Spinner: Simple string rotation, no performance impact
- Supplier deduplication: Reduces prompt size when multiple parts share suppliers
- Knowledge logging: Python logging only, no API overhead

## New CLI Commands

```bash
# Process with real-time watch
uv run sourcing process sample_bom.csv --intake project_intake.yaml --watch

# Watch existing project
uv run sourcing watch PRJ-2025-001

# Seed demo data
uv run sourcing kb seed
```

## Demo Data Contents

### Suppliers
| ID | Name | Trust | Notes Count |
|---|---|---|---|
| digikey | Digi-Key | high | 3 (compliance, tech support, volume discounts) |
| mouser | Mouser | high | 3 (backup for passives, TI/STMicro, shipping) |
| newark | Newark | high | 3 (connectors, quality incident, payment terms) |
| arrow | Arrow | medium | 3 (response times, Microchip, traceability) |

### Parts
| MPN | Status | Times Used | Notes |
|---|---|---|---|
| RC0805FR-0710KL | preferred | 15 | Precision resistor, zero failures |
| CL21B104KBCNNNC | preferred | 25 | Standard MLCC, reliable |
| ATMEGA328P-PU | - | 5 | Legacy MCU, stock erratic |
| ADS1298 | BANNED | 0 | Only 8 channels |
| STM32F4 | BANNED | 0 | Insufficient DSP power |

## Next Steps
- [ ] Test spinner in actual demo script
- [ ] Add WebSocket for real-time updates (vs polling)
- [ ] Consider showing knowledge attachments in CLI watch output

## Notes

The spinner uses Unicode braille patterns which work well in modern terminals. The watch mode uses threading to allow the HTTP request to run in background while polling for trace updates in foreground. All logging uses the `[KNOWLEDGE]` tag for easy filtering with grep.

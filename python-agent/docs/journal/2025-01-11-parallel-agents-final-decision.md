# Journal: Parallel Agent Execution & Final Decision Aggregation

**Date**: 2025-01-11
**Session**: evening

## Summary

Refactored the agent architecture to run Engineering, Sourcing, and Finance agents in parallel using `asyncio.gather()`, added a new Final Decision Agent to aggregate all sub-agent outputs, and implemented Pydantic structured output for reliable LLM responses. Also removed dead code and updated tests.

## Goals

- [x] Fix agent reasoning not appearing in logs/CLI
- [x] Use CrewAI structured output (Pydantic) for reliable responses
- [x] Parallelize agent execution instead of sequential
- [x] Add Final Decision agent to aggregate sub-agent outputs
- [x] Replace ThreadPoolExecutor with native async
- [x] Remove dead code from codebase
- [x] Update tests and demo script

## Changes Made

### Agent Structured Output (`agents/*.py`)

- Added Pydantic models for each agent's output:
  - `EngineeringPartDecision` / `EngineeringBatchResult`
  - `SourcingPartDecision` / `SourcingBatchResult`
  - `FinancePartDecision` / `FinanceBatchResult`
- Changed from manual JSON parsing to `output_pydantic=` parameter in CrewAI Task
- Added validation that raises `ValueError` if LLM returns invalid response (no fallback)

### Async Agent Execution (`agents/*.py`)

- Changed `evaluate_batch()` methods from sync to `async def`
- Replaced `crew.kickoff()` with `await crew.kickoff_async()`
- Finance agent now evaluates independently (no longer depends on sourcing decisions)

### New Final Decision Agent (`agents/final_decision.py`)

- Created `FinalDecisionAgent` class with role "Senior Procurement Manager"
- Aggregates Engineering, Sourcing, and Finance assessments
- Provides comprehensive rationale synthesizing all inputs
- Output includes: selected supplier, final quantity/price, risk factors, recommendations
- Pydantic models: `FinalPartDecision`, `FinalDecisionResult`

### Flow Parallelization (`flows/bom_flow.py`)

- Replaced sequential agent calls with `asyncio.gather()`:
  ```python
  await asyncio.gather(
      self._engineering_agent.evaluate_batch(...),
      self._sourcing_agent.evaluate_batch(...),
      self._finance_agent.evaluate_batch(...),
  )
  ```
- Added `parallel_agent_review` step
- Added `final_decision` step after parallel review
- Made flow methods async where needed

### Model Updates (`models/`)

- Added `PENDING_FINAL_DECISION` to `LineItemStatus` enum
- Added `final_decision: Optional[AgentDecision]` field to `BOMLineItem`

### Dead Code Removal

- `api/projects.py`: Removed `_processing_status`, `_run_flow_background()`, `process_project()` endpoint
- `stores/project_store.py`: Removed unused `import json`
- `agents/finance.py`: Removed unused `Optional` import

### Test Updates (`tests/test_upload_and_process.py`)

- Removed `test_up4_reprocess_existing_project` (tested deleted endpoint)
- Test suite: 45/45 passing

### Demo Script (`demo/run_demo.sh`)

- Updated architecture diagrams to show parallel flow
- Added FinalDecisionAgent documentation
- Updated "What We Covered" section

## Decisions

### Decision: Async + Gather vs ThreadPoolExecutor

**Context**: Needed to parallelize agent execution for performance
**Options Considered**:
1. ThreadPoolExecutor - Works but adds complexity, not truly async
2. asyncio.gather() - Native async, cleaner integration with async code
**Chosen**: asyncio.gather()
**Rationale**: CrewAI supports `kickoff_async()`, so native async is cleaner and avoids thread overhead

### Decision: Fail Fast on Invalid LLM Response

**Context**: Previous code had fallback logic for bad LLM responses
**Options Considered**:
1. Keep fallback - Provides graceful degradation
2. Fail immediately - Surfaces issues quickly, forces proper prompts
**Chosen**: Fail immediately with `ValueError`
**Rationale**: Fallbacks hide problems. Better to fail fast and fix root cause (prompts, Pydantic models)

### Decision: Final Decision Agent Pattern

**Context**: Needed to synthesize multiple agent perspectives into final purchasing decisions
**Options Considered**:
1. Simple voting (majority wins) - Easy but loses nuance
2. Weighted scoring - Complex, hard to tune
3. LLM aggregation agent - Flexible, can reason about tradeoffs
**Chosen**: LLM aggregation agent
**Rationale**: Procurement decisions require nuanced tradeoff analysis. An LLM can weigh conflicting recommendations and provide defensible rationale.

## Architecture

```
Flow: Intake → Enrich → [Engineering | Sourcing | Finance] (parallel) → Final Decision → Complete
                              ↓              ↓           ↓
                         technical      supply chain   budget
                         compliance     risk/supplier  analysis
                              ↓              ↓           ↓
                              └──────────────┴───────────┘
                                           ↓
                                   Final Decision Agent
                                   (aggregates all inputs)
```

## Issues Encountered

- **Issue**: Test failure after removing endpoint
  - **Cause**: `test_up4_reprocess_existing_project` called deleted `/projects/{id}/process` endpoint
  - **Resolution**: Removed the obsolete test

## Verification

Ran full validation:
- Test suite: 45/45 passed
- Demo: BOM uploaded and processed successfully
- Trace output confirmed all agent reasoning captured:
  - EngineeringAgent reasoning visible
  - SourcingAgent reasoning with supplier selection logic
  - FinanceAgent reasoning with budget analysis
  - FinalDecisionAgent comprehensive synthesis

## Next Steps

- [ ] Add real supplier API integration (replace mock enrichment)
- [ ] Implement alternate part suggestion when primary is rejected
- [ ] Add budget allocation across multiple line items
- [ ] Consider caching for repeated MPN lookups

## Notes

- CrewAI's `output_pydantic` parameter is powerful for structured output
- Parallel execution significantly reduces total processing time
- Final Decision Agent pattern is useful for multi-perspective aggregation
- The trace log now provides full audit trail for procurement decisions

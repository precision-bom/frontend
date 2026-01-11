# PrecisionBOM Python Agent

Multi-agent BOM processing service built with CrewAI and FastAPI.

**Production URL**: https://api.precisionbom.com

## Overview

This service automates the review of electronic component sourcing through specialized AI agents:

- **Engineering Agent** - Evaluates technical specifications and compliance
- **Sourcing Agent** - Analyzes supply chain risk and availability
- **Finance Agent** - Reviews pricing and budget constraints

## Tech Stack

- **Framework**: FastAPI + Uvicorn
- **AI**: CrewAI with Anthropic Claude
- **CLI**: Click + Rich
- **Data**: SQLite stores + CrewAI memory

## Getting Started

### Prerequisites
- Python 3.11+
- uv package manager

### Installation

```bash
uv sync
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# LLM API Key (at least one required)
OPENAI_API_KEY=sk-...        # Required for gpt-5-nano (default)
ANTHROPIC_API_KEY=sk-ant-... # Required for Claude models

# Optional
CREWAI_MODEL=gpt-5-nano      # Model for agents
PORT=8000                     # API server port
```

### Start the Server

```bash
uv run uvicorn bom_agent_service.main:app --reload
```

Server runs at [http://localhost:8000](http://localhost:8000).

## CLI Usage

### Process a BOM

```bash
uv run sourcing process sample_bom.csv --intake project_intake.yaml
```

### Check Status

```bash
uv run sourcing status
```

### View Trace

```bash
uv run sourcing trace <project_id>
```

### Knowledge Base

```bash
uv run sourcing kb suppliers list
```

## Project Structure

```
python-agent/
├── src/bom_agent_service/
│   ├── main.py           # FastAPI entry point
│   ├── cli.py            # Click CLI
│   ├── agents/           # CrewAI agent definitions
│   ├── flows/            # CrewAI Flow orchestration
│   ├── stores/           # SQLite data stores
│   ├── api/              # FastAPI routers
│   └── models/           # Pydantic models
├── tests/                # pytest tests
├── data/                 # Sample data files
├── demo/                 # Demo scripts
└── docs/                 # Documentation
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/projects` | GET | List all projects |
| `/projects` | POST | Create new project |
| `/projects/{id}` | GET | Get project details |
| `/knowledge/suppliers` | GET | List suppliers |
| `/process` | POST | Process BOM file |

## Architecture

### CrewAI Flows

Orchestration uses `@start()` and `@listen()` decorators for sequential agent execution:

```python
@start()
def ingest_bom(self):
    # Parse BOM file
    pass

@listen(ingest_bom)
def engineering_review(self):
    # Technical evaluation
    pass

@listen(engineering_review)
def sourcing_review(self):
    # Supply chain analysis
    pass
```

### Data Flow

```
CLI → HTTP → FastAPI → CrewAI Flow → Agents → Stores
```

## Testing

```bash
# Run all tests
uv run pytest

# Verify imports
uv run python -c "from bom_agent_service.main import app; print('OK')"

# Test endpoints
curl http://localhost:8000/health
```

## Scripts

| Command | Description |
|---------|-------------|
| `sourcing` | Main CLI |
| `sourcing-server` | Start API server |
| `sourcing-demo` | Run demo |

# BOM Agent Service - API Documentation

A multi-agent Bill of Materials (BOM) processing service built with CrewAI and FastAPI. The system automates electronic component sourcing through specialized AI agents that evaluate parts based on compliance, supply chain risk, and budget constraints.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [Core Endpoints](#core-endpoints)
  - [Projects API](#projects-api)
  - [Knowledge API](#knowledge-api)
- [Agents](#agents)
  - [Engineering Agent](#engineering-agent)
  - [Sourcing Agent](#sourcing-agent)
  - [Finance Agent](#finance-agent)
  - [Final Decision Agent](#final-decision-agent)
- [Data Models](#data-models)
- [CLI Reference](#cli-reference)
- [Configuration](#configuration)

---

## Overview

The BOM Agent Service processes electronic component Bills of Materials through a pipeline of specialized AI agents:

1. **Intake** - Parse BOM CSV and project requirements
2. **Enrichment** - Fetch supplier offers and part data
3. **Parallel Review** - Engineering, Sourcing, and Finance agents evaluate independently
4. **Final Decision** - Aggregate assessments into purchasing decisions
5. **Output** - Generate approved/rejected decisions with full traceability

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BOM Agent Service                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐    ┌──────────┐    ┌──────────────────────────────────┐  │
│   │   CLI    │───▶│ FastAPI  │───▶│         CrewAI Flow              │  │
│   │ (httpx)  │    │   API    │    │                                  │  │
│   └──────────┘    └──────────┘    │  ┌────────┐  ┌────────────────┐  │  │
│                                   │  │ Intake │─▶│    Enrich      │  │  │
│                                   │  └────────┘  └───────┬────────┘  │  │
│                                   │                      │           │  │
│                                   │              ┌───────▼───────┐   │  │
│                                   │              │   Parallel    │   │  │
│                                   │              │    Review     │   │  │
│                                   │              │ ┌───┬───┬───┐ │   │  │
│                                   │              │ │Eng│Src│Fin│ │   │  │
│                                   │              │ └───┴───┴───┘ │   │  │
│                                   │              └───────┬───────┘   │  │
│                                   │                      │           │  │
│                                   │              ┌───────▼───────┐   │  │
│                                   │              │Final Decision │   │  │
│                                   │              └───────┬───────┘   │  │
│                                   │                      │           │  │
│                                   │              ┌───────▼───────┐   │  │
│                                   │              │   Complete    │   │  │
│                                   │              └───────────────┘   │  │
│                                   └──────────────────────────────────┘  │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                        Data Stores (SQLite)                       │  │
│   │  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────┐  │  │
│   │  │ProjectStore │  │ OrgKnowledgeStore│  │    OffersStore      │  │  │
│   │  │projects.db  │  │org_knowledge.db  │  │offers_<project>.db  │  │  │
│   │  └─────────────┘  └──────────────────┘  └─────────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- `uv` package manager
- Anthropic API key (or OpenAI for default model)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd python-agent

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### Quick Start

```bash
# Start the API server
uv run uvicorn bom_agent_service.main:app --reload

# In another terminal, process a BOM
uv run sourcing process sample_bom.csv --intake project_intake.yaml

# Check status
uv run sourcing status

# View execution trace
uv run sourcing trace <project_id>
```

---

## API Reference

Base URL: `http://localhost:8000`

### Core Endpoints

#### Health Check

```http
GET /health
```

Returns service health status.

**Response:**
```json
{
  "status": "healthy"
}
```

#### Root Info

```http
GET /
```

Returns service information.

**Response:**
```json
{
  "service": "bom-agent-service",
  "version": "1.0.0"
}
```

#### List Models (OpenAI Compatible)

```http
GET /v1/models
```

Returns available models for chat completions.

#### Chat Completions (OpenAI Compatible)

```http
POST /v1/chat/completions
```

OpenAI-compatible chat endpoint for integration with existing tooling.

---

### Projects API

Base path: `/projects`

#### List Projects

```http
GET /projects?limit=100
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 100 | Maximum number of projects to return |

**Response:**
```json
[
  {
    "project_id": "proj_abc123",
    "project_name": "Smart Thermostat v2",
    "status": "completed",
    "line_item_count": 45,
    "created_at": "2025-01-10T10:30:00Z",
    "updated_at": "2025-01-10T11:45:00Z"
  }
]
```

#### Get Project

```http
GET /projects/{project_id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `project_id` | string | Unique project identifier |

**Response:**
```json
{
  "project_id": "proj_abc123",
  "context": {
    "project_name": "Smart Thermostat v2",
    "owner": "engineering@example.com",
    "product_type": "consumer",
    "quantity": 1000,
    "deadline": "2025-03-15",
    "budget_total": 50000.00,
    "compliance": {
      "standards": ["RoHS", "CE"],
      "quality_class": "IPC Class 2"
    },
    "sourcing_constraints": {
      "allow_brokers": false,
      "allow_alternates": true,
      "max_lead_time_days": 30
    }
  },
  "line_items": [...],
  "status": "completed",
  "trace": [...]
}
```

#### Get Project Trace

```http
GET /projects/{project_id}/trace
```

Returns the execution trace showing each step of the agent workflow.

**Response:**
```json
{
  "project_id": "proj_abc123",
  "trace": [
    {
      "step": "intake",
      "agent": "system",
      "message": "Parsed 45 line items from BOM",
      "timestamp": "2025-01-10T10:30:00Z"
    },
    {
      "step": "engineering_review",
      "agent": "Engineering Agent",
      "message": "Reviewed 45 parts: 42 approved, 3 rejected",
      "reasoning": "...",
      "timestamp": "2025-01-10T10:32:00Z"
    }
  ]
}
```

#### Create Project

```http
POST /projects
Content-Type: multipart/form-data
```

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bom_file` | file | Yes | CSV file containing BOM data |
| `project_name` | string | No | Project name |
| `owner` | string | No | Project owner email |
| `product_type` | string | No | One of: consumer, industrial, medical, automotive, aerospace |
| `quantity` | integer | No | Production quantity (default: 1) |
| `deadline` | date | No | Target deadline (YYYY-MM-DD) |
| `budget_total` | float | No | Total budget (default: 0) |
| `compliance_standards` | array | No | List of compliance standards |
| `quality_class` | string | No | Quality class (default: "IPC Class 2") |
| `allow_brokers` | boolean | No | Allow broker sourcing (default: false) |
| `allow_alternates` | boolean | No | Allow alternate parts (default: true) |
| `preferred_distributors` | array | No | Preferred distributor list |
| `max_lead_time_days` | integer | No | Maximum lead time (default: 30) |
| `engineering_notes` | string | No | Engineering notes |
| `critical_parts` | array | No | Critical part reference designators |

**Response:**
```json
{
  "project_id": "proj_abc123",
  "status": "created",
  "message": "Project created with 45 line items"
}
```

#### Upload and Process

```http
POST /projects/upload-and-process
Content-Type: multipart/form-data
```

Upload a BOM and immediately run the full agent workflow.

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bom_file` | file | Yes | CSV file containing BOM data |
| `intake_file` | file | No | YAML file with project requirements |

**Response:**
```json
{
  "project_id": "proj_abc123",
  "status": "completed",
  "message": "BOM processed successfully"
}
```

#### Delete Project

```http
DELETE /projects/{project_id}
```

**Response:**
```json
{
  "status": "deleted",
  "project_id": "proj_abc123"
}
```

---

### Knowledge API

Base path: `/knowledge`

The Knowledge API manages organizational knowledge about parts and suppliers that persists across projects.

#### Parts Endpoints

##### List Parts

```http
GET /knowledge/parts?limit=100
```

**Response:**
```json
[
  {
    "mpn": "STM32F103C8T6",
    "notes": "Widely used MCU, good availability",
    "approved_alternates": ["STM32F103CBT6"],
    "banned": false,
    "preferred": true,
    "times_used": 15,
    "failure_count": 0
  }
]
```

##### Get Part Knowledge

```http
GET /knowledge/parts/{mpn}
```

**Response:**
```json
{
  "mpn": "STM32F103C8T6",
  "notes": "Widely used MCU, good availability",
  "approved_alternates": ["STM32F103CBT6"],
  "banned": false,
  "ban_reason": null,
  "preferred": true,
  "times_used": 15,
  "failure_count": 0
}
```

##### Ban Part

```http
POST /knowledge/parts/{mpn}/ban
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Counterfeit issues reported",
  "user": "engineering@example.com"
}
```

##### Unban Part

```http
POST /knowledge/parts/{mpn}/unban
```

##### Get Approved Alternates

```http
GET /knowledge/parts/{mpn}/alternates
```

**Response:**
```json
{
  "mpn": "STM32F103C8T6",
  "alternates": ["STM32F103CBT6", "STM32F103RBT6"]
}
```

##### Add Approved Alternate

```http
POST /knowledge/parts/{mpn}/alternates
Content-Type: application/json
```

**Request Body:**
```json
{
  "alternate_mpn": "STM32F103CBT6",
  "reason": "Pin-compatible upgrade with more flash",
  "user": "engineering@example.com"
}
```

#### Suppliers Endpoints

##### List Suppliers

```http
GET /knowledge/suppliers?limit=100
```

**Response:**
```json
[
  {
    "supplier_id": "digikey",
    "name": "Digi-Key Electronics",
    "supplier_type": "authorized",
    "trust_level": "high",
    "on_time_rate": 0.98,
    "quality_rate": 0.995,
    "order_count_ytd": 45
  }
]
```

##### Get Supplier Knowledge

```http
GET /knowledge/suppliers/{supplier_id}
```

**Response:**
```json
{
  "supplier_id": "digikey",
  "name": "Digi-Key Electronics",
  "supplier_type": "authorized",
  "trust_level": "high",
  "on_time_rate": 0.98,
  "quality_rate": 0.995,
  "order_count_ytd": 45,
  "notes": "Primary authorized distributor"
}
```

##### Set Supplier Trust Level

```http
POST /knowledge/suppliers/{supplier_id}/trust
Content-Type: application/json
```

**Request Body:**
```json
{
  "trust_level": "high",
  "reason": "Consistent quality and delivery",
  "user": "procurement@example.com"
}
```

**Trust Levels:** `high`, `medium`, `low`, `blocked`

##### Create Supplier

```http
POST /knowledge/suppliers
Content-Type: application/json
```

**Request Body:**
```json
{
  "supplier_id": "newdist",
  "name": "New Distributor Inc",
  "supplier_type": "authorized",
  "trust_level": "medium"
}
```

**Supplier Types:** `authorized`, `broker`, `direct`

---

## Agents

The service uses four specialized AI agents that work together to evaluate BOMs.

### Engineering Agent

**Role:** Electronics Engineering Expert

**Responsibilities:**
- Component lifecycle assessment (active, NRND, EOL, obsolete)
- Compliance verification (RoHS, REACH, UL, CE, FDA)
- Quality standards validation (IPC classes, AEC-Q)
- Counterfeit risk detection
- Alternative part recommendations

**Decision Output:**
```json
{
  "mpn": "STM32F103C8T6",
  "decision": "APPROVED",
  "reasoning": "Part is active lifecycle, RoHS compliant, meets IPC Class 2 requirements",
  "concerns": [],
  "approved_alternates": ["STM32F103CBT6"]
}
```

### Sourcing Agent

**Role:** Supply Chain Analyst

**Responsibilities:**
- Supplier evaluation and risk assessment
- Price analysis and optimization
- Lead time verification
- Multi-sourcing strategy
- Authorized vs broker sourcing decisions

**Decision Output:**
```json
{
  "mpn": "STM32F103C8T6",
  "decision": "APPROVED",
  "selected_supplier": "digikey",
  "selected_supplier_name": "Digi-Key Electronics",
  "unit_price": 3.45,
  "lead_time_days": 5,
  "risk_level": "low",
  "reasoning": "Adequate stock at authorized distributor, competitive pricing"
}
```

### Finance Agent

**Role:** Procurement Finance Analyst

**Responsibilities:**
- Cost analysis and budget management
- Price break optimization
- Total cost of ownership calculations
- MOQ analysis
- Cash flow impact assessment

**Decision Output:**
```json
{
  "mpn": "STM32F103C8T6",
  "decision": "APPROVED",
  "recommended_qty": 1100,
  "estimated_unit_price": 3.25,
  "estimated_line_cost": 3575.00,
  "budget_impact": "Within budget, 7.15% of total",
  "reasoning": "Price break at 1000 qty provides 6% savings"
}
```

### Final Decision Agent

**Role:** Senior Procurement Manager

**Responsibilities:**
- Aggregate all agent assessments
- Resolve conflicts between agents
- Make final purchasing decisions
- Select suppliers and quantities
- Provide comprehensive rationale

**Decision Output:**
```json
{
  "mpn": "STM32F103C8T6",
  "decision": "APPROVED",
  "selected_supplier_id": "digikey",
  "selected_supplier_name": "Digi-Key Electronics",
  "final_quantity": 1100,
  "final_unit_price": 3.25,
  "final_line_cost": 3575.00,
  "engineering_summary": "Approved - active lifecycle, compliant",
  "sourcing_summary": "Low risk, authorized stock available",
  "finance_summary": "Within budget with price break optimization",
  "reasoning": "All agents approve. Ordering 10% buffer for yield loss.",
  "risk_factors": [],
  "recommendations": []
}
```

---

## Data Models

### Project Context

```yaml
project:
  id: string (auto-generated if not provided)
  name: string
  owner: string (email)
  engineering_contact: string

requirements:
  product_type: consumer | industrial | medical | automotive | aerospace
  quantity: integer
  deadline: date (YYYY-MM-DD)
  budget_total: float

compliance:
  standards: [string]  # RoHS, CE, UL, FDA, etc.
  quality_class: string  # IPC Class 1, 2, or 3
  country_of_origin_restrictions: [string]

sourcing_constraints:
  allow_brokers: boolean
  allow_alternates: boolean
  single_source_ok: boolean
  preferred_distributors: [string]
  max_lead_time_days: integer

engineering_context:
  notes: string
  critical_parts: [string]  # Reference designators
  preferred_manufacturers:
    capacitors: [string]
    resistors: [string]
    mcu: [string]
    connectors: [string]
  avoid_parts:
    - mpn: string
      reason: string
```

### BOM CSV Format

The BOM parser accepts CSV files with flexible column naming:

| Column | Aliases | Required | Description |
|--------|---------|----------|-------------|
| Reference Designators | Ref Des, RefDes | Yes | Component reference (e.g., R1, C5) |
| Quantity | Qty | Yes | Number of components |
| MPN | Part Number, P/N | Yes | Manufacturer Part Number |
| Manufacturer | Mfr, Mfg | Yes | Part manufacturer |
| Description | Desc | Yes | Part description |
| Package | Footprint | No | Component package |
| Value | | No | Component value (e.g., 10k, 100nF) |

**Example:**
```csv
Reference Designators,Quantity,MPN,Manufacturer,Description,Package,Value
"R1,R2,R3",3,RC0402FR-0710KL,Yageo,RES 10K OHM 1% 1/16W 0402,0402,10k
C1,1,GRM155R71C104KA88D,Murata,CAP CER 0.1UF 16V X7R 0402,0402,100nF
U1,1,STM32F103C8T6,STMicroelectronics,MCU ARM 64KB FLASH 48LQFP,LQFP-48,
```

### Decision Status

| Status | Description |
|--------|-------------|
| `PENDING` | Awaiting agent review |
| `APPROVED` | Approved for purchase |
| `REJECTED` | Rejected - do not purchase |
| `ESCALATED` | Requires manual review |

### Line Item Status

| Status | Description |
|--------|-------------|
| `PENDING_ENRICHMENT` | Awaiting supplier data |
| `ENRICHED` | Supplier offers retrieved |
| `PENDING_ENGINEERING` | Awaiting engineering review |
| `PENDING_SOURCING` | Awaiting sourcing review |
| `PENDING_FINANCE` | Awaiting finance review |
| `PENDING_FINAL_DECISION` | Awaiting final decision |
| `PENDING_PURCHASE` | Approved, ready to order |
| `ORDERED` | Purchase order placed |
| `RECEIVED` | Parts received |
| `FAILED` | Processing failed |

---

## CLI Reference

The CLI tool (`sourcing`) communicates with the API server via HTTP.

### Process BOM

```bash
uv run sourcing process <bom.csv> [OPTIONS]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--intake <file.yaml>` | Project requirements YAML file |
| `--verbose` | Show detailed output |

**Example:**
```bash
uv run sourcing process sample_bom.csv --intake project_intake.yaml --verbose
```

### Check Status

```bash
# List all projects
uv run sourcing status

# Get specific project status
uv run sourcing status <project_id>
```

### View Trace

```bash
uv run sourcing trace <project_id>
```

### Knowledge Base Commands

```bash
# Parts management
uv run sourcing kb parts list
uv run sourcing kb parts show <mpn>
uv run sourcing kb parts ban <mpn> --reason "Counterfeit risk"
uv run sourcing kb parts unban <mpn>
uv run sourcing kb parts alternate <mpn> <alt_mpn> --reason "Pin compatible"

# Supplier management
uv run sourcing kb suppliers list
uv run sourcing kb suppliers show <supplier_id>
uv run sourcing kb suppliers trust <supplier_id> high --reason "Excellent track record"
```

### Interactive Chat

```bash
uv run sourcing chat
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | - | Anthropic Claude API key |
| `CREWAI_MODEL` | No | `gpt-4o-mini` | LLM model for agents |
| `BOM_API_URL` | No | `http://localhost:8000` | API URL for CLI |

### Example `.env`

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
CREWAI_MODEL=claude-3-5-sonnet-20241022
BOM_API_URL=http://localhost:8000
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `404` | Not Found - Resource doesn't exist |
| `422` | Validation Error - Invalid data format |
| `500` | Internal Server Error |

### Error Response Format

```json
{
  "detail": "Project not found: proj_xyz"
}
```

---

## Examples

### Complete Workflow

```bash
# 1. Start the server
uv run uvicorn bom_agent_service.main:app --reload

# 2. Process a BOM with full requirements
uv run sourcing process my_bom.csv --intake requirements.yaml

# 3. Check processing status
uv run sourcing status

# 4. View detailed trace
uv run sourcing trace proj_abc123

# 5. Check final decisions
curl http://localhost:8000/projects/proj_abc123 | jq '.line_items[].final_decision'
```

### Using the API Directly

```bash
# Upload and process
curl -X POST http://localhost:8000/projects/upload-and-process \
  -F "bom_file=@my_bom.csv" \
  -F "intake_file=@requirements.yaml"

# Get project results
curl http://localhost:8000/projects/proj_abc123

# Ban a problematic part
curl -X POST http://localhost:8000/knowledge/parts/FAKE-MPN-123/ban \
  -H "Content-Type: application/json" \
  -d '{"reason": "Counterfeit", "user": "qa@example.com"}'
```

---

## License

[License information here]

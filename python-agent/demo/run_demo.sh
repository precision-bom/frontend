#!/bin/bash
# NeuroLink Mini - BOM Agent Interactive Demo
# A step-by-step walkthrough of the multi-agent BOM processing system

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
DIM='\033[2m'
NC='\033[0m'
BOLD='\033[1m'

clear

# Print functions
banner() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}${BOLD}${WHITE}  $1${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

section() {
    echo ""
    echo -e "${CYAN}┌──────────────────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC} ${BOLD}$1${NC}"
    echo -e "${CYAN}└──────────────────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

explain() {
    echo -e "${YELLOW}📖 $1${NC}"
}

detail() {
    echo -e "${DIM}   $1${NC}"
}

show_command() {
    echo ""
    echo -e "${GREEN}Command:${NC}"
    echo -e "${WHITE}   \$ $1${NC}"
    echo ""
}

show_api() {
    echo ""
    echo -e "${MAGENTA}API Call:${NC}"
    echo -e "${WHITE}   $1${NC}"
    echo ""
}

wait_for_user() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}Press Enter to continue (or Ctrl+C to exit)...${NC}"
    read
    echo ""
}

run_and_show() {
    echo -e "${DIM}Output:${NC}"
    echo -e "${DIM}────────────────────────────────────────────────────────────────────────${NC}"
    eval "$1"
    echo -e "${DIM}────────────────────────────────────────────────────────────────────────${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# INTRO
# ═══════════════════════════════════════════════════════════════════════════════

banner "NeuroLink Mini - BOM Agent System Demo"

echo -e "${WHITE}Welcome to the BOM Agent Service demonstration!${NC}"
echo ""
echo "This demo walks through a multi-agent system for processing Bills of Materials."
echo "We'll be sourcing components for a ${BOLD}portable brain-computer interface${NC} device."
echo ""
echo -e "${CYAN}What you'll see:${NC}"
echo "  1. How the CLI interacts with the FastAPI backend"
echo "  2. Three AI agents reviewing parts in PARALLEL, then Final Decision"
echo "  3. Knowledge base management for parts and suppliers"
echo "  4. Full audit trail of agent reasoning"
echo ""
echo -e "${YELLOW}Prerequisites:${NC}"
echo "  • API server running: uv run uvicorn bom_agent_service.main:app --reload"
echo "  • ANTHROPIC_API_KEY environment variable set"

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: Architecture Overview
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 1: System Architecture"

explain "The BOM Agent Service has a layered architecture:"
echo ""
echo -e "${WHITE}  ┌─────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${WHITE}  │                         CLI (Rich)                              │${NC}"
echo -e "${WHITE}  │        'uv run sourcing <command>' sends HTTP requests          │${NC}"
echo -e "${WHITE}  └─────────────────────────┬───────────────────────────────────────┘${NC}"
echo -e "${WHITE}                            │ HTTP/REST                              ${NC}"
echo -e "${WHITE}                            ▼                                        ${NC}"
echo -e "${WHITE}  ┌─────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${WHITE}  │                    FastAPI Server (:8000)                       │${NC}"
echo -e "${WHITE}  │   /projects  /knowledge  /v1/chat/completions  /health          │${NC}"
echo -e "${WHITE}  └─────────────────────────┬───────────────────────────────────────┘${NC}"
echo -e "${WHITE}                            │                                        ${NC}"
echo -e "${WHITE}          ┌─────────────────┼─────────────────┐                      ${NC}"
echo -e "${WHITE}          ▼                 ▼                 ▼                      ${NC}"
echo -e "${WHITE}  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐             ${NC}"
echo -e "${WHITE}  │ ProjectStore  │ │ OffersStore   │ │OrgKnowledge   │             ${NC}"
echo -e "${WHITE}  │   (SQLite)    │ │  (SQLite)     │ │   Store       │             ${NC}"
echo -e "${WHITE}  └───────────────┘ └───────────────┘ └───────────────┘             ${NC}"
echo -e "${WHITE}                            │                                        ${NC}"
echo -e "${WHITE}                            ▼                                        ${NC}"
echo -e "${WHITE}  ┌─────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${WHITE}  │                    CrewAI Flow Engine                           │${NC}"
echo -e "${WHITE}  │   [Engineering | Sourcing | Finance] → FinalDecisionAgent      │${NC}"
echo -e "${WHITE}  │         (parallel)                    (aggregates all)         │${NC}"
echo -e "${WHITE}  └─────────────────────────────────────────────────────────────────┘${NC}"
echo ""

explain "Each CLI command makes HTTP requests to the FastAPI server."
detail "The server orchestrates data stores and AI agents."

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: Health Check
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 2: API Health Check"

explain "First, let's verify the API server is running."
detail "The CLI always checks /health before making requests."
detail "If the server is down, you'll see a helpful error message."

show_api "GET http://localhost:8000/health"
show_command "curl -s http://localhost:8000/health | python3 -m json.tool"

echo -e "${YELLOW}Running...${NC}"
run_and_show "curl -s http://localhost:8000/health | python3 -m json.tool"

explain "The API also exposes a root endpoint showing available routes:"

show_api "GET http://localhost:8000/"
show_command "curl -s http://localhost:8000/ | python3 -m json.tool"

run_and_show "curl -s http://localhost:8000/ | python3 -m json.tool"

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: Knowledge Base - Suppliers
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 3: Knowledge Base - Suppliers"

explain "The system maintains organizational knowledge about suppliers."
detail "This includes trust levels, on-time rates, and quality metrics."
detail "Agents use this knowledge when making sourcing decisions."

show_api "GET http://localhost:8000/knowledge/suppliers"
show_command "uv run sourcing kb suppliers list"

explain "The CLI formats the JSON response into a Rich table:"

run_and_show "uv run sourcing kb suppliers list"

echo ""
explain "Each supplier has:"
detail "• Trust Level: high/medium/low/blocked - affects agent preference"
detail "• On-Time Rate: historical delivery performance"
detail "• Quality Rate: defect-free delivery percentage"
detail "• Orders YTD: volume of business this year"

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: Knowledge Base - Parts
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 4: Knowledge Base - Parts"

explain "The system also tracks knowledge about specific parts."
detail "Parts can be banned, have approved alternates, or be preferred."
detail "This knowledge persists across projects and informs agent decisions."

show_api "GET http://localhost:8000/knowledge/parts"
show_command "uv run sourcing kb parts list"

run_and_show "uv run sourcing kb parts list"

echo ""
explain "Parts knowledge includes:"
detail "• Banned status: parts that should never be used"
detail "• Approved alternates: pre-vetted substitutes"
detail "• Times used: historical usage count"
detail "• Failure count: quality issues encountered"

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5: The Project - NeuroLink Mini
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 5: The Project - NeuroLink Mini"

explain "We're sourcing parts for a portable brain-computer interface device."
detail "This is a medical-grade 8-channel neural signal acquisition unit."
echo ""

section "Device Overview"
echo "  ${BOLD}Product:${NC} NeuroLink Mini v1.0"
echo "  ${BOLD}Purpose:${NC} Capture brain signals for BCI research"
echo "  ${BOLD}Key ICs:${NC}"
echo "    • ADS1299 - 8-channel 24-bit neural ADC"
echo "    • STM32H743 - ARM Cortex-M7 480MHz MCU"
echo "    • INA333 - Instrumentation amplifier"
echo "    • ISO7741 - Digital isolator (patient safety)"
echo ""

section "Project Requirements (from intake YAML)"
echo "  ${BOLD}Compliance:${NC} IEC 60601-1, ISO 13485, FDA Class II, RoHS"
echo "  ${BOLD}Quality:${NC} IPC Class 3 (highest reliability)"
echo "  ${BOLD}Quantity:${NC} 50 units"
echo "  ${BOLD}Budget:${NC} \$15,000 total"
echo "  ${BOLD}Lead Time:${NC} 21 days maximum"
echo "  ${BOLD}Brokers:${NC} NOT allowed (authorized distributors only)"
echo "  ${BOLD}Critical Parts:${NC} U1, U2, U3, U5, U6, J2"
echo ""

explain "Let's look at the BOM CSV file:"

show_command "head -15 demo/neurolink_bom.csv"
run_and_show "head -15 demo/neurolink_bom.csv"

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6: Process BOM - Intake & Enrichment
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 6: Process BOM - The Agent Pipeline"

explain "Now we'll run the full agent pipeline on this BOM."
detail "This is the core functionality - three AI agents review each part."
echo ""

section "The Agent Pipeline"
echo "  ${WHITE}┌────────────┐   ┌────────────┐${NC}"
echo "  ${WHITE}│   INTAKE   │ → │  ENRICH    │${NC}"
echo "  ${WHITE}│ Parse BOM  │   │ Get Offers │${NC}"
echo "  ${WHITE}└────────────┘   └────────────┘${NC}"
echo "                               │"
echo "               ┌───────────────┼───────────────┐"
echo "               ▼               ▼               ▼"
echo "  ${WHITE}┌────────────┐   ┌────────────┐   ┌────────────┐${NC}"
echo "  ${WHITE}│ ENGINEERING│   │  SOURCING  │   │  FINANCE   │${NC}  ${CYAN}(PARALLEL)${NC}"
echo "  ${WHITE}│   REVIEW   │   │   REVIEW   │   │   REVIEW   │${NC}"
echo "  ${WHITE}└────────────┘   └────────────┘   └────────────┘${NC}"
echo "               └───────────────┼───────────────┘"
echo "                               ▼"
echo "                    ${WHITE}┌────────────────┐${NC}"
echo "                    ${WHITE}│ FINAL DECISION │${NC}"
echo "                    ${WHITE}│   (aggregates) │${NC}"
echo "                    ${WHITE}└────────────────┘${NC}"
echo "                               │"
echo "                               ▼"
echo "                    ${WHITE}┌────────────────┐${NC}"
echo "                    ${WHITE}│    COMPLETE    │${NC}"
echo "                    ${WHITE}└────────────────┘${NC}"
echo ""

explain "Each agent has a specific role:"
echo ""
echo "  ${CYAN}EngineeringAgent:${NC} (runs in parallel)"
detail "  Checks compliance (RoHS, IEC 60601-1), preferred manufacturers,"
detail "  part lifecycle (EOL warnings), and engineering notes from intake."
echo ""
echo "  ${CYAN}SourcingAgent:${NC} (runs in parallel)"
detail "  Evaluates suppliers (trust, broker policy), lead times,"
detail "  stock availability, and selects best offer."
echo ""
echo "  ${CYAN}FinanceAgent:${NC} (runs in parallel)"
detail "  Verifies budget constraints, analyzes price breaks,"
detail "  tracks cumulative spend across all parts."
echo ""
echo "  ${CYAN}FinalDecisionAgent:${NC} (aggregates all inputs)"
detail "  Synthesizes all agent outputs, resolves conflicts,"
detail "  makes final APPROVED/REJECTED decision with comprehensive rationale."
echo ""

show_api "POST http://localhost:8000/projects/upload-and-process"
show_command "uv run sourcing process demo/neurolink_bom.csv --intake demo/neurolink_intake.yaml"

explain "This will take 1-2 minutes as agents reason through each part..."
echo ""

wait_for_user

echo -e "${YELLOW}Running agent pipeline (watch for agent reasoning)...${NC}"
echo ""
run_and_show "uv run sourcing process demo/neurolink_bom.csv --intake demo/neurolink_intake.yaml"

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 7: View Results
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 7: View Project Results"

explain "The project is now stored in the database. Let's view the results."

show_api "GET http://localhost:8000/projects"
show_command "uv run sourcing status"

run_and_show "uv run sourcing status"

# Get project ID
PROJECT_ID=$(curl -s http://localhost:8000/projects | python3 -c "import sys,json; projects=json.load(sys.stdin); print(projects[-1]['project_id'] if projects else 'none')" 2>/dev/null || echo "")

if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "none" ]; then
    echo ""
    explain "Let's get detailed status for project: ${BOLD}$PROJECT_ID${NC}"

    show_api "GET http://localhost:8000/projects/$PROJECT_ID"
    show_command "uv run sourcing status $PROJECT_ID"

    run_and_show "uv run sourcing status $PROJECT_ID"
fi

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 8: Agent Reasoning Trace
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 8: Agent Reasoning Trace"

explain "Every agent decision is logged with full reasoning."
detail "This provides an audit trail and helps understand why parts were approved/rejected."

show_api "GET http://localhost:8000/projects/$PROJECT_ID/trace"
show_command "uv run sourcing trace $PROJECT_ID"

explain "The trace shows:"
detail "• Step number and name"
detail "• Which agent made the decision"
detail "• The reasoning (truncated for display)"
detail "• Data sources referenced"
detail "• Timestamp"
echo ""

if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "none" ]; then
    run_and_show "uv run sourcing trace $PROJECT_ID | head -100"
    echo ""
    echo -e "${DIM}(Showing first 100 lines - run without | head to see full trace)${NC}"
fi

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 9: Modify Knowledge Base
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 9: Modify Knowledge Base"

explain "Knowledge base changes persist and affect future processing."
detail "Let's simulate discovering a quality issue with a capacitor."

section "Scenario: Quality Issue Discovered"
echo "  We received a batch of GRM188R71H104KA93D capacitors with"
echo "  delamination issues. We need to:"
echo "    1. Ban the problematic part"
echo "    2. Add an approved automotive-grade alternate"

echo ""
explain "Banning a part:"

show_api "POST http://localhost:8000/knowledge/parts/GRM188R71H104KA93D/ban"
show_command "uv run sourcing kb parts ban 'GRM188R71H104KA93D' --reason 'Delamination issues in recent batches'"

run_and_show "uv run sourcing kb parts ban 'GRM188R71H104KA93D' --reason 'Delamination issues in recent batches'"

echo ""
explain "Adding an approved alternate:"

show_api "POST http://localhost:8000/knowledge/parts/GRM188R71H104KA93D/alternates"
show_command "uv run sourcing kb parts alternate 'GRM188R71H104KA93D' 'GRM188R71H104MA93D' --reason 'Automotive grade replacement'"

run_and_show "uv run sourcing kb parts alternate 'GRM188R71H104KA93D' 'GRM188R71H104MA93D' --reason 'Automotive grade replacement'"

echo ""
explain "Viewing updated part knowledge:"

show_command "uv run sourcing kb parts show GRM188R71H104KA93D"

run_and_show "uv run sourcing kb parts show 'GRM188R71H104KA93D'"

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 10: Modify Supplier Trust
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 10: Modify Supplier Trust"

explain "Supplier trust levels affect agent sourcing decisions."
detail "Higher trust suppliers are preferred when offers are similar."

section "Scenario: Delivery Issues"
echo "  Mouser has had some recent delivery delays."
echo "  We'll downgrade their trust from 'high' to 'medium'."

show_api "POST http://localhost:8000/knowledge/suppliers/mouser/trust"
show_command "uv run sourcing kb suppliers trust mouser medium --reason 'Recent delivery delays'"

run_and_show "uv run sourcing kb suppliers trust mouser medium --reason 'Recent delivery delays'"

echo ""
explain "Viewing updated supplier:"

show_command "uv run sourcing kb suppliers show mouser"

run_and_show "uv run sourcing kb suppliers show mouser"

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 11: Direct API Access
# ═══════════════════════════════════════════════════════════════════════════════

banner "Step 11: Direct API Access"

explain "Everything the CLI does can be done via direct API calls."
detail "This enables integration with web UIs, scripts, and other tools."

section "API Endpoints Summary"
echo "  ${CYAN}Projects:${NC}"
echo "    GET  /projects                    List all projects"
echo "    GET  /projects/{id}               Get project details"
echo "    GET  /projects/{id}/trace         Get execution trace"
echo "    POST /projects                    Create project (form data)"
echo "    POST /projects/upload-and-process Upload BOM and process"
echo ""
echo "  ${CYAN}Knowledge:${NC}"
echo "    GET  /knowledge/parts             List parts"
echo "    GET  /knowledge/parts/{mpn}       Get part details"
echo "    POST /knowledge/parts/{mpn}/ban   Ban a part"
echo "    POST /knowledge/suppliers         Create supplier"
echo "    POST /knowledge/suppliers/{id}/trust  Set trust level"
echo ""

explain "Example: Getting project as raw JSON:"

show_command "curl -s http://localhost:8000/projects/$PROJECT_ID | python3 -m json.tool | head -40"

if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "none" ]; then
    run_and_show "curl -s http://localhost:8000/projects/$PROJECT_ID | python3 -m json.tool | head -40"
    echo -e "${DIM}(truncated)${NC}"
fi

wait_for_user

# ═══════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════════

banner "Demo Complete!"

echo -e "${GREEN}✓${NC} You've walked through the complete BOM Agent system!"
echo ""
section "What We Covered"
echo "  ${GREEN}✓${NC} System architecture (CLI → API → Stores → Agents)"
echo "  ${GREEN}✓${NC} Health check and API endpoints"
echo "  ${GREEN}✓${NC} Knowledge base: suppliers and parts"
echo "  ${GREEN}✓${NC} BOM processing through parallel agent pipeline"
echo "  ${GREEN}✓${NC} Final Decision agent aggregating all inputs"
echo "  ${GREEN}✓${NC} Agent reasoning and audit trace"
echo "  ${GREEN}✓${NC} Modifying knowledge (ban parts, add alternates)"
echo "  ${GREEN}✓${NC} Supplier trust management"
echo "  ${GREEN}✓${NC} Direct REST API access"
echo ""

section "Try Next"
echo "  ${CYAN}Interactive Chat:${NC}"
echo "    uv run sourcing chat"
echo ""
echo "  ${CYAN}Re-process with Updated Knowledge:${NC}"
echo "    uv run sourcing process demo/neurolink_bom.csv --intake demo/neurolink_intake.yaml"
echo "    (The banned capacitor should now trigger different behavior)"
echo ""
echo "  ${CYAN}Read the HITL Design:${NC}"
echo "    cat docs/HITL_DESIGN.md"
echo "    (Human-in-the-loop approval workflow - not yet implemented)"
echo ""

section "Files Reference"
echo "  demo/neurolink_bom.csv       Sample BOM (23 components)"
echo "  demo/neurolink_intake.yaml   Project requirements"
echo "  demo/DEMO_WALKTHROUGH.md     Manual walkthrough guide"
echo "  docs/DESIGN.md               System design document"
echo "  docs/HITL_DESIGN.md          HITL workflow design"
echo ""

echo -e "${BLUE}Thanks for walking through the demo!${NC}"
echo ""

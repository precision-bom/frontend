# PrecisionBOM Feature Deck

> Slides extracted from Features and Internals pages for presentations

---

## Slide 1: Title

```
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║                         P R E C I S I O N                              ║
║                             B O M                                      ║
║                                                                        ║
║            Precision Sourcing for Precision Engineering                ║
║                                                                        ║
║  ──────────────────────────────────────────────────────────────────    ║
║                                                                        ║
║              BUILT FOR ENGINEERS WHO SPEAK IN MPNs                     ║
║                                                                        ║
║  Upload your BOM, get supplier-qualified parts with AI-powered         ║
║  suggestions. Real-time DigiKey data. Live market intelligence         ║
║  via Apify. Transparent reasoning. Export-ready results.               ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

## Slide 2: Real-Time Inventory

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 01 REAL-TIME INVENTORY                                                  │
└─────────────────────────────────────────────────────────────────────────┘

Direct API integration with DigiKey means you're always seeing live data.
No cached results from yesterday. No stale pricing. The stock count you
see is the stock count that exists right now.

● Live stock levels updated every request
● Price breaks at every quantity tier
● Lead time visibility for backordered items
● Factory stock vs distributor stock breakdown

┌────────────────────────────────────────┐
│  API_RESPONSE // DigiKey Live          │
└────────────────────────────────────────┘
{
  "mpn": "STM32F405RGT6",
  "manufacturer": "STMicroelectronics",
  "stock": {
    "digikey": 4847,
    "factory": 12000
  },
  "pricing": [
    { "qty": 1, "unit": 11.42 },
    { "qty": 10, "unit": 10.28 },
    { "qty": 100, "unit": 8.85 }
  ],
  "leadTime": "In Stock"
}
```

---

## Slide 3: AI-Powered Suggestions

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 02 AI-POWERED SUGGESTIONS                                               │
└─────────────────────────────────────────────────────────────────────────┘

Our AI doesn't just find exact matches. It analyzes your BOM and suggests
alternatives based on availability, pricing tiers, and specifications.
Every suggestion comes with reasoning you can audit.

● Alternate parts with equivalent specs
● Quantity optimization for price breaks
● Vendor consolidation recommendations
● Risk flags for sole-source or EOL parts
● Transparent reasoning for every suggestion

┌────────────────────────────────────────┐
│  AI_REASONING // Claude Analysis       │
└────────────────────────────────────────┘

[COST_OPTIMIZATION]
Increasing order quantity from 50 to 100 units drops unit price
from $2.34 to $1.87 — 20% savings for 2x volume.

[RISK_ALERT]
Single-source part with 6-week lead time. Consider TI equivalent
TPS63020DSJR available from 3 distributors.
```

---

## Slide 4: Market Intelligence

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 03 MARKET INTELLIGENCE                                                  │
└─────────────────────────────────────────────────────────────────────────┘

Real-world supply chain data that APIs don't capture. Our Market Intel
agent scrapes news, manufacturer announcements, and trade publications
via Apify to surface shortage alerts, EOL warnings, and price trends.

● Component shortage alerts from industry news
● Manufacturer EOL and PCN announcements
● Price trend analysis from trade publications
● Supply chain risk signals in real-time
● Powered by Apify web scraping platform

┌────────────────────────────────────────┐
│  MARKET_INTEL // Apify Scraping        │
└────────────────────────────────────────┘

[SHORTAGE_ALERT]
STM32F4 series experiencing 18-week lead times due to fab
capacity constraints. Consider STM32G4 as drop-in alternative.

[EOL_WARNING]
TI announces LM317 EOL Q3 2026. Last-time-buy deadline: March 2026.
Recommended replacement: TPS7A4001.

[PRICE_TREND]
MLCC prices down 12% QoQ. Good time to stock up on 0402/0603 caps.
```

---

## Slide 5: BOM Intelligence

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 04 BOM INTELLIGENCE                                                     │
└─────────────────────────────────────────────────────────────────────────┘

Every team exports BOMs differently. Different column names, different
formats, different conventions. We handle it. Upload your CSV or Excel
and we'll figure out what's what.

● Automatic column detection (MPN, quantity, description, etc.)
● Handles multiple MPN formats and conventions
● Fuzzy matching for partial or incorrect part numbers
● Description-based search when MPN fails
● CSV, XLSX, and ODS support

┌────────────────────────────────────────┐
│  COLUMN_DETECT // Auto-mapping         │
└────────────────────────────────────────┘

INPUT:
┌──────────┬──────────┬─────┬─────────┐
│ Part #   │ Desc     │ Qty │ Ref Des │
├──────────┼──────────┼─────┼─────────┤

MAPPED:
  Part #   → MPN ✓
  Desc     → DESCRIPTION
  Qty      → QUANTITY ✓
  Ref Des  → REFERENCE

[✓] Detected 47 line items
[✓] 45 parts matched
[!] 2 parts need review
```

---

## Slide 6: Export & Integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 05 EXPORT & INTEGRATION                                                 │
└─────────────────────────────────────────────────────────────────────────┘

Once you've optimized your BOM, get it out of the tool and into your
workflow. Export to CSV for your purchasing team, or use our direct
DigiKey cart integration to skip the data entry entirely.

● Export to CSV with full decision audit trail
● Direct add-to-cart for DigiKey
● Include AI reasoning in exports
● Custom export templates (coming soon)
● API access for automation (coming soon)

┌────────────────────────────────────────┐
│  EXPORT_OPTIONS // Select Format       │
└────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [1] EXPORT CSV                          │
│     Full BOM with pricing            →  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [2] ADD TO DIGIKEY                      │
│     Direct cart integration          →  │
└─────────────────────────────────────────┘
```

---

## Slide 7: Distributor Integrations

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DISTRIBUTOR INTEGRATIONS                                               │
└─────────────────────────────────────────────────────────────────────────┘

Direct API connections to the distributors you use.

┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│  DIGIKEY   │  │   MOUSER   │  │   ARROW    │  │   NEWARK   │  │    LCSC    │
│  [ACTIVE]  │  │   [SOON]   │  │   [SOON]   │  │   [SOON]   │  │   [SOON]   │
└────────────┘  └────────────┘  └────────────┘  └────────────┘  └────────────┘

─────────────────────────────────────────────────────────────────────────────

DATA SOURCES

                              ┌────────────┐
                              │   APIFY    │
                              │[MARKET INT]│
                              └────────────┘
```

---

## Slide 8: Workflow Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│  WORKFLOW FEATURES                                                      │
└─────────────────────────────────────────────────────────────────────────┘

Tools to manage your sourcing workflow.

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│     SAVED BOMS       │  │       HISTORY        │  │    TEAM COLLAB       │
│                      │  │                      │  │                      │
│ Store and version    │  │ Track every search,  │  │ Share BOMs with team │
│ your bills of        │  │ every decision.      │  │ members. Comment on  │
│ materials. Quick     │  │ Full audit trail     │  │ part selections.     │
│ access to recent     │  │ for compliance.      │  │                      │
│ projects.            │  │                      │  │                      │
│                      │  │                      │  │                      │
│   ● AVAILABLE        │  │   ● AVAILABLE        │  │   ○ COMING_SOON      │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

---

## Slide 9: AI Agents Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  AI AGENTS // PARALLEL ANALYSIS                                         │
└─────────────────────────────────────────────────────────────────────────┘

Four specialized AI agents analyze your BOM in parallel, each with a
unique perspective.

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ [00] MARKET INTEL│  │ [01] ENGINEERING │  │  [02] SOURCING   │  │   [03] FINANCE   │
│      [APIFY]     │  │                  │  │                  │  │                  │
│                  │  │                  │  │                  │  │                  │
│ Scrapes news,    │  │ Validates parts  │  │ Evaluates supply │  │ Optimizes for    │
│ manufacturer     │  │ against          │  │ chain risk,      │  │ budget           │
│ sites, and trade │  │ compliance       │  │ checks stock,    │  │ constraints and  │
│ publications.    │  │ requirements.    │  │ suggests alts.   │  │ identifies       │
│                  │  │                  │  │                  │  │ cost savings.    │
│ • Shortage alerts│  │ • RoHS/REACH     │  │ • Lead time      │  │ • Price breaks   │
│ • EOL announce   │  │ • Lifecycle (EOL)│  │ • Multi-source   │  │ • MOQ optimize   │
│ • Price trends   │  │ • Counterfeit    │  │ • Supplier trust │  │ • Volume disc    │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘

All 4 agents run in parallel using asyncio.gather() → Final Decision Agent synthesizes results
```

---

## Slide 10: System Architecture

```
╔════════════════════════════════════════════════════════════════════════╗
║  INTERNALS v1.0 // SYSTEM ARCHITECTURE & IMPLEMENTATION                ║
║  STATUS: OPERATIONAL    BUILD: 30hrs    TESTS: 45 PASSING              ║
╚════════════════════════════════════════════════════════════════════════╝

                UNDER THE HOOD: MULTI-AGENT ARCHITECTURE

Four specialized AI agents working in parallel. Real-time supplier APIs.
Live market intelligence via Apify. Blockchain audit trails.

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Agents: 4   │  │ Parallel:   │  │ Supplier    │  │ Build Time: │
│             │  │ Yes         │  │ APIs: 3     │  │ 30h         │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## Slide 11: System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS                                       │
│                    Engineers / Procurement / Founders                    │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 16 WEB APPLICATION                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  BOM Upload  │  │ Part Search  │  │   AI Agent   │  │  Dashboard  │  │
│  │   (CSV/XLS)  │  │   Interface  │  │    Viewer    │  │   & Auth    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    API ROUTES (/api)                              │  │
│  │   parse-bom │ search-parts │ suggest-boms │ gatekeeper │ auth     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└───────────────┬─────────────────┬─────────────────┬─────────────────────┘
                │                 │                 │
       ┌────────┘                 │                 └────────┐
       ▼                          ▼                          ▼
┌─────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    NEON     │         │  PYTHON AGENT   │         │    ETHEREUM     │
│  POSTGRES   │         │    SERVICE      │         │   (ERC-7827)    │
│             │         │                 │         │                 │
│ • Users     │         │ • FastAPI       │         │ • Audit Trail   │
│ • Sessions  │         │ • CrewAI        │         │ • Version Hist  │
│ • Projects  │         │ • 3 AI Agents   │         │ • Immutable     │
└─────────────┘         └────────┬────────┘         └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌─────────┐  ┌─────────┐  ┌─────────┐
              │ DIGIKEY │  │ MOUSER  │  │OCTOPART │
              │   API   │  │   API   │  │   API   │
              └─────────┘  └─────────┘  └─────────┘

─────────────────────────────────────────────────────────────────────────
Frontend: Next.js 16  │  Backend: FastAPI  │  Database: Postgres  │  Blockchain: ERC-7827
```

---

## Slide 12: Multi-Agent Orchestration

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MULTI-AGENT ORCHESTRATION // CREWAI PARALLEL EXECUTION                 │
└─────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────────┐
                            │     BOM UPLOAD      │
                            │   (CSV + Intake)    │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │    INTAKE STEP      │
                            │  Parse & Validate   │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   ENRICHMENT STEP   │
                            │  Parallel API Calls │
                            │ DigiKey ─┬─ Mouser  │
                            │       Octopart      │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │  MARKET INTEL STEP  │
                            │   (Apify Scraping)  │
                            │ • News Sites        │
                            │ • Manufacturer URLs │
                            │ • Trade Publications│
                            └──────────┬──────────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       │                               │                               │
       ▼                               ▼                               ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   ENGINEERING   │         │    SOURCING     │         │    FINANCE      │
│     AGENT       │         │     AGENT       │         │     AGENT       │
│                 │         │  + Market Intel │         │                 │
│ • RoHS/CE/FDA   │         │ • Lead Times    │         │ • Unit Cost     │
│ • IPC Class     │         │ • Stock Levels  │         │ • MOQ/Pricing   │
│ • Lifecycle     │         │ • Supplier Risk │         │ • Budget Fit    │
│ [Pydantic Out]  │         │ [Pydantic Out]  │         │ [Pydantic Out]  │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │         asyncio.gather()  │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   FINAL DECISION    │
                          │       AGENT         │
                          │ Synthesizes all 4   │
                          │ into ranked strats  │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  BLOCKCHAIN AUDIT   │
                          │    (ERC-7827)       │
                          └─────────────────────┘

─────────────────────────────────────────────────────────────────────────
Agents: 4+1  │  Execution: Parallel  │  Intel Source: Apify  │  Framework: CrewAI
```

---

## Slide 13: Agent Specifications

```
┌─────────────────────────────────────────────────────────────────────────┐
│  AGENT SPECIFICATIONS // DEEP DIVE                                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│ [00] MARKET INTEL       │  │ [01] ENGINEERING        │
│ [APIFY]                 │  │                         │
├─────────────────────────┤  ├─────────────────────────┤
│  REAL-WORLD DATA        │  │  COMPLIANCE CHECK       │
├─────────────────────────┤  ├─────────────────────────┤
│ ✓ Shortage Alerts       │  │ ✓ RoHS 3 Status         │
│ ✓ Price Trends          │  │ ✓ REACH SVHC            │
│ ✓ Mfr News              │  │ ✓ IEC 60601-1           │
│ ✓ EOL Announce          │  │ ✓ IPC Class (1-3)       │
│ ✓ Supply Signals        │  │ ✓ Lifecycle (EOL?)      │
│ ✓ Trade News            │  │ ✓ Counterfeit Risk      │
└─────────────────────────┘  └─────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│ [02] SOURCING           │  │ [03] FINANCE            │
│                         │  │                         │
├─────────────────────────┤  ├─────────────────────────┤
│  SUPPLY CHAIN RISK      │  │  BUDGET ANALYSIS        │
├─────────────────────────┤  ├─────────────────────────┤
│ ✓ Lead Time Check       │  │ ✓ Unit Cost             │
│ ✓ Stock Levels          │  │ ✓ Extended Cost         │
│ ✓ Supplier Trust        │  │ ✓ MOQ Requirements      │
│ ✓ Multi-Source OK?      │  │ ✓ Price Breaks          │
│ ✓ Market Intel          │  │ ✓ Budget Remaining      │
│ ✓ Alt Parts Avail       │  │ ✓ Volume Discounts      │
└─────────────────────────┘  └─────────────────────────┘
```

---

## Slide 14: Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│  REQUEST LIFECYCLE // DATA FLOW                                         │
└─────────────────────────────────────────────────────────────────────────┘

  USER                    FRONTEND                   BACKEND              EXTERNAL
   │                         │                          │                    │
   │  Upload BOM.csv         │                          │                    │
   │────────────────────────▶│                          │                    │
   │                         │  POST /api/parse-bom     │                    │
   │                         │─────────────────────────▶│                    │
   │                         │  { items: [...] }        │                    │
   │                         │◀─────────────────────────│                    │
   │  Click "Analyze"        │                          │                    │
   │────────────────────────▶│                          │                    │
   │                         │  POST /projects/process  │                    │
   │                         │─────────────────────────▶│                    │
   │                         │                          │  GET /v1/search    │
   │                         │                          │───────────────────▶│
   │                         │                          │  { offers: [...] } │
   │                         │                          │◀───────────────────│
   │                         │                          │  ┌───────────────┐ │
   │                         │                          │  │AGENT PARALLEL │ │
   │                         │                          │  │EXECUTION (3x) │ │
   │                         │                          │  └───────────────┘ │
   │                         │                          │  ┌───────────────┐ │
   │                         │                          │  │FINAL DECISION │ │
   │                         │                          │  │    AGENT      │ │
   │                         │                          │  └───────────────┘ │
   │                         │  { strategies: [...] }   │                    │
   │                         │◀─────────────────────────│                    │
   │  Display Results        │                          │                    │
   │◀────────────────────────│                          │                    │

─────────────────────────────────────────────────────────────────────────
Parse Time: <1s  │  API Calls: Parallel  │  Agent Time: 30-90s  │  Total E2E: <2min
```

---

## Slide 15: Blockchain Audit Trail

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BLOCKCHAIN AUDIT TRAIL // ERC-7827 IMMUTABLE JSON STATE                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        ETHEREUM BLOCKCHAIN                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    ERC-7827 CONTRACT                             │   │
│  │                                                                  │   │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │   │
│  │   │  VERSION 1   │───▶│  VERSION 2   │───▶│  VERSION 3   │      │   │
│  │   │              │    │              │    │              │      │   │
│  │   │ {            │    │ {            │    │ {            │      │   │
│  │   │   project:   │    │   project:   │    │   project:   │      │   │
│  │   │   "NL-001",  │    │   "NL-001",  │    │   "NL-001",  │      │   │
│  │   │   items: 20, │    │   items: 20, │    │   items: 20, │      │   │
│  │   │   status:    │    │   status:    │    │   status:    │      │   │
│  │   │   "created"  │    │   "reviewed" │    │   "approved" │      │   │
│  │   │ }            │    │ }            │    │ }            │      │   │
│  │   └──────────────┘    └──────────────┘    └──────────────┘      │   │
│  │                                                                  │   │
│  │   • Full JSON state stored on-chain                             │   │
│  │   • Every version is immutable                                  │   │
│  │   • Authorized signer required for writes                       │   │
│  │   • Complete history for FDA/ISO audits                         │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

WHY BLOCKCHAIN?
├── Medical devices need FDA-auditable trails
├── Aerospace needs AS9100 compliance records
├── Can't modify or delete historical decisions
└── Timestamp proof of when decisions were made

─────────────────────────────────────────────────────────────────────────
Standard: ERC-7827  │  Network: Ethereum  │  Mutability: Append Only  │  History: Forever
```

---

## Slide 16: Tech Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TECH STACK // THE FULL PICTURE                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│ Next.js 16│  │ React 18  │  │ Tailwind  │  │TypeScript │  │  FastAPI  │  │Python 3.12│
│ Frontend  │  │ UI Library│  │  Styling  │  │ Language  │  │  Backend  │  │  Runtime  │
└───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘

┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│  CrewAI   │  │OpenAI GPT │  │   Apify   │  │ Pydantic  │  │   Neon    │  │ Ethereum  │
│  Agents   │  │    LLM    │  │Web Scrape │  │Validation │  │ Database  │  │Blockchain │
└───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘

╔═══════════════════════════════════════════════════════════════════════╗
║  BUILD STATS // HACKATHON EDITION                                     ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║     ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
║     │     30     │    │     45     │    │      3     │    │      5     │
║     │   HOURS    │    │   TESTS    │    │ SUPPLIER   │    │    AI      │
║     │  TO BUILD  │    │  PASSING   │    │   APIs     │    │  AGENTS    │
║     └────────────┘    └────────────┘    └────────────┘    └────────────┘
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## Slide 17: Tools & Sponsors - Cline

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TOOLS & SPONSORS // HOW WE SHIPPED THIS IN 30 HOURS                    │
└─────────────────────────────────────────────────────────────────────────┘

● CLINE - AI-POWERED CODE GENERATION

┌─────────────────────────────────┐
│  AI-POWERED CODE GENERATION     │
├─────────────────────────────────┤
│                                 │
│   17,149 LINES OF CODE          │
│   ════════════════════          │
│                                 │
│   4 Deployments:                │
│   ├── Next.js Frontend          │
│   ├── Python Agent Service      │
│   ├── Neon Postgres             │
│   └── Ethereum Contracts        │
│                                 │
│   Built in: 30 HOURS            │
│                                 │
└─────────────────────────────────┘

Cline helped us write production-quality TypeScript, Python, and Solidity
across 4 separate deployments. Full-stack in a weekend.
```

---

## Slide 18: Tools & Sponsors - OpenAI + CrewAI

```
● OPENAI + CREWAI - AGENT FRAMEWORK

┌─────────────────────────────────┐
│  AGENT FRAMEWORK COMPARISON     │
├─────────────────────────────────┤
│                                 │
│   We tried CrewAI's native...   │
│                                 │
│   CrewAI Default:  ~45s/agent   │
│   GPT-5.2:         ~12s/agent   │
│   ────────────────────────      │
│   Speed Gain:      3.75x FASTER │
│                                 │
│   CrewAI for orchestration      │
│   + OpenAI GPT-5.2 for infer    │
│   = Best of both worlds         │
│                                 │
└─────────────────────────────────┘

CrewAI provides excellent agent orchestration, but swapping to
OpenAI GPT-5.2 for inference gave us 3.75x speed improvement.
```

---

## Slide 19: Tools & Sponsors - Rilo

```
● RILO - LEAD ACQUISITION AUTOMATION

┌─────────────────────────────────┐
│  LEAD ACQUISITION AUTOMATION    │
├─────────────────────────────────┤
│                                 │
│   getrilo.ai                    │
│   ────────────────────────      │
│                                 │
│   ✓ Email signup workflows      │
│   ✓ LinkedIn outreach auto      │
│   ✓ Lead enrichment pipeline    │
│   ✓ Plain English → Workflows   │
│                                 │
│   "Get me signups from hardware │
│    engineers interested in BOM  │
│    optimization"                │
│                                 │
│   → Automated in minutes        │
│                                 │
└─────────────────────────────────┘

We used Rilo to generate LinkedIn and Reddit content for PrecisionBOM.
```

---

## Slide 20: Tools & Sponsors - AI Native Studio

```
● AI NATIVE STUDIO - NEXT-GEN DEV ENVIRONMENT

┌─────────────────────────────────┐
│  NEXT-GEN DEV ENVIRONMENT       │
├─────────────────────────────────┤
│                                 │
│   ainative.studio               │
│   ────────────────────────      │
│                                 │
│   Used for:                     │
│   ├── Code quality analysis     │
│   ├── AI-assisted debugging     │
│   └── Architecture exploration  │
│                                 │
└─────────────────────────────────┘

AI Native Studio helped with rapid prototyping and code quality
checks during our speed-focused hackathon development.
```

---

## Slide 21: Tools & Sponsors - Apify (Featured)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ● APIFY                                          [HACKATHON SPONSOR]   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  LIVE: MARKET INTELLIGENCE AGENT                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   apify.com - Web Scraping at Scale                                     │
│   ─────────────────────────────────                                     │
│                                                                         │
│   ┌─────────────────┐     ┌─────────────────────────────────────────┐   │
│   │  APIFY ACTORS   │────▶│  MARKET INTELLIGENCE AGENT              │   │
│   │                 │     │                                         │   │
│   │ • Web Scraper   │     │  Gathers real-world supply chain data:  │   │
│   │ • News Scraper  │     │  ├── Component shortage alerts          │   │
│   │ • Site Crawler  │     │  ├── Manufacturer news & updates        │   │
│   │                 │     │  ├── Price trend analysis               │   │
│   └─────────────────┘     │  ├── EOL/lifecycle announcements        │   │
│                           │  └── Supply chain risk signals          │   │
│                           └─────────────────────────────────────────┘   │
│                                                                         │
│   INTEGRATION FLOW:                                                     │
│   ├── BOM Upload → Extract MPNs & Manufacturers                        │
│   ├── Apify scrapes news sites, manufacturer pages, trade pubs         │
│   ├── MarketIntelAgent analyzes scraped content with LLM               │
│   ├── Generates risk alerts, shortage warnings, price trends           │
│   └── Factors real-world intel into SourcingAgent recommendations      │
│                                                                         │
│   13,000+ pre-built scrapers │ Real-time data │ Proxy rotation          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Apify powers our Market Intelligence Agent, scraping electronics news,
manufacturer announcements, and supply chain publications.
```

---

## Slide 22: Flex Summary

```
╔═══════════════════════════════════════════════════════════════════════╗
║  THE FLEX SUMMARY // WHAT WE SHIPPED                                  ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
║   │  17,149  │  │    30    │  │     4    │  │     5    │  │     6    │
║   │   LINES  │  │  HOURS   │  │  DEPLOY  │  │    AI    │  │ SPONSOR  │
║   │ OF CODE  │  │ TO BUILD │  │  MENTS   │  │  AGENTS  │  │  TOOLS   │
║   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

                      ESI x Korea Investments
                      AI Agent Hackathon 2026
```

---

## Slide 23: CTA / Contact

```
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║                   WANT TO SEE IT IN ACTION?                           ║
║                                                                       ║
║              Upload a BOM and watch the agents work.                  ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║     ┌────────────────────┐        ┌────────────────────┐              ║
║     │    TRY IT NOW   →  │        │   VIEW FEATURES    │              ║
║     └────────────────────┘        └────────────────────┘              ║
║                                                                       ║
║                        precisionbom.com                               ║
║                                                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║    Built for the ESI x Korea Investments AI Agent Hackathon 2026      ║
║                                                                       ║
║    Team: Ojas Patkar • Jacob Valdez • Mark Lubin • Kyle Smith         ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## Quick Reference: All Slides

| # | Slide | Source |
|---|-------|--------|
| 1 | Title | Features header |
| 2 | Real-Time Inventory | Features 01 |
| 3 | AI-Powered Suggestions | Features 02 |
| 4 | Market Intelligence | Features 03 |
| 5 | BOM Intelligence | Features 04 |
| 6 | Export & Integration | Features 05 |
| 7 | Distributor Integrations | Features |
| 8 | Workflow Features | Features |
| 9 | AI Agents Overview | Features |
| 10 | System Architecture | Internals header |
| 11 | System Overview Diagram | Internals |
| 12 | Multi-Agent Orchestration | Internals |
| 13 | Agent Specifications | Internals |
| 14 | Request Lifecycle | Internals |
| 15 | Blockchain Audit Trail | Internals |
| 16 | Tech Stack | Internals |
| 17 | Tools: Cline | Internals |
| 18 | Tools: OpenAI + CrewAI | Internals |
| 19 | Tools: Rilo | Internals |
| 20 | Tools: AI Native Studio | Internals |
| 21 | Tools: Apify (Featured) | Internals |
| 22 | Flex Summary | Internals |
| 23 | CTA / Contact | Both |

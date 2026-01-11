# PrecisionBOM Demo Script

## Pre-Demo Setup (Do 30 minutes before)

### 1. Start Backend Services

**Terminal 1 - Python Agent API**:
```bash
cd /Users/jacob/fun/precision-bom/precisionBOM/python-agent
uv run uvicorn bom_agent_service.main:app --reload --port 8000
```

Verify:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

**Terminal 2 - Next.js Frontend**:
```bash
cd /Users/jacob/fun/precision-bom/precisionBOM/nextjs-app
npm run dev
```

Verify: Open http://localhost:3000 in browser

### 2. Prepare Demo Data

**Option A: Full Demo (20 parts, ~90 sec processing)**
```bash
# Web UI - file at: nextjs-app/public/demo/neurolink_bom.csv
# CLI:
cd /Users/jacob/fun/precision-bom/precisionBOM/python-agent
uv run sourcing process demo/neurolink_bom.csv --intake demo/neurolink_intake.yaml
```

**Option B: Quick Demo (7 parts, ~30 sec processing) - RECOMMENDED FOR LIVE**
```bash
# Web UI - file at: nextjs-app/public/demo/quick_demo_bom.csv
# CLI:
cd /Users/jacob/fun/precision-bom/precisionBOM/python-agent
uv run sourcing process demo/quick_demo_bom.csv --intake demo/quick_demo_intake.yaml
```

Pre-process BOTH so you have results ready:
```bash
cd /Users/jacob/fun/precision-bom/precisionBOM/python-agent
uv run sourcing process demo/quick_demo_bom.csv --intake demo/quick_demo_intake.yaml
uv run sourcing process demo/neurolink_bom.csv --intake demo/neurolink_intake.yaml
```

Note the project IDs for demo (`uv run sourcing status`).

### 3. Browser Setup

- Open Chrome in guest mode (clean profile)
- Set zoom to 100%
- Hide bookmarks bar
- Close all other tabs
- Navigate to http://localhost:3000

---

## Demo Flow (90 seconds total)

### Scene 1: Landing Page (10 seconds)

**SHOW**: Landing page at http://localhost:3000

**SAY**: "This is PrecisionBOM. Let's see how it works."

**ACTION**: Point to key value props on page

---

### Scene 2: Login (5 seconds)

**ACTION**: Click "Sign In" or navigate to /login

**SAY**: "I'll log in as our demo user."

**ACTION**: Enter credentials:
- Email: demo@precisionbom.com
- Password: [whatever you set]

**ACTION**: Click Login

---

### Scene 3: Dashboard (5 seconds)

**SHOW**: User dashboard with project list

**SAY**: "Here's my project dashboard. Let's create a new sourcing project."

---

### Scene 4: Upload BOM (15 seconds)

**ACTION**: Click "New Project" or "Upload BOM"

**SAY**: "I'll upload a BOM for a medical device - the NeuroLink Mini brain-computer interface. 11 components including precision analog chips, microcontrollers, and medical-grade connectors."

**ACTION**:
1. Click upload area
2. Select `quick_demo_bom.csv` (7 parts, faster) or `neurolink_bom.csv` (20 parts, more impressive)
   - Files are in: `nextjs-app/public/demo/`
3. Show the parsed table briefly

**SAY**: "The system parses the CSV and identifies each part."

---

### Scene 5: Processing / Agent Trace (30 seconds)

**ACTION**: Start processing (click "Analyze" or equivalent)

**SAY**: "Now our three AI agents analyze this in parallel."

**SHOW**: Agent trace/processing view

**SAY**: "The Engineering agent checks compliance - this is a medical device requiring IEC 60601 and IPC Class 3. The Sourcing agent evaluates supply chain risk - checking stock levels, lead times, and supplier reliability. The Finance agent optimizes for our $15,000 prototype budget."

**ACTION**: Point to each agent's output as it appears

**SAY**: "They're reasoning about each part - the ADS1299 neural ADC is critical, so it gets extra scrutiny."

---

### Scene 6: Results / Strategies (20 seconds)

**SHOW**: Optimization results with multiple strategies

**SAY**: "The Final Decision agent synthesizes everything into ranked sourcing strategies."

**ACTION**: Point to different strategies

**SAY**: "Strategy 1 optimizes for cost - $12,400 total. Strategy 2 prioritizes lead time - everything ships in 7 days but costs more. Strategy 3 consolidates to two distributors for simpler logistics."

**ACTION**: Click on a strategy to show details

**SAY**: "Each strategy shows exactly which parts from which suppliers, with real-time pricing from DigiKey and Mouser."

---

### Scene 7: Blockchain Audit (10 seconds)

**SHOW**: Blockchain/audit trail view (if available)

**SAY**: "Every decision is recorded to an Ethereum blockchain using ERC-7827. For medical device companies, this is the audit trail FDA requires."

**ACTION**: Show transaction hash or audit record

---

### Scene 8: Wrap Up (5 seconds)

**SAY**: "What took 40 hours of manual work - done in 4 minutes. That's PrecisionBOM."

---

## Backup Demo: CLI Only

If the web UI has issues, demo via CLI:

```bash
# Terminal - run these commands
cd /Users/jacob/fun/precision-bom/precisionBOM/python-agent

# Show the BOM
echo "=== Sample BOM ==="
head sample_bom.csv

# Process it
echo "=== Processing BOM ==="
uv run sourcing process sample_bom.csv --intake project_intake.yaml

# Show status
echo "=== Project Status ==="
uv run sourcing status

# Show agent trace
echo "=== Agent Decisions ==="
uv run sourcing trace [PROJECT_ID]
```

**SAY**: "I'll show you the CLI version. Here's our BOM - 11 components for a medical device. Watch as the agents process it..."

---

## Troubleshooting

### API Not Responding
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill existing process
kill -9 [PID]

# Restart
uv run uvicorn bom_agent_service.main:app --port 8000
```

### Frontend Build Error
```bash
cd nextjs-app
rm -rf .next node_modules
npm install
npm run dev
```

### Agent Timeout
- Agents may take 60-90 seconds on first run
- Have a pre-processed project ready as backup
- Check OPENAI_API_KEY is set

### Database Issues
```bash
# Reset database
cd python-agent
rm -rf data/*.db
# Restart API server
```

---

## Demo Talking Points

**If judges ask about the agents**:
"Each agent has a specific domain. Engineering validates against compliance databases. Sourcing has knowledge of supplier reliability from historical data. Finance tracks budget constraints. They use Pydantic structured outputs so we get reliable, typed responses."

**If judges ask about accuracy**:
"We use real-time data from DigiKey and Mouser APIs. The AI can't hallucinate prices - it only works with actual supplier data. For compliance, we validate against known standards databases."

**If judges ask about the blockchain**:
"ERC-7827 is a standard for storing JSON state on-chain with full version history. Every sourcing decision - which part, which supplier, why - gets recorded immutably. This is critical for FDA audit trails in medical devices."

**If asked "what's next"**:
"Three priorities: More supplier integrations, training the agents on historical procurement data to improve recommendations, and building the alternate parts suggestion feature for when primary parts are unavailable."

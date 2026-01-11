# Quick Reference Card
*Print this or keep on phone during the event*

---

## Key Numbers
| Stat | Value |
|------|-------|
| Manual sourcing time | **40+ hours** |
| Our time | **4 minutes** |
| Market size | **$50B+** |
| Tests passing | **45** |
| Build time | **30 hours** |

---

## The Pitch (30 seconds)

> "Hardware engineers spend 40+ hours per project manually sourcing components. PrecisionBOM uses three AI agents - Engineering, Sourcing, and Finance - to analyze your BOM in parallel. Upload your BOM, get optimized sourcing strategies in minutes with real-time DigiKey/Mouser data, plus blockchain audit trails for regulated industries like medical devices."

---

## Tracks
- Hardware and Physical Products
- AI for Manufacturing
- AI Agents and MCP Systems
- Open Innovation

---

## Tech Stack
- **Frontend**: Next.js 16, React 18, Tailwind
- **AI**: CrewAI, OpenAI GPT
- **Backend**: FastAPI, Python 3.12
- **DB**: Neon Postgres, Drizzle ORM
- **Blockchain**: Ethereum ERC-7827
- **APIs**: DigiKey, Mouser, Octopart

---

## Three Agents
1. **Engineering**: Specs, compliance (RoHS, IEC 60601), counterfeit risk
2. **Sourcing**: Lead times, stock, supplier reliability, risk
3. **Finance**: Budget, pricing, volume discounts

---

## Commands to Remember

```bash
# Start Python API
cd python-agent
uv run uvicorn bom_agent_service.main:app --port 8000

# Start Next.js
cd nextjs-app
npm run dev

# Test API
curl http://localhost:8000/health

# Process BOM (CLI)
uv run sourcing process sample_bom.csv --intake project_intake.yaml

# Show results
uv run sourcing status
uv run sourcing trace [PROJECT_ID]
```

---

## Demo Flow
1. Landing page (5 sec)
2. Login (5 sec)
3. Upload BOM (15 sec)
4. Agent processing (30 sec)
5. Show strategies (20 sec)
6. Blockchain audit (10 sec)

---

## Timeline Sunday

| Time | Action |
|------|--------|
| 11:00 | Standup |
| 11:30 | Build sprint |
| 1:30 | Pitch clinic |
| **3:00** | **SUBMIT** |
| 4:00 | Demos |
| 6:00 | Awards |

---

## The Ask
1. **Pilot customers** - hardware startups, medical device companies
2. **Investment** - $250K seed for API credits + team
3. **Intros** - contract manufacturers, HAX accelerator

---

## Contact
- Email: jacob@precisionbom.com
- Phone: +1.469.968.9490
- WeChat: jvboid
- LinkedIn: jacob-f-valdez
- Site: precisionbom.com

---

## If Demo Breaks

**Plan A**: Restart API
```bash
uv run uvicorn bom_agent_service.main:app --port 8000
```

**Plan B**: CLI demo
```bash
uv run sourcing process sample_bom.csv --intake project_intake.yaml
```

**Plan C**: Show pre-recorded video

---

## Common Questions

**"How accurate?"**
> Real supplier data from APIs. Pydantic structured outputs prevent hallucination.

**"Why blockchain?"**
> FDA requires audit trails for medical devices. Immutable records.

**"Why 3 agents?"**
> Specialized expertise. Engineering compliance is different from supply chain is different from finance.

**"Business model?"**
> SaaS: $99/mo starter, $499/mo pro, plus % of savings for enterprise.

---

## Don't Say
- "It's just a prototype"
- "We're going to replace procurement"
- Anything negative about competitors
- Made-up statistics

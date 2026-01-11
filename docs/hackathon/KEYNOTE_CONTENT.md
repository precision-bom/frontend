# Keynote Presentation Content

## Source File
`~/Downloads/part-sourcing-hackathon/` - Keynote exported to HTML

## Team
- Ojas Patkar
- Jacob Valdez
- Mark Lubin
- Kyle Smith

---

## Current Slides (2 completed)

### Slide 1: Title
```
PrecisionBOM
[Logo with green crosshair]

By: Ojas Patkar, Jacob Valdez, Mark Lubin, Kyle Smith
```

### Slide 2: The Ideation (Problem)
```
The Ideation

- Bill of Materials BOMs finalization is slow and manual,
  adding days to weeks before manufacturing can even start.

- Engineers waste hours hunting datasheets and cross-checking
  parameters across multiple distributor sites.

- Part ambiguity (MPN variants, packaging, RoHS, lifecycle,
  alternates) causes rework and last-minute BOM churn.

- Manual lookup increases human error risk (wrong footprint,
  tolerance, voltage rating, temp grade), which can lead to
  costly ECOs.
```

---

## Slides to Add (6 more needed)

### Slide 3: The Solution
```
The Solution

PrecisionBOM: AI agents that automate BOM sourcing

- Upload BOM CSV -> Get optimized strategies in minutes
- Three specialized AI agents analyze in parallel:
  * Engineering: Specs, compliance, lifecycle
  * Sourcing: Lead times, stock, supplier risk
  * Finance: Budget, pricing, volume discounts
- Real-time data from DigiKey, Mouser, Octopart
- Blockchain audit trail for regulated industries
```

### Slide 4: How It Works (Architecture)
```
Multi-Agent Architecture

[Diagram showing:]
BOM Upload
    ↓
Parallel Enrichment (DigiKey / Mouser / Octopart)
    ↓
┌─────────────┬─────────────┬─────────────┐
│ Engineering │  Sourcing   │   Finance   │
│    Agent    │    Agent    │    Agent    │
└─────────────┴─────────────┴─────────────┘
    ↓
Final Decision Agent
    ↓
Blockchain Audit Trail (ERC-7827)
```

### Slide 5: Live Demo
```
[LIVE DEMO]

- Show BOM upload
- Show agent processing trace
- Show optimization strategies
- Show audit trail
```

### Slide 6: Tech Stack
```
Built in 30 hours

Frontend:    Next.js 16, React 18, Tailwind CSS
AI Agents:   CrewAI, OpenAI GPT
Backend:     FastAPI, Python 3.12
Database:    Neon Postgres, Drizzle ORM
Blockchain:  Ethereum (ERC-7827)
APIs:        DigiKey, Mouser, Octopart

45 passing tests
```

### Slide 7: Market Opportunity
```
Market Opportunity

TAM: $50B+ electronic component distribution

Target Customers:
- Hardware startups (10K+ in US)
- Contract manufacturers
- Medical device companies
- Aerospace/defense

Business Model:
- SaaS: $99/mo starter, $499/mo pro
- Plus % of optimized savings
```

### Slide 8: The Ask
```
The Ask

Looking for:
1. Pilot customers - hardware startups, medical devices
2. Investment - $250K seed for API credits + team
3. Introductions - contract manufacturers, HAX accelerator

Contact:
jacob@precisionbom.com
+1.469.968.9490
precisionbom.com
```

---

## Visual Style Guide

Based on your existing slides:

- **Background**: Dark charcoal (#333 or similar)
- **Text**: White for body, possibly light gray for secondary
- **Accent**: Green (matches the crosshair in logo)
- **Font**: Appears to be a modern sans-serif (Canela, Graphik from the fonts list)
- **Logo**: PrecisionBOM with green crosshair replacing "O"

---

## Adding Slides in Keynote

1. Open `part-sourcing-hackathon.key` (original file)
2. Duplicate Slide 2 for consistent styling
3. Replace content with text above
4. For architecture diagram: Use Keynote shapes or paste screenshot
5. Export as HTML again when done (File > Export To > HTML)

---

## Key Changes from Our Written Deck

Your problem slide uses **better language** than what I wrote. Key improvements:

| Our Version | Your Version (Better) |
|-------------|----------------------|
| "40+ hours manual sourcing" | "days to weeks before manufacturing can even start" |
| "Check compliance" | "Part ambiguity (MPN variants, packaging, RoHS, lifecycle, alternates)" |
| "Budget optimization" | "human error risk (wrong footprint, tolerance, voltage rating, temp grade)" |

**Use your wording** - it's more specific and resonates with hardware engineers.

---

## Timing for 4-Minute Pitch

| Slide | Duration | Cumulative |
|-------|----------|------------|
| 1. Title | 10 sec | 0:10 |
| 2. The Ideation | 40 sec | 0:50 |
| 3. The Solution | 30 sec | 1:20 |
| 4. Architecture | 20 sec | 1:40 |
| 5. Live Demo | 90 sec | 3:10 |
| 6. Tech Stack | 15 sec | 3:25 |
| 7. Market | 20 sec | 3:45 |
| 8. The Ask | 15 sec | 4:00 |

---

## Speaking Notes for Slide 2 (Your Problem Slide)

"Hardware sourcing is broken. BOM finalization adds days to weeks before you can even start manufacturing. Engineers waste hours hunting datasheets across DigiKey, Mouser, and Octopart.

Part ambiguity - MPN variants, packaging, RoHS status, lifecycle - causes constant rework and last-minute BOM churn. And manual lookup leads to human error: wrong footprint, wrong tolerance, wrong voltage rating. These mistakes cause costly engineering change orders.

We built PrecisionBOM to fix this."

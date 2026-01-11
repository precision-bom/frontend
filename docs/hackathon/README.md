# PrecisionBOM Hackathon Submission

**Event**: ESI x Korea Investments AI Agent, MCP & Sales Hackathon
**Dates**: January 10-11, 2026
**Location**: Frontier Tower, San Francisco

## Quick Links

| Document | Purpose |
|----------|---------|
| [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md) | What to submit and deadlines |
| [PITCH_DECK.md](./PITCH_DECK.md) | Full slide content for 3-5 min pitch |
| [FEATURE_DECK.md](./FEATURE_DECK.md) | All feature boxes as slides (23 slides) |
| [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) | Step-by-step demo walkthrough |
| [DEMO_DATA.md](./DEMO_DATA.md) | Demo CSV files and what's in them |
| [TEAM_RUNBOOK.md](./TEAM_RUNBOOK.md) | Who does what and when |
| [TALKING_POINTS.md](./TALKING_POINTS.md) | Key messages for judges/networking |
| [RECORDING_SCRIPT.md](./RECORDING_SCRIPT.md) | Script for pitch video recording |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Print-friendly card for the event |
| [KEYNOTE_CONTENT.md](./KEYNOTE_CONTENT.md) | Content for remaining Keynote slides |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | Future integrations (Apify, Rilo, AI Native) |
| [LAUNCH_VIDEO_SCRIPT.md](./LAUNCH_VIDEO_SCRIPT.md) | 4-person team video script |

## Demo Data Files

| File | Location | Parts | Use Case |
|------|----------|-------|----------|
| `quick_demo_bom.csv` | `nextjs-app/public/demo/` | 7 | **Live demo** (fast processing) |
| `neurolink_bom.csv` | `nextjs-app/public/demo/` | 20 | Video recording (more impressive) |
| `quick_demo_intake.yaml` | `python-agent/demo/` | - | Project context for quick demo |
| `neurolink_intake.yaml` | `python-agent/demo/` | - | Full project context |

## Timeline (Day 2 - Sunday Jan 11)

| Time | Activity | Action |
|------|----------|--------|
| 11:00 AM | Morning standup | Report progress, blockers |
| 11:30 AM | Build sprint 3 | Final polish, test demo |
| 1:30 PM | Pitch clinic | Practice pitch, get feedback |
| 2:30 PM | Final office hours | Last chance for help |
| **3:00 PM** | **SUBMISSION DEADLINE** | Upload video to Milgram |
| 4:00 PM | Final demos | Live presentation |
| 6:00 PM | Judging & awards | Winners announced |

## Tracks We're Competing In

- Hardware and Physical Products
- AI for Manufacturing
- AI Agents and MCP Systems
- Open Innovation

## One-Liner

> **PrecisionBOM**: AI agents that turn a messy BOM into optimized sourcing strategies in minutes, not days.

## 30-Second Pitch

"Hardware engineers spend 40+ hours per project manually sourcing components. Supply chain volatility, compliance requirements, and budget constraints make this painful. PrecisionBOM uses a multi-agent AI system - Engineering, Sourcing, Finance, and Market Intelligence agents working in parallel - to analyze your BOM, search real-time inventory from DigiKey/Mouser/Octopart, and generate optimized sourcing strategies. Our Market Intel agent uses Apify to scrape real-world supply chain news, shortage alerts, and manufacturer announcements. We also create an immutable blockchain audit trail for regulated industries like medical devices. Built this weekend with CrewAI, FastAPI, Next.js, and Apify."

## Sponsor Integrations

| Sponsor | Integration Status | Description |
|---------|-------------------|-------------|
| **Apify** | LIVE | Market Intelligence Agent - scrapes news, manufacturer sites, trade publications for supply chain insights |
| **Cline** | LIVE | AI-assisted coding - **20,944+ LoC across 134 files and 4 deployments in just 30 hours** |
| **OpenAI** | LIVE | GPT-5-nano for multi-agent inference - faster than running CrewAI agents directly with older models |
| **CrewAI** | LIVE | Multi-agent orchestration framework - Engineering, Sourcing, Finance, Market Intel agents |
| **Rilo** | LIVE | Lead acquisition automation - email signup workflows and prospect enrichment |
| **AI Native Studio** | LIVE | Rapid prototyping and code quality analysis during development |

### How We Used These Tools

**Cline** - Our secret weapon for velocity. Integrated 4 separate deployments (Next.js web app, Python agent service, Solidity blockchain contracts, and documentation) in a single 30-hour hackathon sprint. Cline helped us maintain consistency across TypeScript, Python, and Solidity codebases.

**OpenAI GPT-5-nano** - We initially tried running CrewAI agents directly with older models, but GPT-5-nano was significantly faster while maintaining quality. The speed difference was critical for real-time BOM analysis.

**Rilo** - Automated our lead capture pipeline. When users sign up via the landing page, Rilo enriches their profiles and triggers follow-up workflows.

**AI Native Studio** - Used for rapid prototyping of agent architectures and code quality validation during development.

**Apify** - Powers our Market Intelligence Agent with real-time web scraping of supply chain news, manufacturer announcements, and shortage alerts.

## Team

- **Ojas Patkar**
- **Jacob Valdez** - jacob@precisionbom.com | +1.469.968.9490 | WeChat: jvboid
- **Mark Lubin**
- **Kyle Smith**

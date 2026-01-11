# PrecisionBOM Launch Video Script

**Duration**: 4 minutes
**Format**: Multi-speaker with screen recordings
**Participants**: Ojas Patkar, Jacob Valdez, Mark Lubin, Kyle Smith

---

## Pre-Production Checklist

- [ ] Quiet recording space for each person
- [ ] Good lighting (natural light or ring light)
- [ ] Clean backgrounds or virtual backgrounds
- [ ] Screen recording software ready (OBS, Loom, or QuickTime)
- [ ] Demo environment tested and working
- [ ] Everyone has reviewed their lines

---

## Video Structure

| Section | Speaker | Duration | Type |
|---------|---------|----------|------|
| Hook | Ojas | 15 sec | Talking head |
| Problem | Jacob | 30 sec | Talking head |
| Solution Intro | Mark | 20 sec | Talking head |
| Demo | Kyle + Jacob | 90 sec | Screen share |
| Tech Deep-Dive | Ojas | 30 sec | Talking head + diagram |
| Market & Ask | Mark | 30 sec | Talking head |
| Closing | All four | 15 sec | Group shot or split screen |

**Total: 4 minutes**

---

## SCRIPT

### SCENE 1: Hook (Ojas) - 0:00-0:15

**[Ojas on camera, energetic]**

> "What if I told you that hardware engineers spend over 40 hours just sourcing components for a single project? 40 hours of tab-switching between DigiKey, Mouser, and Octopart. 40 hours of spreadsheet hell.
>
> We built something that does it in 4 minutes."

**[TRANSITION: PrecisionBOM logo animation]**

---

### SCENE 2: The Problem (Jacob) - 0:15-0:45

**[Jacob on camera, conversational tone]**

> "I'm Jacob, and I've lived this pain. BOM finalization is slow and manual - it adds days, sometimes weeks before manufacturing can even start.
>
> Engineers waste hours hunting datasheets and cross-checking parameters across multiple distributor sites. Part ambiguity - MPN variants, packaging options, RoHS status, lifecycle states - causes constant rework and last-minute BOM churn.
>
> And manual lookup? It leads to human error. Wrong footprint. Wrong tolerance. Wrong voltage rating. These mistakes cause costly engineering change orders.
>
> For regulated industries like medical devices, you also need audit trails. Every sourcing decision has to be documented for FDA compliance.
>
> There was no single tool that solved all of this. Until now."

---

### SCENE 3: Solution Introduction (Mark) - 0:45-1:05

**[Mark on camera, confident]**

> "I'm Mark. Let me introduce PrecisionBOM.
>
> You upload your BOM - that's it. Just a CSV with your part numbers.
>
> Our system uses three AI agents working in parallel. The Engineering agent validates specs and compliance. The Sourcing agent evaluates supply chain risk. The Finance agent optimizes for budget.
>
> They synthesize their analysis into ranked sourcing strategies. And every decision gets recorded to a blockchain for audit trails.
>
> Kyle, want to show them how it actually works?"

---

### SCENE 4: Live Demo (Kyle narrating, Jacob's screen) - 1:05-2:35

**[Screen recording with Kyle doing voiceover]**

**Kyle:**
> "Absolutely. Here's PrecisionBOM in action."

**[Show landing page - 5 seconds]**

> "This is our landing page. Clean, focused, tells you exactly what we do."

**[Click Get Started, show login - 5 seconds]**

> "Let's log in as our demo user."

**[Navigate to Upload page - 5 seconds]**

> "Here's the upload interface. I'm going to drop in a real BOM - this is for a medical device called NeuroLink Mini. 20 components including microcontrollers, sensors, and passives."

**[Upload CSV, show processing - 30 seconds]**

> "Watch this. As soon as I upload, our system kicks off. It's querying DigiKey, Mouser, and Octopart in parallel to get real-time pricing and availability.
>
> Now the agents are analyzing. You can see the trace here - Engineering is checking RoHS compliance and lifecycle status. Sourcing is evaluating lead times and stock levels. Finance is calculating total costs across different strategies."

**[Jacob takes over narration:]**

> "This is the key innovation - three specialized agents with different expertise, running concurrently. It's like having a senior electronics engineer, a supply chain manager, and a procurement specialist all reviewing your BOM at the same time."

**[Show results page - 20 seconds]**

**Kyle:**
> "And here are our results. Three optimization strategies ranked by score. The 'Balanced' strategy gets the highest score - it balances cost, risk, and lead time. We also have a 'Budget' option that minimizes cost, and a 'Low Risk' option for critical projects."

**[Click into strategy details - 15 seconds]**

> "Each strategy shows exactly which supplier to use for each part, the unit price, quantity in stock, and lead time. No guesswork."

**[Show blockchain audit - 10 seconds]**

> "And here's the blockchain record. Every decision is hashed and stored on Ethereum using ERC-7827. For medical device companies, this is your FDA audit trail, built in."

---

### SCENE 5: Technical Deep-Dive (Ojas) - 2:35-3:05

**[Ojas on camera, with architecture diagram overlay]**

> "I'm Ojas, let me give you a quick look under the hood.
>
> We built this in 30 hours using a modern stack. Next.js 16 on the frontend with React Server Components. FastAPI and Python 3.12 on the backend.
>
> The magic happens in our multi-agent system powered by CrewAI and OpenAI's GPT. Each agent has a specialized prompt and tool set. They run asynchronously using Python's asyncio, so we get true parallelism.
>
> The output uses Pydantic structured schemas - this means the AI can't hallucinate invalid data. Every field is validated against expected types and constraints.
>
> 45 passing tests. Real supplier API integrations. Production-ready architecture.
>
> We even used Cline to help us write over 17,000 lines of code across four separate deployments."

**[Show diagram: BOM -> Enrichment -> Agents -> Decision -> Blockchain]**

---

### SCENE 6: Market & The Ask (Mark) - 3:05-3:35

**[Mark on camera]**

> "The electronic components distribution market is over $50 billion. Every hardware company - startups, contract manufacturers, medical device makers, aerospace - they all have this pain.
>
> Current tools like Arena and Aligni are manual. Octopart is search-only, no optimization. We're the first AI-native solution with multi-agent optimization AND blockchain audit trails.
>
> We're looking for three things:
>
> **One**: Pilot customers. If you're building hardware, especially in regulated industries, let's talk.
>
> **Two**: Seed investment. $250K to expand our API integrations and grow the team.
>
> **Three**: Introductions to contract manufacturers and hardware accelerators like HAX."

---

### SCENE 7: Closing (All Four) - 3:35-3:50

**[Split screen or group shot of all four]**

**Jacob:**
> "I'm Jacob."

**Ojas:**
> "Ojas."

**Mark:**
> "Mark."

**Kyle:**
> "And Kyle."

**All together or Jacob solo:**
> "We're PrecisionBOM. Precision sourcing for precision engineering."

**Jacob:**
> "Find us at precisionbom.com or reach out directly - jacob@precisionbom.com."

**[End card with logo, website, contact info - 10 seconds]**

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                       PrecisionBOM                            ║
║          Precision Sourcing for Precision Engineering         ║
║                                                               ║
║                     precisionbom.com                          ║
║                                                               ║
║                  jacob@precisionbom.com                       ║
║                    +1.469.968.9490                            ║
║                                                               ║
║     Ojas Patkar  |  Jacob Valdez  |  Mark Lubin  |  Kyle Smith║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Recording Tips

### For Talking Head Sections
- Look directly at camera lens, not the screen
- Speak slightly slower than normal conversation
- Use hand gestures naturally
- Keep energy consistent across all speakers

### For Demo Section
- Practice the demo flow 3x before recording
- Use keyboard shortcuts, not mouse (faster)
- Have backup plan if API is slow (pre-recorded fallback)
- Kyle: pause slightly between actions so viewers can follow

### For Editing
- Add subtle background music (royalty-free, upbeat but not distracting)
- Use quick transitions (0.3 sec cross-dissolves)
- Add lower-third name cards when each person first appears
- Highlight key metrics with text overlays:
  - "40 hours → 4 minutes"
  - "3 AI agents in parallel"
  - "$50B+ market"
  - "Built in 30 hours"

---

## Backup: If Someone Can't Record

If any team member is unavailable:

**Ojas unavailable:**
- Kyle takes Hook
- Jacob takes Tech Deep-Dive

**Jacob unavailable:**
- Mark takes Problem section
- Ojas does demo narration

**Mark unavailable:**
- Jacob takes Solution Intro
- Ojas takes Market & Ask

**Kyle unavailable:**
- Jacob does full demo solo

---

## Audio Sync Points

For editing multiple recordings together:

1. Everyone claps once at the start of their recording
2. This creates a visual spike in audio waveform
3. Use clap to sync clips in editor
4. Or use countdown: "3, 2, 1, [start speaking]"

---

## Equipment Recommendations

**Minimum viable:**
- Phone with good camera (front-facing)
- Natural lighting from window
- Quiet room
- Free editing: iMovie, DaVinci Resolve, or CapCut

**Better quality:**
- Webcam or DSLR
- Ring light or softbox
- External mic (AirPods work)
- Loom Pro or OBS for screen recording

---

## File Naming Convention

When everyone sends their clips:

```
precisionbom_01_hook_ojas.mp4
precisionbom_02_problem_jacob.mp4
precisionbom_03_solution_mark.mp4
precisionbom_04_demo_screen.mp4
precisionbom_05_techdeep_ojas.mp4
precisionbom_06_market_mark.mp4
precisionbom_07_closing_all.mp4
```

---

## Deadline

**Submit by 3:00 PM Sunday, January 11**

Upload to Milgram as specified in hackathon submission.

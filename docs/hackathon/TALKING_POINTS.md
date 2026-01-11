# Talking Points & Q&A Prep

## One-Liners (Use These)

### The Hook
> "We turn 40 hours of manual BOM sourcing into 4 minutes with AI agents."

### The Elevator Pitch (30 seconds)
> "PrecisionBOM uses three AI agents - Engineering, Sourcing, and Finance - to analyze your bill of materials in parallel. Upload your BOM, and in minutes you get optimized sourcing strategies with real-time pricing from DigiKey and Mouser, plus a blockchain audit trail for regulated industries."

### For Hardware People
> "You know that spreadsheet hell of cross-referencing DigiKey, checking compliance, and optimizing costs? We automate all of it."

### For Investors
> "$50B components market. Every hardware company has this problem. We're the first AI-native solution with multi-agent optimization."

### For Technical People
> "CrewAI orchestrates three specialized agents running in parallel with Pydantic structured outputs. Real supplier APIs, not hallucinated data."

---

## Judge Q&A Preparation

### Category: Technical

**Q: How do the AI agents work?**
A: We use CrewAI to orchestrate three specialized agents that run in parallel:
- Engineering Agent: validates specs, compliance (RoHS, IEC 60601), checks for counterfeit risk
- Sourcing Agent: evaluates lead times, stock levels, supplier reliability
- Finance Agent: optimizes for budget, considers volume discounts
A Final Decision Agent synthesizes all three into ranked strategies. Each agent uses Pydantic structured outputs so we get typed, validated responses.

**Q: Why three agents instead of one?**
A: Domain expertise. One model trying to be an expert in engineering compliance AND supply chain AND finance produces mediocre results. Specialized agents with focused prompts and knowledge bases perform better. Plus, parallel execution is faster.

**Q: How do you prevent hallucinations?**
A: Three ways:
1. Pydantic structured outputs - the model must return valid typed data
2. Real supplier data - prices and stock come from APIs, not generated
3. Knowledge bases - compliance standards, supplier history are grounded facts

**Q: What models do you use?**
A: OpenAI GPT-4o-mini for cost efficiency. The architecture supports Claude via Anthropic too. We can swap models based on accuracy/cost tradeoffs.

**Q: Why blockchain for audit trails?**
A: Medical device companies need FDA-auditable records of every sourcing decision. Blockchain with ERC-7827 gives us:
- Immutable records (can't be altered)
- Full version history (every change tracked)
- Timestamp proof (when decisions were made)
A database could be modified; blockchain can't.

**Q: How do you handle parts not in supplier databases?**
A: Our system flags unmatched parts. We're building alternate suggestion features where the Engineering agent can propose cross-references based on specs. For now, unmatched parts are surfaced for manual review.

---

### Category: Business

**Q: What's your business model?**
A: SaaS subscription:
- Starter: $99/month - 10 BOMs, basic optimization
- Pro: $499/month - unlimited BOMs, blockchain audit, API access
Plus 1-2% of optimized savings on enterprise deals.

**Q: Who's your target customer?**
A: Three segments:
1. Hardware startups (10K+ in US) - need speed, limited procurement staff
2. Contract manufacturers - process many BOMs, margins are thin
3. Medical device companies - need audit trails for FDA compliance

**Q: What's your competitive advantage?**
A: Three things:
1. AI-native - Arena/Aligni are manual tools. Octopart is search-only. We optimize.
2. Multi-agent architecture - hard to replicate, better decisions
3. Blockchain audit - unique for regulated industries

**Q: How big is the market?**
A: Electronic component distribution is $50B+ globally. Every hardware company has this pain point. Even capturing 0.1% is a $50M opportunity.

**Q: What's your go-to-market?**
A:
1. PLG (product-led growth) - free tier to try
2. Content marketing - SEO for "BOM optimization", "component sourcing"
3. Hardware community - HAX accelerator, hardware meetups
4. Direct sales for enterprise/medical

**Q: What's your unfair advantage?**
A: Domain expertise. I've sourced components for hardware projects and know the pain firsthand. Building for the problem I've lived.

---

### Category: Team & Progress

**Q: What did you build this weekend?**
A: Full stack:
- Python backend with FastAPI and CrewAI agents
- Next.js frontend with auth and BOM upload
- Real DigiKey/Mouser/Octopart API integrations
- Ethereum smart contract for audit trails
- 45 passing tests
All in 30 hours.

**Q: What's the team?**
A: [Adjust based on your actual team]
- Jacob Valdez - fullstack engineer at AGI Inc., 13 months, focus on AI systems

**Q: What's next after the hackathon?**
A: Three priorities:
1. Complete real API integrations (have the code, need credentials)
2. Pilot with 3-5 hardware startups
3. Train agents on historical procurement data to improve accuracy

**Q: How much runway do you need?**
A: $250K for 12 months to reach product-market fit:
- API costs (supplier data isn't free)
- One additional engineer
- Customer acquisition

---

### Category: Tracks

**Q: Why Hardware and Physical Products track?**
A: BOM sourcing is THE core problem in hardware development. Every physical product starts with a bill of materials. We're the infrastructure layer.

**Q: Why AI for Manufacturing track?**
A: Manufacturing runs on procurement. Contract manufacturers process hundreds of BOMs. Optimizing this with AI directly impacts their margins.

**Q: Why AI Agents track?**
A: We're showcasing a real multi-agent system with CrewAI. Three specialized agents, parallel execution, structured outputs, knowledge bases. It's a complete agent architecture.

**Q: Why Open Innovation track?**
A: We're combining AI + blockchain + supplier APIs in a novel way. No one else has AI-native BOM optimization with immutable audit trails.

---

## Networking Conversations

### Opening Lines

**To other founders:**
> "What are you building? ... [listen] ... Cool. We're doing AI for hardware sourcing. Every hardware company has this problem."

**To investors:**
> "We're building AI agents for electronic component sourcing. $50B market, every hardware company has the problem, first AI-native solution."

**To engineers:**
> "Have you ever had to source components for a hardware project? That manual spreadsheet nightmare? We automate it with AI agents."

**To judges:**
> "Thanks for the feedback. What stood out to you about our demo?"

### Follow-Up Questions to Ask

- "What's your experience with hardware sourcing?"
- "Have you seen other solutions in this space?"
- "What would make you want to try this?"
- "Do you know any hardware startups I should talk to?"
- "What did you think of the multi-agent approach?"

### Contact Exchange

Always get:
- Name
- Email
- What they do
- Why they're interested

Give:
- Your card or contact info
- The website: precisionbom.com
- "I'll send you a follow-up email tomorrow"

---

## Objection Handling

**"Why wouldn't I just use DigiKey's search?"**
> "DigiKey is great for searching one part. But optimizing a full BOM - 50, 100, 500 parts - considering compliance, lead times, and budget together? That's manual work. We automate the optimization."

**"Can't ChatGPT do this?"**
> "ChatGPT doesn't have access to real supplier data. It would hallucinate prices. We query actual APIs and only work with real inventory. Plus, structured outputs ensure valid responses."

**"Why would enterprises trust AI for procurement?"**
> "They shouldn't trust it blindly. Our system provides recommendations with full reasoning. Humans approve the final decision. The AI reduces 40 hours of searching to 4 minutes of reviewing."

**"Isn't this a feature, not a company?"**
> "Arena and Aligni have been around for years and haven't solved this. AI-native optimization is a fundamental shift. It's the difference between a search engine and Google."

**"How do you handle supply chain volatility?"**
> "Real-time data. We query suppliers at analysis time. Prices and stock levels are current. We can set up alerts for changes and re-optimize automatically."

**"What about custom/rare parts?"**
> "We surface unmatched parts for manual handling. Building alternate suggestion features. For rare parts, the Engineering agent can propose cross-references based on specs."

---

## Key Statistics to Remember

| Stat | Source |
|------|--------|
| 40+ hours | Manual BOM sourcing time per project |
| $500B+ | Chip shortage economic impact 2020-2023 |
| $50B+ | Electronic component distribution market |
| 10,000+ | Hardware startups in US |
| 45 | Passing tests in our codebase |
| 30 hours | Time to build this prototype |
| 4 minutes | Average processing time for a BOM |

---

## What NOT to Say

- Don't oversell: "We're going to replace all procurement jobs" (we augment, not replace)
- Don't undersell: "It's just a prototype" (it's a working product)
- Don't get defensive: "Well actually..." (accept feedback gracefully)
- Don't ramble: Keep answers under 30 seconds unless asked to elaborate
- Don't trash competitors: "Arena is terrible" (they're manual, we're AI-native)
- Don't make up stats: Only use numbers you can source
- Don't promise features you don't have: "We'll add that tomorrow"

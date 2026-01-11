"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Reveal on scroll animation
function RevealOnScroll({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ASCII Diagram Component
function ASCIIDiagram({
  title,
  subtitle,
  diagram,
  description,
  stats,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  diagram: string;
  description: string;
  stats?: { label: string; value: string }[];
  delay?: number;
}) {
  return (
    <RevealOnScroll delay={delay}>
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-green-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative border-4 border-white bg-black p-8 transition-all duration-300 hover:border-green-500">
          {/* Corner accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-green-500/50" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-green-500/50" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-green-500/50" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-green-500/50" />

          {/* Header */}
          <div className="mb-6">
            <pre className="font-mono text-xs text-green-500 mb-2">{`// ${subtitle}`}</pre>
            <h3 className="font-mono text-2xl font-bold text-white">{title}</h3>
          </div>

          {/* ASCII Diagram */}
          <div className="bg-neutral-950 border-2 border-neutral-800 p-6 mb-6 overflow-x-auto">
            <pre className="font-mono text-xs md:text-sm text-neutral-300 leading-relaxed whitespace-pre">
              {diagram}
            </pre>
          </div>

          {/* Description */}
          <p className="font-sans text-neutral-400 text-sm leading-relaxed mb-6">
            {description}
          </p>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="text-center p-3 border border-neutral-800">
                  <div className="font-mono text-xl text-green-500 font-bold">{stat.value}</div>
                  <div className="font-mono text-xs text-neutral-500 uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RevealOnScroll>
  );
}

// Tech Stack Badge
function TechBadge({ name, category }: { name: string; category: string }) {
  return (
    <div className="group relative">
      <div className="border-2 border-neutral-700 hover:border-green-500 bg-black p-4 transition-all duration-300">
        <pre className="font-mono text-sm text-white group-hover:text-green-400 transition-colors">{name}</pre>
        <pre className="font-mono text-xs text-neutral-600">{category}</pre>
      </div>
    </div>
  );
}

export default function InternalsPage() {
  return (
    <div className="relative bg-black text-white">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 pt-20 pb-16 border-b-4 border-white">
        <RevealOnScroll>
          <pre className="font-mono text-xs text-neutral-500 mb-6">
{`╔════════════════════════════════════════════════════════════╗
║  INTERNALS v1.0 // SYSTEM ARCHITECTURE & IMPLEMENTATION    ║
║  STATUS: OPERATIONAL    BUILD: 48hrs    TESTS: 45 PASSING  ║
╚════════════════════════════════════════════════════════════╝`}
          </pre>

          <h1 className="font-mono text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
            UNDER THE HOOD
            <br />
            <span className="text-green-500">MULTI-AGENT</span> ARCHITECTURE
          </h1>

          <p className="font-sans text-lg text-neutral-400 max-w-3xl leading-relaxed">
            Three specialized AI agents working in parallel. Real-time supplier APIs.
            Blockchain audit trails. Built for engineers who want to know exactly
            how it works.
          </p>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap gap-4">
            {[
              { label: "Agents", value: "3" },
              { label: "Parallel Exec", value: "Yes" },
              { label: "Supplier APIs", value: "3" },
              { label: "Build Time", value: "48h" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 border-2 border-neutral-700">
                <span className="font-mono text-green-500 text-sm">{stat.value}</span>
                <span className="font-mono text-neutral-500 text-xs uppercase">{stat.label}</span>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </header>

      {/* System Overview */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <ASCIIDiagram
          delay={100}
          title="SYSTEM OVERVIEW"
          subtitle="HIGH-LEVEL ARCHITECTURE"
          diagram={`
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
`}
          description="Full-stack architecture with Next.js frontend, Python agent service for AI orchestration,
          PostgreSQL for persistence, and Ethereum for immutable audit trails. All supplier APIs are queried
          in parallel for real-time inventory data."
          stats={[
            { label: "Frontend", value: "Next.js 16" },
            { label: "Backend", value: "FastAPI" },
            { label: "Database", value: "Postgres" },
            { label: "Blockchain", value: "ERC-7827" },
          ]}
        />
      </section>

      {/* Multi-Agent Architecture */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <ASCIIDiagram
          delay={100}
          title="MULTI-AGENT ORCHESTRATION"
          subtitle="CREWAI PARALLEL EXECUTION"
          diagram={`
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
                              │                     │
                              │ DigiKey ─┬─ Mouser  │
                              │          │          │
                              │       Octopart      │
                              └──────────┬──────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         │                               │                               │
         ▼                               ▼                               ▼
┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐
│   ENGINEERING   │           │    SOURCING     │           │    FINANCE      │
│     AGENT       │           │     AGENT       │           │     AGENT       │
│                 │           │                 │           │                 │
│ • RoHS/CE/FDA   │           │ • Lead Times    │           │ • Unit Cost     │
│ • IPC Class     │           │ • Stock Levels  │           │ • MOQ/Pricing   │
│ • Lifecycle     │           │ • Supplier Risk │           │ • Budget Fit    │
│ • Counterfeit   │           │ • Alternates    │           │ • Volume Disc   │
│                 │           │                 │           │                 │
│ [Pydantic Out]  │           │ [Pydantic Out]  │           │ [Pydantic Out]  │
└────────┬────────┘           └────────┬────────┘           └────────┬────────┘
         │                             │                             │
         │         asyncio.gather()    │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   FINAL DECISION    │
                            │       AGENT         │
                            │                     │
                            │ Synthesizes all 3   │
                            │ perspectives into   │
                            │ ranked strategies   │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │  BLOCKCHAIN AUDIT   │
                            │    (ERC-7827)       │
                            └─────────────────────┘
`}
          description="Three specialized agents run in TRUE parallel using asyncio.gather(). Each agent
          outputs structured Pydantic models - no hallucination possible. The Final Decision Agent
          synthesizes Engineering (compliance), Sourcing (supply chain), and Finance (budget)
          perspectives into actionable, ranked sourcing strategies."
          stats={[
            { label: "Agents", value: "3+1" },
            { label: "Execution", value: "Parallel" },
            { label: "Output", value: "Pydantic" },
            { label: "Framework", value: "CrewAI" },
          ]}
        />
      </section>

      {/* Agent Details */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <RevealOnScroll delay={100}>
          <pre className="font-mono text-xs text-neutral-500 mb-8">
{`┌────────────────────────────────────────┐
│  AGENT SPECIFICATIONS // DEEP DIVE     │
└────────────────────────────────────────┘`}
          </pre>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Engineering Agent */}
            <div className="border-4 border-white hover:border-green-500 transition-all duration-300 p-6 group">
              <pre className="font-mono text-green-500 text-sm mb-4">[01] ENGINEERING</pre>
              <pre className="font-mono text-xs text-neutral-400 mb-4 whitespace-pre-wrap">
{`┌─────────────────────┐
│  COMPLIANCE CHECK   │
├─────────────────────┤
│ ✓ RoHS 3 Status     │
│ ✓ REACH SVHC        │
│ ✓ IEC 60601-1       │
│ ✓ IPC Class (1-3)   │
│ ✓ Lifecycle (EOL?)  │
│ ✓ Counterfeit Risk  │
└─────────────────────┘`}
              </pre>
              <p className="font-sans text-sm text-neutral-500">
                Validates every part against compliance databases. Flags EOL, NRND, and counterfeit risks.
              </p>
            </div>

            {/* Sourcing Agent */}
            <div className="border-4 border-white hover:border-green-500 transition-all duration-300 p-6 group">
              <pre className="font-mono text-green-500 text-sm mb-4">[02] SOURCING</pre>
              <pre className="font-mono text-xs text-neutral-400 mb-4 whitespace-pre-wrap">
{`┌─────────────────────┐
│  SUPPLY CHAIN RISK  │
├─────────────────────┤
│ ✓ Lead Time Check   │
│ ✓ Stock Levels      │
│ ✓ Supplier Trust    │
│ ✓ Multi-Source OK?  │
│ ✓ Broker Policy     │
│ ✓ Alt Parts Avail   │
└─────────────────────┘`}
              </pre>
              <p className="font-sans text-sm text-neutral-500">
                Evaluates supply chain risk, checks stock across distributors, suggests alternates.
              </p>
            </div>

            {/* Finance Agent */}
            <div className="border-4 border-white hover:border-green-500 transition-all duration-300 p-6 group">
              <pre className="font-mono text-green-500 text-sm mb-4">[03] FINANCE</pre>
              <pre className="font-mono text-xs text-neutral-400 mb-4 whitespace-pre-wrap">
{`┌─────────────────────┐
│  BUDGET ANALYSIS    │
├─────────────────────┤
│ ✓ Unit Cost         │
│ ✓ Extended Cost     │
│ ✓ MOQ Requirements  │
│ ✓ Price Breaks      │
│ ✓ Budget Remaining  │
│ ✓ Volume Discounts  │
└─────────────────────┘`}
              </pre>
              <p className="font-sans text-sm text-neutral-500">
                Optimizes for budget constraints, identifies price breaks, tracks total spend.
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Data Flow */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <ASCIIDiagram
          delay={100}
          title="REQUEST LIFECYCLE"
          subtitle="DATA FLOW // SINGLE BOM ANALYSIS"
          diagram={`
  USER                    FRONTEND                   BACKEND                  EXTERNAL
   │                         │                          │                        │
   │  Upload BOM.csv         │                          │                        │
   │────────────────────────▶│                          │                        │
   │                         │                          │                        │
   │                         │  POST /api/parse-bom     │                        │
   │                         │─────────────────────────▶│                        │
   │                         │                          │                        │
   │                         │  { items: [...] }        │                        │
   │                         │◀─────────────────────────│                        │
   │                         │                          │                        │
   │  Click "Analyze"        │                          │                        │
   │────────────────────────▶│                          │                        │
   │                         │                          │                        │
   │                         │  POST /projects/process  │                        │
   │                         │─────────────────────────▶│                        │
   │                         │                          │                        │
   │                         │                          │  GET /v1/search (x3)   │
   │                         │                          │───────────────────────▶│
   │                         │                          │                        │
   │                         │                          │  { offers: [...] }     │
   │                         │                          │◀───────────────────────│
   │                         │                          │                        │
   │                         │                          │  ┌─────────────────┐   │
   │                         │                          │  │ AGENT PARALLEL  │   │
   │                         │                          │  │ EXECUTION (3x)  │   │
   │                         │                          │  └─────────────────┘   │
   │                         │                          │                        │
   │                         │                          │  ┌─────────────────┐   │
   │                         │                          │  │ FINAL DECISION  │   │
   │                         │                          │  │     AGENT       │   │
   │                         │                          │  └─────────────────┘   │
   │                         │                          │                        │
   │                         │  { strategies: [...] }   │                        │
   │                         │◀─────────────────────────│                        │
   │                         │                          │                        │
   │  Display Results        │                          │                        │
   │◀────────────────────────│                          │                        │
   │                         │                          │                        │
`}
          description="A single BOM analysis triggers parallel API calls to all configured suppliers,
          then runs three AI agents concurrently. The Final Decision Agent synthesizes results
          into ranked strategies. Typical latency: 30-90 seconds depending on BOM size."
          stats={[
            { label: "Parse Time", value: "<1s" },
            { label: "API Calls", value: "Parallel" },
            { label: "Agent Time", value: "30-90s" },
            { label: "Total E2E", value: "<2min" },
          ]}
        />
      </section>

      {/* Blockchain Audit */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <ASCIIDiagram
          delay={100}
          title="BLOCKCHAIN AUDIT TRAIL"
          subtitle="ERC-7827 // IMMUTABLE JSON STATE"
          diagram={`
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
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

WHY BLOCKCHAIN?
├── Medical devices need FDA-auditable trails
├── Aerospace needs AS9100 compliance records
├── Can't modify or delete historical decisions
└── Timestamp proof of when decisions were made
`}
          description="Every sourcing decision is recorded to Ethereum using ERC-7827 (JSON contracts with
          Value Version Control). Each state change creates a new immutable version. Perfect for
          regulated industries that need audit trails for FDA, ISO 13485, or AS9100 compliance."
          stats={[
            { label: "Standard", value: "ERC-7827" },
            { label: "Network", value: "Ethereum" },
            { label: "Mutability", value: "Append Only" },
            { label: "History", value: "Forever" },
          ]}
        />
      </section>

      {/* Tech Stack */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <RevealOnScroll delay={100}>
          <pre className="font-mono text-xs text-neutral-500 mb-8">
{`┌────────────────────────────────────────┐
│  TECH STACK // THE FULL PICTURE        │
└────────────────────────────────────────┘`}
          </pre>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            <TechBadge name="Next.js 16" category="Frontend" />
            <TechBadge name="React 18" category="UI Library" />
            <TechBadge name="Tailwind" category="Styling" />
            <TechBadge name="TypeScript" category="Language" />
            <TechBadge name="FastAPI" category="Backend" />
            <TechBadge name="Python 3.12" category="Runtime" />
            <TechBadge name="CrewAI" category="Agents" />
            <TechBadge name="OpenAI GPT" category="LLM" />
            <TechBadge name="Pydantic" category="Validation" />
            <TechBadge name="Neon" category="Database" />
            <TechBadge name="Drizzle" category="ORM" />
            <TechBadge name="Ethereum" category="Blockchain" />
          </div>

          {/* Build stats */}
          <div className="border-4 border-green-500 bg-green-950/20 p-8">
            <pre className="font-mono text-green-500 text-sm mb-6">
{`╔═══════════════════════════════════════════════════════════════╗
║  BUILD STATS // HACKATHON EDITION                             ║
╚═══════════════════════════════════════════════════════════════╝`}
            </pre>

            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="font-mono text-4xl text-green-400 font-bold">48</div>
                <div className="font-mono text-sm text-neutral-400">HOURS TO BUILD</div>
              </div>
              <div>
                <div className="font-mono text-4xl text-green-400 font-bold">45</div>
                <div className="font-mono text-sm text-neutral-400">TESTS PASSING</div>
              </div>
              <div>
                <div className="font-mono text-4xl text-green-400 font-bold">3</div>
                <div className="font-mono text-sm text-neutral-400">SUPPLIER APIs</div>
              </div>
              <div>
                <div className="font-mono text-4xl text-green-400 font-bold">4</div>
                <div className="font-mono text-sm text-neutral-400">AI AGENTS</div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Code Samples */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <RevealOnScroll delay={100}>
          <pre className="font-mono text-xs text-neutral-500 mb-8">
{`┌────────────────────────────────────────┐
│  CODE SAMPLES // SEE HOW IT WORKS      │
└────────────────────────────────────────┘`}
          </pre>

          <div className="space-y-8">
            {/* Agent Definition */}
            <div className="border-4 border-white hover:border-green-500 transition-all duration-300">
              <div className="border-b-2 border-neutral-800 px-6 py-3 flex items-center justify-between">
                <pre className="font-mono text-xs text-green-500">agents/engineering.py</pre>
                <span className="font-mono text-xs text-neutral-600">CrewAI Agent Definition</span>
              </div>
              <pre className="font-mono text-xs text-neutral-300 p-6 overflow-x-auto">
{`class EngineeringAgent:
    """Validates technical specs and compliance requirements."""

    def create_agent(self) -> Agent:
        return Agent(
            role="Senior Electronics Engineer",
            goal="Validate parts meet technical and compliance requirements",
            backstory="""You are a senior electronics engineer with 15 years
            of experience in medical device design. You are meticulous about
            compliance (RoHS, IEC 60601, FDA) and lifecycle status.""",
            llm=self.llm,
            verbose=True,
        )

    async def evaluate_batch(
        self,
        items: list[BOMLineItem],
        intake: ProjectIntake
    ) -> list[EngineeringPartDecision]:
        """Evaluate all items in parallel with structured output."""

        task = Task(
            description=self._build_prompt(items, intake),
            expected_output="Structured compliance decisions",
            output_pydantic=EngineeringPartDecision,  # <- Type-safe output
            agent=self.agent,
        )

        crew = Crew(agents=[self.agent], tasks=[task])
        result = await crew.kickoff_async()

        return result.pydantic  # Guaranteed valid Pydantic model`}
              </pre>
            </div>

            {/* Parallel Execution */}
            <div className="border-4 border-white hover:border-green-500 transition-all duration-300">
              <div className="border-b-2 border-neutral-800 px-6 py-3 flex items-center justify-between">
                <pre className="font-mono text-xs text-green-500">flows/bom_flow.py</pre>
                <span className="font-mono text-xs text-neutral-600">Parallel Agent Execution</span>
              </div>
              <pre className="font-mono text-xs text-neutral-300 p-6 overflow-x-auto">
{`async def parallel_agent_review(self, state: BOMFlowState) -> BOMFlowState:
    """Run all three agents in TRUE parallel using asyncio.gather()."""

    # Launch all agents simultaneously
    engineering_task = self.engineering_agent.evaluate_batch(
        state.items, state.intake
    )
    sourcing_task = self.sourcing_agent.evaluate_batch(
        state.items, state.intake
    )
    finance_task = self.finance_agent.evaluate_batch(
        state.items, state.intake
    )

    # Wait for all to complete (parallel, not sequential!)
    engineering, sourcing, finance = await asyncio.gather(
        engineering_task,
        sourcing_task,
        finance_task,
    )

    # Synthesize with Final Decision Agent
    final_decisions = await self.final_decision_agent.synthesize(
        engineering=engineering,
        sourcing=sourcing,
        finance=finance,
    )

    state.decisions = final_decisions
    return state`}
              </pre>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Tools & Sponsors */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-b-4 border-white">
        <RevealOnScroll delay={100}>
          <pre className="font-mono text-xs text-neutral-500 mb-8">
{`┌────────────────────────────────────────────────────────────┐
│  TOOLS & SPONSORS // HOW WE SHIPPED THIS IN 30 HOURS       │
└────────────────────────────────────────────────────────────┘`}
          </pre>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Cline */}
            <div className="border-4 border-white hover:border-green-500 transition-all duration-300 p-6 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <pre className="font-mono text-green-500 text-lg font-bold">CLINE</pre>
              </div>
              <pre className="font-mono text-xs text-neutral-400 mb-4 whitespace-pre-wrap">
{`┌─────────────────────────────────────┐
│  AI-POWERED CODE GENERATION          │
├─────────────────────────────────────┤
│                                     │
│   17,149 LINES OF CODE              │
│   ════════════════════              │
│                                     │
│   4 Deployments:                    │
│   ├── Next.js Frontend              │
│   ├── Python Agent Service          │
│   ├── Neon Postgres                 │
│   └── Ethereum Contracts            │
│                                     │
│   Built in: 30 HOURS                │
│                                     │
└─────────────────────────────────────┘`}
              </pre>
              <p className="font-sans text-sm text-neutral-500">
                Cline helped us write production-quality TypeScript, Python, and Solidity
                across 4 separate deployments. Full-stack in a weekend.
              </p>
            </div>

            {/* OpenAI + CrewAI */}
            <div className="border-4 border-white hover:border-green-500 transition-all duration-300 p-6 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <pre className="font-mono text-green-500 text-lg font-bold">OPENAI + CREWAI</pre>
              </div>
              <pre className="font-mono text-xs text-neutral-400 mb-4 whitespace-pre-wrap">
{`┌─────────────────────────────────────┐
│  AGENT FRAMEWORK COMPARISON          │
├─────────────────────────────────────┤
│                                     │
│   We tried CrewAI's native LLM...   │
│                                     │
│   CrewAI Default:  ~45s/agent       │
│   GPT-5.2:         ~12s/agent  ⚡   │
│   ────────────────────────────      │
│   Speed Gain:      3.75x FASTER     │
│                                     │
│   CrewAI for orchestration          │
│   + OpenAI GPT-5.2 for inference    │
│   = Best of both worlds             │
│                                     │
└─────────────────────────────────────┘`}
              </pre>
              <p className="font-sans text-sm text-neutral-500">
                CrewAI provides excellent agent orchestration, but swapping to
                OpenAI GPT-5.2 for inference gave us 3.75x speed improvement.
              </p>
            </div>

            {/* Rilo */}
            <div className="border-4 border-white hover:border-green-500 transition-all duration-300 p-6 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <pre className="font-mono text-green-500 text-lg font-bold">RILO</pre>
              </div>
              <pre className="font-mono text-xs text-neutral-400 mb-4 whitespace-pre-wrap">
{`┌─────────────────────────────────────┐
│  LEAD ACQUISITION AUTOMATION         │
├─────────────────────────────────────┤
│                                     │
│   getrilo.ai                        │
│   ────────────────────────────      │
│                                     │
│   ✓ Email signup workflows          │
│   ✓ LinkedIn outreach automation    │
│   ✓ Lead enrichment pipeline        │
│   ✓ Plain English → Workflows       │
│                                     │
│   "Get me signups from hardware     │
│    engineers interested in BOM      │
│    optimization"                    │
│                                     │
│   → Automated in minutes            │
│                                     │
└─────────────────────────────────────┘`}
              </pre>
              <p className="font-sans text-sm text-neutral-500">
                Rilo turned our lead acquisition from manual outreach to automated
                workflows. Describe what you want in plain English, get signups.
              </p>
            </div>

            {/* AI Native Studio */}
            <div className="border-4 border-white hover:border-green-500 transition-all duration-300 p-6 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <pre className="font-mono text-green-500 text-lg font-bold">AI NATIVE STUDIO</pre>
              </div>
              <pre className="font-mono text-xs text-neutral-400 mb-4 whitespace-pre-wrap">
{`┌─────────────────────────────────────┐
│  NEXT-GEN DEV ENVIRONMENT            │
├─────────────────────────────────────┤
│                                     │
│   ainative.studio                   │
│   ────────────────────────────      │
│                                     │
│   Used for:                         │
│   ├── Rapid prototyping             │
│   ├── Code quality analysis         │
│   ├── AI-assisted debugging         │
│   └── Architecture exploration      │
│                                     │
│   Rating: ⭐ 4.9/5 (127 reviews)    │
│                                     │
│   "Quantum-enhanced code analysis"  │
│                                     │
└─────────────────────────────────────┘`}
              </pre>
              <p className="font-sans text-sm text-neutral-500">
                AI Native Studio helped with rapid prototyping and code quality
                checks during our speed-focused hackathon development.
              </p>
            </div>
          </div>

          {/* Apify Integration - Coming Soon */}
          <div className="border-4 border-dashed border-neutral-700 hover:border-green-500/50 transition-all duration-300 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                <pre className="font-mono text-yellow-500 text-lg font-bold">APIFY INTEGRATION</pre>
                <span className="font-mono text-xs text-neutral-600 border border-neutral-700 px-2 py-1">[ROADMAP]</span>
              </div>
            </div>
            <pre className="font-mono text-xs text-neutral-500 mb-6 whitespace-pre-wrap">
{`┌─────────────────────────────────────────────────────────────────────────┐
│  PLANNED: REAL-TIME SUPPLIER SCRAPING                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   apify.com - Web Scraping at Scale                                     │
│   ─────────────────────────────────                                     │
│                                                                         │
│   Current State:          Planned Integration:                          │
│   ───────────────         ────────────────────                          │
│   DigiKey API ────────►   DigiKey API + Scraper Fallback                │
│   Mouser API  ────────►   Mouser API + Scraper Fallback                 │
│   Octopart API ───────►   Octopart + Direct Manufacturer Scraping       │
│                                                                         │
│   NEW CAPABILITIES:                                                     │
│   ├── Scrape manufacturer sites directly (TI, STM, Murata)             │
│   ├── Monitor competitor pricing in real-time                          │
│   ├── Extract datasheets and compliance docs automatically             │
│   ├── Track inventory across 50+ regional distributors                 │
│   └── Anti-blocking proxy rotation for reliable data                   │
│                                                                         │
│   13,000+ pre-built scrapers in Apify marketplace                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘`}
            </pre>
            <p className="font-sans text-sm text-neutral-500">
              Next phase: Integrate Apify for comprehensive supplier scraping when APIs
              are unavailable or rate-limited. Direct manufacturer data extraction
              for parts not in distributor catalogs.
            </p>
          </div>

          {/* Stats Summary */}
          <div className="mt-12 border-4 border-green-500 bg-green-950/20 p-8">
            <pre className="font-mono text-green-500 text-sm mb-6 text-center">
{`╔═══════════════════════════════════════════════════════════════╗
║  THE FLEX SUMMARY // WHAT WE SHIPPED                          ║
╚═══════════════════════════════════════════════════════════════╝`}
            </pre>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              <div>
                <div className="font-mono text-3xl text-green-400 font-bold">17,149</div>
                <div className="font-mono text-xs text-neutral-400">LINES OF CODE</div>
              </div>
              <div>
                <div className="font-mono text-3xl text-green-400 font-bold">30</div>
                <div className="font-mono text-xs text-neutral-400">HOURS TO BUILD</div>
              </div>
              <div>
                <div className="font-mono text-3xl text-green-400 font-bold">4</div>
                <div className="font-mono text-xs text-neutral-400">DEPLOYMENTS</div>
              </div>
              <div>
                <div className="font-mono text-3xl text-green-400 font-bold">3.75x</div>
                <div className="font-mono text-xs text-neutral-400">SPEED GAIN</div>
              </div>
              <div>
                <div className="font-mono text-3xl text-green-400 font-bold">5</div>
                <div className="font-mono text-xs text-neutral-400">AI TOOLS USED</div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <RevealOnScroll delay={100}>
          <div className="relative group">
            <div className="absolute inset-0 bg-green-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative border-4 border-white p-12 text-center transition-all duration-300 hover:border-green-500">
              <pre className="absolute top-4 left-4 font-mono text-green-500/50 text-xs animate-pulse">╔══</pre>
              <pre className="absolute top-4 right-4 font-mono text-green-500/50 text-xs animate-pulse">══╗</pre>
              <pre className="absolute bottom-4 left-4 font-mono text-green-500/50 text-xs animate-pulse">╚══</pre>
              <pre className="absolute bottom-4 right-4 font-mono text-green-500/50 text-xs animate-pulse">══╝</pre>

              <pre className="font-mono text-white text-sm mb-6">
{`╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   WANT TO SEE IT IN ACTION?                               ║
║                                                           ║
║   Upload a BOM and watch the agents work.                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝`}
              </pre>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center px-10 py-4 text-sm font-bold bg-green-500 text-black border-4 border-green-500 hover:bg-black hover:text-green-500 transition-all duration-300 font-mono uppercase tracking-wider"
                >
                  TRY IT NOW
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center px-10 py-4 text-sm font-bold border-4 border-white text-white hover:border-green-500 hover:text-green-500 transition-all duration-300 font-mono uppercase tracking-wider"
                >
                  VIEW FEATURES
                </Link>
              </div>

              <pre className="font-mono text-neutral-600 text-xs mt-8">
{`Built for the ESI x Korea Investments AI Agent Hackathon 2026
Team: Ojas Patkar • Jacob Valdez • Mark Lubin • Kyle Smith`}
              </pre>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}

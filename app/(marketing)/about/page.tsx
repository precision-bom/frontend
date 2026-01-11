import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | PrecisionBOM",
  description: "The story behind PrecisionBOM - BOM sourcing built by engineers, for engineers",
};

export default function AboutPage() {
  return (
    <div className="bg-black text-white">
      {/* Header */}
      <header className="border-b-4 border-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <pre className="font-mono text-xs text-gray-500 mb-6">
{`┌─────────────────────────────────────────────────────────────┐
│ SECTION: ABOUT                                              │
└─────────────────────────────────────────────────────────────┘`}
          </pre>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            THE STORY<br />
            <span className="text-green-500">BEHIND THE TRACES</span>
          </h1>
        </div>
      </header>

      {/* Mission Section */}
      <section className="border-b-4 border-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-green-500">●───</span>
            <h2 className="text-xs font-bold uppercase tracking-widest">WHY WE BUILT THIS</h2>
            <span className="font-mono text-green-500 flex-1">───────────────────────────────────────────●</span>
          </div>

          <div className="max-w-3xl space-y-6">
            <p className="text-3xl font-black uppercase">
              WE BUILT THIS BECAUSE BOM SOURCING SUCKS.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Hours wasted cross-referencing distributors. Tabs upon tabs of DigiKey searches.
              Copy-pasting part numbers into spreadsheets like it&apos;s 2005.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Stock changes mid-project. Lead times shift overnight. That capacitor you spec&apos;d
              last week? Now it&apos;s 52-week backorder and you&apos;re scrambling for alternatives at 11pm
              before your Monday production meeting.
            </p>
            <div className="border-4 border-green-500 bg-black p-6">
              <pre className="font-mono text-green-500 text-xs mb-2">/* MOTIVATION */</pre>
              <p className="text-white font-bold">
                We&apos;re engineers who got tired of spreadsheet hell. So we built the tool we wished existed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe Section */}
      <section className="border-b-4 border-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-green-500">●───</span>
            <h2 className="text-xs font-bold uppercase tracking-widest">WHAT WE BELIEVE</h2>
            <span className="font-mono text-green-500 flex-1">────────────────────────────────────────────●</span>
          </div>

          <div className="grid gap-0 md:grid-cols-3">
            <BeliefCard
              number="01"
              title="YOUR TIME MATTERS"
              description="You should be designing circuits, not hunting for stock levels. The mundane stuff should be automated."
            />
            <BeliefCard
              number="02"
              title="AI AUGMENTS, NOT REPLACES"
              description="The LLM suggests and explains. You make the calls. We're not here to replace engineering judgment."
            />
            <BeliefCard
              number="03"
              title="TRANSPARENCY FIRST"
              description="See why we suggest what we suggest. Every recommendation comes with reasoning you can verify."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-b-4 border-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-green-500">●───</span>
            <h2 className="text-xs font-bold uppercase tracking-widest">HOW IT WORKS</h2>
            <span className="font-mono text-green-500 flex-1">──────────────────────────────────────────────●</span>
          </div>

          <div className="border-4 border-white p-8">
            <pre className="font-mono text-gray-500 text-xs mb-8">
{`╔════════════════════════════════════════════════════════════╗
║  SYSTEM ARCHITECTURE                                        ║
╚════════════════════════════════════════════════════════════╝`}
            </pre>

            <div className="space-y-8">
              <TechBlock
                step="01"
                title="DIGIKEY API INTEGRATION"
                description="Direct DigiKey API access for real-time pricing, stock levels, and lead times. No middlemen, no stale data."
                code="async fetchDigiKey(mpn: string)"
              />
              <div className="font-mono text-gray-600 text-center">│</div>
              <TechBlock
                step="02"
                title="LLM-POWERED ANALYSIS"
                description="Our AI disambiguates vague part descriptions, identifies compatible alternatives, and optimizes for your constraints."
                code="agent.analyze({ parts, constraints })"
              />
              <div className="font-mono text-gray-600 text-center">│</div>
              <TechBlock
                step="03"
                title="RANKED RECOMMENDATIONS"
                description="Get concrete suggestions with scores, not just raw data dumps. Each option explains the trade-offs."
                code="return suggestions.sort((a, b) => b.score - a.score)"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stack Section */}
      <section className="border-b-4 border-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-green-500">●───</span>
            <h2 className="text-xs font-bold uppercase tracking-widest">STACK</h2>
            <span className="font-mono text-green-500 flex-1">───────────────────────────────────────────────────────●</span>
          </div>

          <p className="text-gray-400 mb-8">
            We believe in being transparent about how things are built. Here&apos;s what&apos;s under the hood:
          </p>

          <div className="flex flex-wrap gap-4">
            <TechBadge>NEXT.JS 14</TechBadge>
            <TechBadge>TYPESCRIPT</TechBadge>
            <TechBadge>CLAUDE AI</TechBadge>
            <TechBadge>DIGIKEY API</TechBadge>
            <TechBadge>TAILWIND CSS</TechBadge>
            <TechBadge>VERCEL</TechBadge>
          </div>

          <p className="text-gray-600 text-sm mt-8 font-mono">
            // No black boxes. Ask us anything about the implementation.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-green-500">●───</span>
            <h2 className="text-xs font-bold uppercase tracking-widest">GET IN TOUCH</h2>
            <span className="font-mono text-green-500 flex-1">─────────────────────────────────────────────●</span>
          </div>

          <div className="border-4 border-white p-8">
            <h3 className="text-2xl font-black uppercase mb-4">
              WE WANT TO HEAR FROM YOU
            </h3>
            <p className="text-gray-400 mb-8">
              What features would make your life easier? Found a bug? Have a distributor
              you want us to add? We&apos;re all ears.
            </p>

            <div className="space-y-6">
              <a
                href="mailto:feedback@precisionbom.dev"
                className="inline-flex items-center gap-3 px-8 py-4 border-4 border-white bg-white text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                <span className="font-mono">[</span>
                feedback@precisionbom.dev
                <span className="font-mono">]</span>
              </a>

              <p className="text-gray-500 text-sm">
                Or open an issue on{" "}
                <a href="https://github.com/precisionbom" className="text-green-500 hover:text-green-400 underline">
                  GitHub
                </a>
                {" "}- we read everything.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BeliefCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="border-4 border-white p-6 hover:bg-white hover:text-black transition-colors group">
      <div className="font-mono text-green-500 text-xs mb-4 group-hover:text-green-600">[{number}]</div>
      <h3 className="font-black text-lg mb-3 uppercase">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-600">{description}</p>
    </div>
  );
}

function TechBlock({ step, title, description, code }: { step: string; title: string; description: string; code: string }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 border-4 border-green-500 flex items-center justify-center">
        <span className="text-green-500 font-mono font-bold">{step}</span>
      </div>
      <div className="flex-1">
        <h3 className="font-black text-lg mb-2 uppercase">{title}</h3>
        <p className="text-gray-400 text-sm mb-3">{description}</p>
        <code className="inline-block px-4 py-2 bg-gray-900 border-2 border-gray-700 text-green-400 text-xs font-mono">
          {code}
        </code>
      </div>
    </div>
  );
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-6 py-3 border-4 border-white text-white text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors cursor-default">
      {children}
    </span>
  );
}

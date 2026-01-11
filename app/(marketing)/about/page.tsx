import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | PrecisionBOM",
  description: "The story behind PrecisionBOM - BOM sourcing built by engineers, for engineers",
};

export default function AboutPage() {
  return (
    <div className="relative">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 pt-16 pb-12 border-b border-substrate-800">
        <div className="max-w-3xl">
          <p className="text-trace-500 text-sm mb-3 tracking-wider uppercase font-medium">
            About
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
            The story behind<br />
            <span className="text-trace-500">the traces</span>
          </h1>
        </div>
      </header>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-substrate-800">
        <div className="max-w-3xl">
          <h2 className="text-xs text-substrate-500 uppercase tracking-wider mb-6">Why we built this</h2>
          <div className="space-y-6 text-substrate-300 leading-relaxed">
            <p className="text-2xl text-white font-semibold">
              We built this because BOM sourcing sucks.
            </p>
            <p>
              Hours wasted cross-referencing distributors. Tabs upon tabs of DigiKey searches.
              Copy-pasting part numbers into spreadsheets like it&apos;s 2005.
            </p>
            <p>
              Stock changes mid-project. Lead times shift overnight. That capacitor you spec&apos;d
              last week? Now it&apos;s 52-week backorder and you&apos;re scrambling for alternatives at 11pm
              before your Monday production meeting.
            </p>
            <div className="p-4 bg-substrate-900 border-l-2 border-trace-500 rounded-r">
              <p className="text-trace-400 text-sm">
                We&apos;re engineers who got tired of spreadsheet hell. So we built the tool we wished existed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-substrate-800">
        <div className="max-w-4xl">
          <h2 className="text-xs text-substrate-500 uppercase tracking-wider mb-8">What we believe</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <BeliefCard
              number="01"
              title="Your time matters"
              description="You should be designing circuits, not hunting for stock levels. The mundane stuff should be automated."
            />
            <BeliefCard
              number="02"
              title="AI augments, not replaces"
              description="The LLM suggests and explains. You make the calls. We're not here to replace engineering judgment."
            />
            <BeliefCard
              number="03"
              title="Transparency first"
              description="See why we suggest what we suggest. Every recommendation comes with reasoning you can verify."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-substrate-800">
        <div className="max-w-4xl">
          <h2 className="text-xs text-substrate-500 uppercase tracking-wider mb-8">How it works</h2>
          <div className="bg-substrate-950 border border-substrate-800 rounded p-8">
            <div className="space-y-8">
              <TechBlock
                step="1"
                title="DigiKey API integration"
                description="Direct DigiKey API access for real-time pricing, stock levels, and lead times. No middlemen, no stale data."
                code="async fetchDigiKey(mpn: string)"
              />
              <TechBlock
                step="2"
                title="LLM-powered analysis"
                description="Our AI disambiguates vague part descriptions, identifies compatible alternatives, and optimizes for your constraints - cost, stock, or minimal distributors."
                code="agent.analyze({ parts, constraints })"
              />
              <TechBlock
                step="3"
                title="Ranked recommendations"
                description="Get concrete suggestions with scores, not just raw data dumps. Each option explains the trade-offs so you can make informed decisions fast."
                code="return suggestions.sort((a, b) => b.score - a.score)"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Built With Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-b border-substrate-800">
        <div className="max-w-4xl">
          <h2 className="text-xs text-substrate-500 uppercase tracking-wider mb-8">Stack</h2>
          <p className="text-substrate-400 mb-6">
            We believe in being transparent about how things are built. Here&apos;s what&apos;s under the hood:
          </p>
          <div className="flex flex-wrap gap-3">
            <TechBadge>Next.js 14</TechBadge>
            <TechBadge>TypeScript</TechBadge>
            <TechBadge>Claude AI</TechBadge>
            <TechBadge>DigiKey API</TechBadge>
            <TechBadge>Tailwind CSS</TechBadge>
            <TechBadge>Vercel</TechBadge>
          </div>
          <p className="text-substrate-600 text-sm mt-6">
            No black boxes. Ask us anything about the implementation.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-4xl">
          <h2 className="text-xs text-substrate-500 uppercase tracking-wider mb-8">Get in touch</h2>
          <div className="bg-substrate-950 border border-substrate-800 rounded p-8">
            <h3 className="text-2xl font-semibold text-white mb-4">
              We want to hear from you
            </h3>
            <p className="text-substrate-400 mb-6">
              What features would make your life easier? Found a bug? Have a distributor
              you want us to add? We&apos;re all ears.
            </p>
            <div className="space-y-4">
              <a
                href="mailto:feedback@precisionbom.dev"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-substrate-200 text-substrate-950 font-medium rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                feedback@precisionbom.dev
              </a>
              <p className="text-substrate-500 text-sm">
                Or open an issue on{" "}
                <a href="https://github.com/precisionbom" className="text-trace-500 hover:text-trace-400 underline">
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
    <div className="bg-substrate-950 border border-substrate-800 rounded p-6 hover:border-substrate-700 transition-colors">
      <div className="text-substrate-600 text-xs mb-3">{number}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-substrate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function TechBlock({ step, title, description, code }: { step: string; title: string; description: string; code: string }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-10 h-10 bg-substrate-900 border border-substrate-700 rounded flex items-center justify-center">
        <span className="text-white font-bold">{step}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-substrate-400 text-sm mb-3">{description}</p>
        <code className="inline-block px-3 py-1 bg-substrate-900 border border-substrate-700 rounded text-trace-400 text-xs font-mono">
          {code}
        </code>
      </div>
    </div>
  );
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-4 py-2 bg-substrate-900 border border-substrate-700 rounded-full text-substrate-300 text-sm hover:border-substrate-600 transition-colors">
      {children}
    </span>
  );
}

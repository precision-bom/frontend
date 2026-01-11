import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | PrecisionBOM",
  description: "Guidelines for acceptable use of the PrecisionBOM platform.",
};

const sections = [
  { id: "permitted-use", title: "PERMITTED USE" },
  { id: "prohibited-conduct", title: "PROHIBITED CONDUCT" },
  { id: "api-usage", title: "API USAGE LIMITS" },
  { id: "content-standards", title: "CONTENT STANDARDS" },
  { id: "enforcement", title: "ENFORCEMENT" },
  { id: "contact", title: "CONTACT" },
];

export default function AcceptableUsePage() {
  return (
    <div className="bg-black text-white">
      {/* Header */}
      <header className="border-b-4 border-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <pre className="font-mono text-xs text-gray-500 mb-6">
{`┌─────────────────────────────────────────────────────────────┐
│ DOCUMENT: ACCEPTABLE_USE_POLICY.md                          │
│ VERSION: 1.0.0                                              │
│ LAST_MODIFIED: 2025-01-10                                   │
└─────────────────────────────────────────────────────────────┘`}
          </pre>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            ACCEPTABLE<br />
            <span className="text-green-500">USE POLICY</span>
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Table of Contents */}
        <nav className="mb-12 border-4 border-white p-6">
          <pre className="font-mono text-green-500 text-xs mb-4">/* TABLE OF CONTENTS */</pre>
          <ol className="space-y-2 font-mono">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-gray-400 hover:text-green-500 hover:bg-green-500/10 transition-all duration-200 flex items-center gap-4 text-sm px-2 py-1"
                >
                  <span className="text-green-500">
                    [{String(index + 1).padStart(2, "0")}]
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Introduction */}
        <div className="mb-12 border-l-4 border-green-500 pl-6">
          <p className="text-gray-400 leading-relaxed">
            This Acceptable Use Policy governs your use of PrecisionBOM and supplements our
            Terms of Service. By using our platform, you agree to comply with these guidelines.
            Violation may result in account suspension or termination.
          </p>
        </div>

        {/* Section 1: Permitted Use */}
        <section id="permitted-use" className="mb-12 scroll-mt-20">
          <SectionHeader number="01" title="PERMITTED USE" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>PrecisionBOM is designed for legitimate business use including:</p>
            <div className="border-4 border-green-500 bg-black p-6">
              <pre className="font-mono text-green-500 text-xs mb-4">PERMITTED_ACTIVITIES = [</pre>
              {[
                "Uploading and analyzing your own Bill of Materials data",
                "Searching for component pricing and availability",
                "Using AI recommendations for sourcing decisions",
                "Exporting data for internal business use",
                "Integrating via API within published rate limits",
                "Collaborating with team members on shared projects",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 ml-4 mb-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-white">&quot;{item}&quot;,</span>
                </div>
              ))}
              <pre className="font-mono text-green-500">]</pre>
            </div>
          </div>
        </section>

        {/* Section 2: Prohibited Conduct */}
        <section id="prohibited-conduct" className="mb-12 scroll-mt-20">
          <SectionHeader number="02" title="PROHIBITED CONDUCT" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>The following activities are strictly prohibited:</p>

            <div className="border-4 border-red-500/50 p-6 bg-red-500/5">
              <pre className="font-mono text-red-500 text-xs mb-4">/* SYSTEM ABUSE */</pre>
              {[
                "Automated scraping beyond normal API usage patterns",
                "Circumventing rate limits or access controls",
                "Attempting to access accounts or data of other users",
                "Reverse engineering, decompiling, or disassembling the platform",
                "Using the service to build a competing product",
                "Reselling or redistributing platform data without authorization",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-2">
                  <span className="text-red-500 font-mono">✗</span>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="border-4 border-red-500/50 p-6 bg-red-500/5">
              <pre className="font-mono text-red-500 text-xs mb-4">/* HARMFUL ACTIVITIES */</pre>
              {[
                "Uploading malware, viruses, or malicious code",
                "Distributing spam or unsolicited communications",
                "Engaging in fraudulent or deceptive practices",
                "Interfering with platform operations or other users",
                "Violating applicable laws, regulations, or third-party rights",
                "Harassment, threats, or abuse directed at staff or users",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-2">
                  <span className="text-red-500 font-mono">✗</span>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: API Usage Limits */}
        <section id="api-usage" className="mb-12 scroll-mt-20">
          <SectionHeader number="03" title="API USAGE LIMITS" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>API access is subject to the following rate limits:</p>
            <div className="border-4 border-white p-6 font-mono text-sm">
              <pre className="text-green-500 mb-4">RATE_LIMITS = {`{`}</pre>
              <div className="ml-4 space-y-2">
                {[
                  { endpoint: "bom_upload", limit: "100 requests/hour" },
                  { endpoint: "part_search", limit: "1000 requests/hour" },
                  { endpoint: "ai_suggestions", limit: "200 requests/hour" },
                  { endpoint: "data_export", limit: "50 requests/day" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-green-500">{item.endpoint}:</span>
                    <span className="text-gray-300">&quot;{item.limit}&quot;,</span>
                  </div>
                ))}
              </div>
              <pre className="text-green-500 mt-4">{`}`}</pre>
            </div>
            <div className="border-l-4 border-green-500 pl-6">
              <p>
                Enterprise customers may request higher limits. Contact sales@precisionbom.com
                for custom API arrangements.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Content Standards */}
        <section id="content-standards" className="mb-12 scroll-mt-20">
          <SectionHeader number="04" title="CONTENT STANDARDS" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>Content uploaded to PrecisionBOM must comply with these standards:</p>
            <div className="grid gap-4">
              {[
                { key: "OWNERSHIP", val: "You must own or have rights to upload the content" },
                { key: "ACCURACY", val: "Information should be accurate to the best of your knowledge" },
                { key: "LEGALITY", val: "Content must not violate export controls or regulations" },
                { key: "PRIVACY", val: "Do not upload data containing others' personal information" },
              ].map((item, i) => (
                <div key={i} className="border-4 border-gray-800 p-4 flex items-start gap-4 hover:border-green-500 transition-all duration-200">
                  <span className="font-mono text-green-500 font-bold w-24 shrink-0">{item.key}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="border-4 border-yellow-500/50 bg-yellow-500/5 p-6">
              <pre className="font-mono text-yellow-500 text-xs mb-2">/* EXPORT CONTROLS */</pre>
              <p className="text-gray-400">
                You are responsible for ensuring your use of PrecisionBOM complies with
                applicable export control laws including ITAR, EAR, and similar regulations.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Enforcement */}
        <section id="enforcement" className="mb-12 scroll-mt-20">
          <SectionHeader number="05" title="ENFORCEMENT" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              PrecisionBOM reserves the right to investigate and take action against
              violations of this policy. Enforcement actions may include:
            </p>
            <div className="border-4 border-white p-6 font-mono text-sm">
              <pre className="text-green-500 mb-4">ENFORCEMENT_ACTIONS = [</pre>
              {[
                { action: "WARNING", desc: "Initial notice for minor violations" },
                { action: "RATE_LIMIT", desc: "Temporary reduction in API access" },
                { action: "SUSPENSION", desc: "Temporary account deactivation" },
                { action: "TERMINATION", desc: "Permanent account closure" },
                { action: "LEGAL_ACTION", desc: "Civil or criminal proceedings" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 ml-4 mb-3">
                  <span className="text-green-500 font-bold w-28">{item.action}</span>
                  <span className="text-gray-300">// {item.desc}</span>
                </div>
              ))}
              <pre className="text-green-500">]</pre>
            </div>
            <p>
              Severity of enforcement depends on the nature, frequency, and impact of violations.
              We aim to provide notice before action when feasible, but reserve the right to
              act immediately in cases of serious violation.
            </p>
          </div>
        </section>

        {/* Section 6: Contact */}
        <section id="contact" className="mb-12 scroll-mt-20">
          <SectionHeader number="06" title="CONTACT" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>To report violations or ask questions about this policy:</p>
            <div className="border-4 border-white p-6 hover:border-green-500 transition-all duration-200">
              <pre className="font-mono text-green-500 text-xs mb-4">/* CONTACT_INFO */</pre>
              <p className="text-white font-bold uppercase mb-4">PRECISIONBOM COMPLIANCE</p>
              <a
                href="mailto:abuse@precisionbom.com"
                className="inline-flex items-center gap-3 px-6 py-3 border-4 border-green-500 text-green-500 font-bold uppercase tracking-wider hover:bg-green-500 hover:text-black transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30"
              >
                abuse@precisionbom.com
              </a>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="pt-8 border-t-4 border-white flex justify-between items-center">
          <Link
            href="/security"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span>───</span>
            SECURITY
          </Link>
          <Link
            href="/dmca"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            DMCA
            <span>───</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="font-mono text-green-500"><span className="animate-pulse">●</span>───</span>
      <span className="font-mono text-green-500">[{number}]</span>
      <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
      <span className="font-mono text-green-500 flex-1 hidden md:block">────────────────────────<span className="animate-pulse">●</span></span>
    </div>
  );
}

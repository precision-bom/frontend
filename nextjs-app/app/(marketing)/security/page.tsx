import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security | PrecisionBOM",
  description: "How PrecisionBOM protects your data and maintains platform security.",
};

const sections = [
  { id: "infrastructure", title: "INFRASTRUCTURE SECURITY" },
  { id: "data-protection", title: "DATA PROTECTION" },
  { id: "authentication", title: "AUTHENTICATION" },
  { id: "compliance", title: "COMPLIANCE" },
  { id: "vulnerability", title: "VULNERABILITY DISCLOSURE" },
  { id: "contact", title: "CONTACT" },
];

export default function SecurityPage() {
  return (
    <div className="bg-black text-white">
      {/* Header */}
      <header className="border-b-4 border-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <pre className="font-mono text-xs text-gray-500 mb-6">
{`┌─────────────────────────────────────────────────────────────┐
│ DOCUMENT: SECURITY.md                                       │
│ VERSION: 1.0.0                                              │
│ LAST_MODIFIED: 2025-01-10                                   │
└─────────────────────────────────────────────────────────────┘`}
          </pre>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            <span className="text-green-500">SECURITY</span>
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
            Security is foundational to PrecisionBOM. We implement industry-standard security
            measures to protect your data and maintain the integrity of our platform. This
            document outlines our security practices and your options for responsible disclosure.
          </p>
        </div>

        {/* Section 1: Infrastructure Security */}
        <section id="infrastructure" className="mb-12 scroll-mt-20">
          <SectionHeader number="01" title="INFRASTRUCTURE SECURITY" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-white p-6 font-mono text-sm">
              <pre className="text-green-500 mb-4">INFRASTRUCTURE_STACK = {`{`}</pre>
              <div className="ml-4 space-y-2">
                {[
                  { key: "hosting", val: "Vercel Edge Network (Global CDN)" },
                  { key: "database", val: "Neon PostgreSQL (Serverless)" },
                  { key: "region", val: "US-East with automatic failover" },
                  { key: "uptime_sla", val: "99.9% availability target" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-green-500">{item.key}:</span>
                    <span className="text-gray-300">&quot;{item.val}&quot;,</span>
                  </div>
                ))}
              </div>
              <pre className="text-green-500 mt-4">{`}`}</pre>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { title: "DDoS Protection", desc: "Automatic mitigation at the edge" },
                { title: "WAF", desc: "Web Application Firewall filtering" },
                { title: "Rate Limiting", desc: "API throttling and abuse prevention" },
                { title: "Isolation", desc: "Tenant data segregation" },
              ].map((item, i) => (
                <div key={i} className="border-4 border-gray-800 p-4 hover:border-green-500 transition-all duration-200">
                  <h3 className="text-white font-bold uppercase mb-2">{item.title}</h3>
                  <p className="text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Data Protection */}
        <section id="data-protection" className="mb-12 scroll-mt-20">
          <SectionHeader number="02" title="DATA PROTECTION" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-green-500 bg-black p-6">
              <pre className="font-mono text-green-500 text-xs mb-2">/* ENCRYPTION */</pre>
              <h3 className="text-green-400 font-bold uppercase mb-2">END-TO-END PROTECTION</h3>
              <p className="text-gray-400">
                All data is encrypted in transit and at rest using industry-standard protocols.
              </p>
            </div>

            <div className="border-4 border-white p-6 font-mono text-sm">
              <pre className="text-green-500 mb-4">ENCRYPTION_PROTOCOLS = [</pre>
              {[
                "TLS 1.3 for all data in transit",
                "AES-256 encryption for data at rest",
                "bcrypt with salt for password hashing",
                "Secure key management via environment isolation",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 ml-4 mb-2">
                  <span className="text-green-500">●</span>
                  <span className="text-white">&quot;{item}&quot;,</span>
                </div>
              ))}
              <pre className="text-green-500">]</pre>
            </div>

            <div className="space-y-4">
              {[
                { label: "BACKUP", desc: "Automated daily backups with 30-day retention" },
                { label: "RETENTION", desc: "Data retained only as long as account is active" },
                { label: "DELETION", desc: "Permanent deletion within 30 days of request" },
              ].map((item, i) => (
                <div key={i} className="border-4 border-gray-800 p-4 flex items-start gap-4 hover:border-green-500 transition-all duration-200">
                  <span className="font-mono text-green-500 font-bold w-24 shrink-0">{item.label}</span>
                  <span>{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Authentication */}
        <section id="authentication" className="mb-12 scroll-mt-20">
          <SectionHeader number="03" title="AUTHENTICATION" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>Our authentication system implements multiple security layers:</p>
            <div className="border-4 border-white p-6 font-mono text-sm">
              <pre className="text-green-500 mb-4">AUTH_FEATURES = [</pre>
              {[
                "JWT tokens with short expiration (7 days)",
                "Secure HTTP-only cookies",
                "CSRF protection on all forms",
                "Password strength requirements enforced",
                "Account lockout after failed attempts",
                "Session invalidation on password change",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 ml-4 mb-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-white">&quot;{item}&quot;,</span>
                </div>
              ))}
              <pre className="text-green-500">]</pre>
            </div>
          </div>
        </section>

        {/* Section 4: Compliance */}
        <section id="compliance" className="mb-12 scroll-mt-20">
          <SectionHeader number="04" title="COMPLIANCE" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>PrecisionBOM aligns with industry security standards and regulations:</p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { standard: "SOC 2", status: "Infrastructure providers certified" },
                { standard: "GDPR", status: "Data processing compliant" },
                { standard: "CCPA", status: "California privacy rights supported" },
                { standard: "OWASP", status: "Top 10 vulnerabilities addressed" },
              ].map((item, i) => (
                <div key={i} className="border-4 border-gray-800 p-4 hover:border-green-500 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-green-500 font-bold">{item.standard}</span>
                    <span className="text-xs text-gray-600">COMPLIANT</span>
                  </div>
                  <p className="text-sm">{item.status}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Vulnerability Disclosure */}
        <section id="vulnerability" className="mb-12 scroll-mt-20">
          <SectionHeader number="05" title="VULNERABILITY DISCLOSURE" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-green-500 bg-black p-6">
              <pre className="font-mono text-green-500 text-xs mb-2">/* RESPONSIBLE DISCLOSURE */</pre>
              <h3 className="text-green-400 font-bold uppercase mb-2">REPORT SECURITY ISSUES</h3>
              <p className="text-gray-400">
                We appreciate responsible disclosure of security vulnerabilities. If you discover
                a security issue, please report it to us directly.
              </p>
            </div>

            <div className="border-4 border-white p-6">
              <pre className="font-mono text-green-500 text-xs mb-4">/* GUIDELINES */</pre>
              {[
                "Do not access, modify, or delete data belonging to other users",
                "Do not perform actions that could disrupt service availability",
                "Do not publicly disclose vulnerabilities before they are fixed",
                "Provide detailed information to help us reproduce the issue",
                "Allow reasonable time for remediation before disclosure",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <span className="text-green-500 font-mono">[{String(i + 1).padStart(2, "0")}]</span>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <p>
              We commit to acknowledging reports within 30 hours and will work with you
              to understand and address valid security concerns.
            </p>
          </div>
        </section>

        {/* Section 6: Contact */}
        <section id="contact" className="mb-12 scroll-mt-20">
          <SectionHeader number="06" title="CONTACT" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>For security concerns or vulnerability reports:</p>
            <div className="border-4 border-white p-6 hover:border-green-500 transition-all duration-200">
              <pre className="font-mono text-green-500 text-xs mb-4">/* SECURITY_CONTACT */</pre>
              <p className="text-white font-bold uppercase mb-4">PRECISIONBOM SECURITY TEAM</p>
              <a
                href="mailto:security@precisionbom.com"
                className="inline-flex items-center gap-3 px-6 py-3 border-4 border-green-500 text-green-500 font-bold uppercase tracking-wider hover:bg-green-500 hover:text-black transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30"
              >
                security@precisionbom.com
              </a>
            </div>
            <p className="text-sm text-gray-600">
              For general inquiries, please use privacy@precisionbom.com or legal@precisionbom.com.
            </p>
          </div>
        </section>

        {/* Navigation */}
        <div className="pt-8 border-t-4 border-white flex justify-between items-center">
          <Link
            href="/cookies"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span>───</span>
            COOKIE POLICY
          </Link>
          <Link
            href="/acceptable-use"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            ACCEPTABLE USE
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

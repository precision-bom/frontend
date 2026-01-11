import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | PrecisionBOM",
  description: "Terms and conditions for using the PrecisionBOM sourcing platform.",
};

const sections = [
  { id: "service-description", title: "SERVICE DESCRIPTION" },
  { id: "account-responsibilities", title: "ACCOUNT RESPONSIBILITIES" },
  { id: "acceptable-use", title: "ACCEPTABLE USE" },
  { id: "intellectual-property", title: "INTELLECTUAL PROPERTY" },
  { id: "ai-disclaimer", title: "AI-GENERATED CONTENT" },
  { id: "limitation-liability", title: "LIMITATION OF LIABILITY" },
  { id: "indemnification", title: "INDEMNIFICATION" },
  { id: "changes", title: "MODIFICATIONS" },
  { id: "governing-law", title: "GOVERNING LAW" },
  { id: "contact", title: "CONTACT" },
];

export default function TermsPage() {
  return (
    <div className="bg-black text-white">
      {/* Header */}
      <header className="border-b-4 border-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <pre className="font-mono text-xs text-gray-500 mb-6">
{`┌─────────────────────────────────────────────────────────────┐
│ DOCUMENT: TERMS_OF_SERVICE.md                               │
│ VERSION: 1.0.0                                              │
│ LAST_MODIFIED: 2025-01-10                                   │
└─────────────────────────────────────────────────────────────┘`}
          </pre>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            TERMS OF<br />
            <span className="text-green-500">SERVICE</span>
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
            By accessing or using PrecisionBOM, you agree to be bound by these Terms of Service
            and all applicable laws and regulations. If you do not agree with any of these terms,
            you are prohibited from using or accessing this platform.
          </p>
        </div>

        {/* Section 1: Service Description */}
        <section id="service-description" className="mb-12 scroll-mt-20">
          <SectionHeader number="01" title="SERVICE DESCRIPTION" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              PrecisionBOM is a Bill of Materials sourcing platform that provides:
            </p>
            <div className="border-4 border-white p-6 font-mono text-sm hover:border-green-500 transition-all duration-200">
              <pre className="text-green-500 mb-4">SERVICES = [</pre>
              {[
                "BOM file parsing and component extraction",
                "AI-powered component analysis and recommendations",
                "Real-time pricing and availability aggregation",
                "Alternative part cross-referencing",
                "Supply chain risk assessment",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 ml-4 mb-2">
                  <span className="text-green-500">●</span>
                  <span className="text-white">&quot;{item}&quot;,</span>
                </div>
              ))}
              <pre className="text-green-500">]</pre>
            </div>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of our
              services at any time without prior notice or liability.
            </p>
          </div>
        </section>

        {/* Section 2: Account Responsibilities */}
        <section id="account-responsibilities" className="mb-12 scroll-mt-20">
          <SectionHeader number="02" title="ACCOUNT RESPONSIBILITIES" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>When you create an account, you represent and warrant that:</p>
            <div className="grid gap-4">
              {[
                { key: "ACCURACY", val: "All registration information is truthful and current" },
                { key: "SECURITY", val: "You will maintain confidentiality of credentials" },
                { key: "ACTIVITY", val: "You accept responsibility for all account activity" },
                { key: "AGE", val: "You are at least 18 years of age or legal majority" },
                { key: "AUTHORITY", val: "You have authority to bind any entity you represent" },
              ].map((item, i) => (
                <div key={i} className="border-4 border-gray-800 p-4 flex items-start gap-4 hover:border-green-500 transition-all duration-200">
                  <span className="font-mono text-green-500 font-bold w-24 shrink-0">{item.key}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Acceptable Use */}
        <section id="acceptable-use" className="mb-12 scroll-mt-20">
          <SectionHeader number="03" title="ACCEPTABLE USE" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <div className="border-4 border-red-500/50 p-6 bg-red-500/5">
              <pre className="font-mono text-red-500 text-xs mb-4">/* PROHIBITED */</pre>
              {[
                "Automated scraping or data harvesting beyond normal API usage",
                "Unauthorized access to systems, accounts, or networks",
                "Collection of data for competing services",
                "Transmission of malware, viruses, or malicious code",
                "Violation of applicable laws, regulations, or third-party rights",
                "Impersonation of persons or entities",
                "Interference with platform integrity or performance",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-2">
                  <span className="text-red-500 font-mono">✗</span>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <p>
              Violation of these terms may result in immediate termination without notice or refund.
            </p>
          </div>
        </section>

        {/* Section 4: Intellectual Property */}
        <section id="intellectual-property" className="mb-12 scroll-mt-20">
          <SectionHeader number="04" title="INTELLECTUAL PROPERTY" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-green-500 bg-black p-6">
              <pre className="font-mono text-green-500 text-xs mb-2">/* YOUR DATA */</pre>
              <h3 className="text-green-400 font-bold uppercase mb-2">YOU RETAIN OWNERSHIP</h3>
              <p className="text-gray-400">
                You retain all rights, title, and interest in your BOM data and uploaded content.
                We claim no ownership over your materials.
              </p>
            </div>
            <p>
              By uploading content, you grant PrecisionBOM a limited, non-exclusive license to
              process, analyze, and display your data solely for providing services to you.
            </p>
            <p>
              The PrecisionBOM platform, including its design, code, algorithms, documentation,
              trademarks, and trade secrets, is proprietary. You may not copy, modify, distribute,
              sell, or lease any part of our platform without explicit written permission.
            </p>
          </div>
        </section>

        {/* Section 5: AI Disclaimer */}
        <section id="ai-disclaimer" className="mb-12 scroll-mt-20">
          <SectionHeader number="05" title="AI-GENERATED CONTENT" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-yellow-500/50 bg-yellow-500/5 p-6">
              <pre className="font-mono text-yellow-500 text-xs mb-2">/* WARNING */</pre>
              <h3 className="text-yellow-400 font-bold uppercase mb-2">VERIFY BEFORE USE</h3>
              <p className="text-gray-400">
                AI-generated recommendations are suggestions only. Always verify specifications,
                compatibility, and availability before making purchasing decisions.
              </p>
            </div>
            <p>You acknowledge and agree that:</p>
            <div className="space-y-3">
              {[
                "AI outputs may contain errors, inaccuracies, or hallucinations",
                "Alternative part suggestions may not be pin-compatible",
                "Pricing and availability data is subject to change without notice",
                "Final sourcing decisions remain your sole responsibility",
                "PrecisionBOM is not liable for decisions based on AI recommendations",
              ].map((item, i) => (
                <div key={i} className="border-4 border-gray-800 p-4 flex items-start gap-4 hover:border-yellow-500/50 transition-all duration-200">
                  <span className="font-mono text-yellow-500">⚠</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section id="limitation-liability" className="mb-12 scroll-mt-20">
          <SectionHeader number="06" title="LIMITATION OF LIABILITY" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRECISIONBOM SHALL NOT BE LIABLE FOR:
            </p>
            <div className="border-4 border-white p-6 font-mono text-sm">
              {[
                "Any indirect, incidental, special, consequential, or punitive damages",
                "Loss of profits, data, use, goodwill, or other intangible losses",
                "Damages resulting from unauthorized access to or alteration of data",
                "Service interruptions, bugs, viruses, or system incompatibilities",
                "Third-party conduct or content accessed through our platform",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-2">
                  <span className="text-green-500">→</span>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <p>
              OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT
              YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).
            </p>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF
              ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </div>
        </section>

        {/* Section 7: Indemnification */}
        <section id="indemnification" className="mb-12 scroll-mt-20">
          <SectionHeader number="07" title="INDEMNIFICATION" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              You agree to indemnify, defend, and hold harmless PrecisionBOM and its officers,
              directors, employees, agents, and affiliates from any claims, damages, losses,
              liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising
              from or related to:
            </p>
            <div className="border-4 border-gray-800 p-6 space-y-2">
              {[
                "Your use of the platform",
                "Your violation of these Terms",
                "Your violation of any rights of another party",
                "Your uploaded content or BOM data",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-green-500 font-mono">[{String(i + 1).padStart(2, "0")}]</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 8: Modifications */}
        <section id="changes" className="mb-12 scroll-mt-20">
          <SectionHeader number="08" title="MODIFICATIONS" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              We reserve the right to modify these Terms at any time. When we make material
              changes, we will:
            </p>
            <div className="space-y-3">
              {[
                "Update the version and modification date in the document header",
                "Notify registered users via email for material changes",
                "Post prominent notice on the platform",
              ].map((item, i) => (
                <div key={i} className="border-4 border-gray-800 p-4 flex items-start gap-4 hover:border-green-500 transition-all duration-200">
                  <span className="font-mono text-green-500">●</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p>
              Continued use of the platform after changes become effective constitutes acceptance.
              If you disagree with modifications, your sole remedy is to discontinue use.
            </p>
          </div>
        </section>

        {/* Section 9: Governing Law */}
        <section id="governing-law" className="mb-12 scroll-mt-20">
          <SectionHeader number="09" title="GOVERNING LAW" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-white p-6">
              <pre className="font-mono text-green-500 text-xs mb-4">/* JURISDICTION */</pre>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of
                the State of Delaware, United States, without regard to conflict of law principles.
              </p>
              <p>
                Any dispute arising from these Terms or use of the platform shall be resolved
                through binding arbitration in accordance with the American Arbitration Association
                rules. You waive any right to jury trial or participation in class actions.
              </p>
            </div>
            <p>
              If any provision is found unenforceable, the remaining provisions continue in
              full force. Our failure to enforce any right does not constitute waiver.
            </p>
          </div>
        </section>

        {/* Section 10: Contact */}
        <section id="contact" className="mb-12 scroll-mt-20">
          <SectionHeader number="10" title="CONTACT" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>For questions regarding these Terms of Service:</p>
            <div className="border-4 border-white p-6 hover:border-green-500 transition-all duration-200">
              <pre className="font-mono text-green-500 text-xs mb-4">/* CONTACT_INFO */</pre>
              <p className="text-white font-bold uppercase mb-4">PRECISIONBOM LEGAL</p>
              <a
                href="mailto:legal@precisionbom.com"
                className="inline-flex items-center gap-3 px-6 py-3 border-4 border-green-500 text-green-500 font-bold uppercase tracking-wider hover:bg-green-500 hover:text-black transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30"
              >
                legal@precisionbom.com
              </a>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="pt-8 border-t-4 border-white flex justify-between items-center">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span>───</span>
            PRIVACY POLICY
          </Link>
          <Link
            href="/cookies"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            COOKIE POLICY
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

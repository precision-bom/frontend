import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PrecisionBOM",
  description: "Learn how PrecisionBOM collects, uses, and protects your data.",
};

const sections = [
  { id: "information-collected", title: "INFORMATION WE COLLECT" },
  { id: "how-we-use", title: "HOW WE USE YOUR INFORMATION" },
  { id: "data-storage", title: "DATA STORAGE & SECURITY" },
  { id: "third-party", title: "THIRD-PARTY SERVICES" },
  { id: "your-rights", title: "YOUR RIGHTS" },
  { id: "cookies", title: "COOKIES" },
  { id: "contact", title: "CONTACT US" },
];

export default function PrivacyPage() {
  return (
    <div className="bg-black text-white">
      {/* Header */}
      <header className="border-b-4 border-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <pre className="font-mono text-xs text-gray-500 mb-6">
{`┌─────────────────────────────────────────────────────────────┐
│ DOCUMENT: PRIVACY_POLICY.md                                 │
│ VERSION: 1.0.0                                              │
│ LAST_MODIFIED: 2025-01-10                                   │
└─────────────────────────────────────────────────────────────┘`}
          </pre>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            PRIVACY<br />
            <span className="text-green-500">POLICY</span>
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
            At PrecisionBOM, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our BOM (Bill of Materials)
            sourcing platform. Please read this policy carefully to understand our practices regarding
            your personal data.
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <section id="information-collected" className="mb-12 scroll-mt-20">
          <SectionHeader number="01" title="INFORMATION WE COLLECT" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-gray-800 p-6 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
              <h3 className="text-white font-bold uppercase mb-2">Account Information</h3>
              <p>
                When you create an account, we collect your email address, name, and any other
                information you choose to provide. This information is used to identify you and
                provide personalized services.
              </p>
            </div>
            <div className="border-4 border-gray-800 p-6 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
              <h3 className="text-white font-bold uppercase mb-2">BOM Data</h3>
              <p>
                When you upload Bill of Materials files, we process the component data including
                part numbers, manufacturers, quantities, and specifications. This data is used to
                provide sourcing suggestions and is stored securely in your account.
              </p>
            </div>
            <div className="border-4 border-gray-800 p-6 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
              <h3 className="text-white font-bold uppercase mb-2">Usage Analytics</h3>
              <p>
                We collect anonymized usage data to understand how our platform is used and to
                improve our services. This includes page views, feature usage, search queries,
                and interaction patterns. We do not link this data to your personal identity.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Your Information */}
        <section id="how-we-use" className="mb-12 scroll-mt-20">
          <SectionHeader number="02" title="HOW WE USE YOUR INFORMATION" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-gray-800 p-6 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
              <h3 className="text-white font-bold uppercase mb-2">Providing Our Service</h3>
              <p>
                We use your BOM data to analyze components, search for availability across
                distributors, and provide intelligent sourcing recommendations. Your data enables
                us to deliver accurate pricing, availability, and alternative part suggestions.
              </p>
            </div>
            <div className="border-4 border-gray-800 p-6 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
              <h3 className="text-white font-bold uppercase mb-2">Improving Our AI</h3>
              <p>
                Aggregated and anonymized data may be used to improve our AI models and
                recommendation algorithms. We never use your identifiable data to train models
                without explicit consent.
              </p>
            </div>
            <div className="border-4 border-green-500 bg-black p-6 hover:border-green-400 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20">
              <pre className="font-mono text-green-500 text-xs mb-2">/* IMPORTANT */</pre>
              <h3 className="text-green-400 font-bold uppercase mb-2">WE DO NOT SELL YOUR DATA</h3>
              <p className="text-gray-400">
                PrecisionBOM will never sell, rent, or trade your personal information or BOM
                data to third parties for marketing purposes. Your data is yours.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Data Storage & Security */}
        <section id="data-storage" className="mb-12 scroll-mt-20">
          <SectionHeader number="03" title="DATA STORAGE & SECURITY" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              Your data is stored on secure servers with industry-standard encryption both in
              transit (TLS 1.3) and at rest (AES-256). We implement multiple layers of security
              including:
            </p>
            <div className="border-4 border-white p-6 font-mono text-sm hover:border-green-500 transition-all duration-200">
              <pre className="text-green-500 mb-4">SECURITY_MEASURES = [</pre>
              {[
                "Encrypted database storage with regular security audits",
                "Access controls and authentication mechanisms",
                "Regular backups with encrypted off-site storage",
                "Monitoring and logging for suspicious activities",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 ml-4 mb-2">
                  <span className="text-green-500 animate-pulse">●</span>
                  <span className="text-white">&quot;{item}&quot;,</span>
                </div>
              ))}
              <pre className="text-green-500">]</pre>
            </div>
            <p>
              We retain your data for as long as your account is active or as needed to provide
              services. You may request deletion of your data at any time.
            </p>
          </div>
        </section>

        {/* Section 4: Third-Party Services */}
        <section id="third-party" className="mb-12 scroll-mt-20">
          <SectionHeader number="04" title="THIRD-PARTY SERVICES" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              To provide our services, we integrate with the following third-party providers:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-4 border-gray-800 p-6 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
                <pre className="font-mono text-green-500 text-xs mb-2">// AI_PROVIDER</pre>
                <h3 className="text-white font-bold uppercase mb-2">Anthropic Claude</h3>
                <p className="text-sm">
                  We use Anthropic&apos;s Claude API to analyze BOM data and provide intelligent recommendations.
                  Component data is processed through their API but is not used to train their
                  models per our enterprise agreement.
                </p>
              </div>
              <div className="border-4 border-gray-800 p-6 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
                <pre className="font-mono text-green-500 text-xs mb-2">// DISTRIBUTOR_API</pre>
                <h3 className="text-white font-bold uppercase mb-2">DigiKey API</h3>
                <p className="text-sm">
                  We query DigiKey&apos;s API to retrieve real-time pricing and availability. Only the
                  necessary part numbers and specifications are shared to fulfill search requests.
                </p>
              </div>
            </div>
            <p>
              Each third-party service has its own privacy policy governing their use of data.
              We carefully select partners who maintain strong privacy and security practices.
            </p>
          </div>
        </section>

        {/* Section 5: Your Rights */}
        <section id="your-rights" className="mb-12 scroll-mt-20">
          <SectionHeader number="05" title="YOUR RIGHTS" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              You have the following rights regarding your personal data:
            </p>
            <div className="border-4 border-white p-6 font-mono hover:border-green-500 transition-all duration-200">
              {[
                { label: "ACCESS", desc: "Request a copy of all personal data we hold about you" },
                { label: "DELETE", desc: "Request deletion of your account and all associated data" },
                { label: "EXPORT", desc: "Download your BOM data in standard formats (CSV, JSON)" },
                { label: "CORRECT", desc: "Update or correct any inaccurate personal information" },
                { label: "OBJECT", desc: "Opt out of certain data processing activities" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 mb-3 last:mb-0 group">
                  <span className="text-green-500 font-bold w-20 shrink-0 group-hover:text-green-400 transition-colors">[{item.label}]</span>
                  <span className="text-gray-300 group-hover:text-white transition-colors">{item.desc}</span>
                </div>
              ))}
            </div>
            <p>
              To exercise any of these rights, please contact us using the information provided
              below. We will respond to your request within 30 days.
            </p>
          </div>
        </section>

        {/* Section 6: Cookies */}
        <section id="cookies" className="mb-12 scroll-mt-20">
          <SectionHeader number="06" title="COOKIES" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              We use minimal, functional cookies that are essential for the operation of our
              platform. These include:
            </p>
            <div className="space-y-4">
              {[
                { name: "SESSION", desc: "To keep you logged in during your visit" },
                { name: "SECURITY", desc: "To protect against cross-site request forgery" },
                { name: "PREFS", desc: "To remember your display and interface preferences" },
              ].map((item, i) => (
                <div key={i} className="border-4 border-gray-800 p-4 flex items-start gap-4 hover:border-green-500 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
                  <span className="font-mono text-green-500 font-bold w-24 shrink-0">{item.name}</span>
                  <span>{item.desc}</span>
                </div>
              ))}
            </div>
            <div className="border-l-4 border-green-500 pl-6">
              <p>
                We do not use tracking cookies, advertising cookies, or third-party analytics
                cookies that follow you across websites. Your browsing activity on PrecisionBOM
                stays on PrecisionBOM.
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: Contact */}
        <section id="contact" className="mb-12 scroll-mt-20">
          <SectionHeader number="07" title="CONTACT US" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              If you have questions about this Privacy Policy, your personal data, or would like
              to exercise your rights, please contact us:
            </p>
            <div className="border-4 border-white p-6 hover:border-green-500 transition-all duration-200">
              <pre className="font-mono text-green-500 text-xs mb-4">/* CONTACT_INFO */</pre>
              <p className="text-white font-bold uppercase mb-4">PRECISIONBOM PRIVACY TEAM</p>
              <a
                href="mailto:privacy@precisionbom.com"
                className="inline-flex items-center gap-3 px-6 py-3 border-4 border-green-500 text-green-500 font-bold uppercase tracking-wider hover:bg-green-500 hover:text-black transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30"
              >
                privacy@precisionbom.com
              </a>
            </div>
            <p>
              We will respond to all legitimate requests within 30 days. Occasionally it may take
              longer if your request is particularly complex or you have made multiple requests.
            </p>
          </div>
        </section>

        {/* Navigation */}
        <div className="pt-8 border-t-4 border-white flex justify-between items-center">
          <Link
            href="/dmca"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span>───</span>
            DMCA
          </Link>
          <Link
            href="/terms"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            TERMS OF SERVICE
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

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PrecisionBOM",
  description: "Learn how PrecisionBOM collects, uses, and protects your data.",
};

const sections = [
  { id: "information-collected", title: "Information We Collect" },
  { id: "how-we-use", title: "How We Use Your Information" },
  { id: "data-storage", title: "Data Storage & Security" },
  { id: "third-party", title: "Third-Party Services" },
  { id: "your-rights", title: "Your Rights" },
  { id: "cookies", title: "Cookies" },
  { id: "contact", title: "Contact Us" },
];

export default function PrivacyPage() {
  return (
    <div className="relative">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 pt-16 pb-12 border-b border-substrate-800">
        <p className="text-trace-500 text-sm mb-3 tracking-wider uppercase font-medium">
          Legal
        </p>
        <h1 className="text-4xl font-bold text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-substrate-500 text-sm">
          Last updated: January 10, 2025
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Table of Contents */}
        <nav className="mb-12 p-6 rounded border border-substrate-800 bg-substrate-950">
          <h2 className="text-sm font-medium text-white mb-4">
            Table of Contents
          </h2>
          <ol className="space-y-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-substrate-400 hover:text-white transition-colors flex items-center gap-3 text-sm"
                >
                  <span className="text-substrate-600 font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Introduction */}
        <div className="mb-12">
          <p className="text-substrate-400 leading-relaxed">
            At PrecisionBOM, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our BOM (Bill of Materials)
            sourcing platform. Please read this policy carefully to understand our practices regarding
            your personal data.
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <section id="information-collected" className="mb-12 scroll-mt-20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-trace-500 text-sm font-mono">01</span>
            Information We Collect
          </h2>
          <div className="space-y-6 text-substrate-400 leading-relaxed">
            <div>
              <h3 className="text-white font-medium mb-2">Account Information</h3>
              <p>
                When you create an account, we collect your email address, name, and any other
                information you choose to provide. This information is used to identify you and
                provide personalized services.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">BOM Data</h3>
              <p>
                When you upload Bill of Materials files, we process the component data including
                part numbers, manufacturers, quantities, and specifications. This data is used to
                provide sourcing suggestions and is stored securely in your account.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Usage Analytics</h3>
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
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-trace-500 text-sm font-mono">02</span>
            How We Use Your Information
          </h2>
          <div className="space-y-6 text-substrate-400 leading-relaxed">
            <div>
              <h3 className="text-white font-medium mb-2">Providing Our Service</h3>
              <p>
                We use your BOM data to analyze components, search for availability across
                distributors, and provide intelligent sourcing recommendations. Your data enables
                us to deliver accurate pricing, availability, and alternative part suggestions.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Improving Our AI</h3>
              <p>
                Aggregated and anonymized data may be used to improve our AI models and
                recommendation algorithms. We never use your identifiable data to train models
                without explicit consent.
              </p>
            </div>
            <div className="p-4 bg-substrate-900 border-l-2 border-trace-500 rounded-r">
              <h3 className="text-trace-400 font-medium mb-2">We Do Not Sell Your Data</h3>
              <p className="text-substrate-400">
                PrecisionBOM will never sell, rent, or trade your personal information or BOM
                data to third parties for marketing purposes. Your data is yours.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Data Storage & Security */}
        <section id="data-storage" className="mb-12 scroll-mt-20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-trace-500 text-sm font-mono">03</span>
            Data Storage & Security
          </h2>
          <div className="space-y-4 text-substrate-400 leading-relaxed">
            <p>
              Your data is stored on secure servers with industry-standard encryption both in
              transit (TLS 1.3) and at rest (AES-256). We implement multiple layers of security
              including:
            </p>
            <ul className="space-y-2 ml-4">
              {[
                "Encrypted database storage with regular security audits",
                "Access controls and authentication mechanisms",
                "Regular backups with encrypted off-site storage",
                "Monitoring and logging for suspicious activities",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-trace-500 mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              We retain your data for as long as your account is active or as needed to provide
              services. You may request deletion of your data at any time.
            </p>
          </div>
        </section>

        {/* Section 4: Third-Party Services */}
        <section id="third-party" className="mb-12 scroll-mt-20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-trace-500 text-sm font-mono">04</span>
            Third-Party Services
          </h2>
          <div className="space-y-6 text-substrate-400 leading-relaxed">
            <p>
              To provide our services, we integrate with the following third-party providers:
            </p>
            <div>
              <h3 className="text-white font-medium mb-2">AI Analysis (Anthropic Claude)</h3>
              <p>
                We use Anthropic&apos;s Claude API to analyze BOM data and provide intelligent recommendations.
                Component data is processed through their API but is not used to train their
                models per our enterprise agreement.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">DigiKey API</h3>
              <p>
                We query DigiKey&apos;s API to retrieve real-time pricing and availability. Only the
                necessary part numbers and specifications are shared to fulfill search requests.
              </p>
            </div>
            <p>
              Each third-party service has its own privacy policy governing their use of data.
              We carefully select partners who maintain strong privacy and security practices.
            </p>
          </div>
        </section>

        {/* Section 5: Your Rights */}
        <section id="your-rights" className="mb-12 scroll-mt-20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-trace-500 text-sm font-mono">05</span>
            Your Rights
          </h2>
          <div className="space-y-4 text-substrate-400 leading-relaxed">
            <p>
              You have the following rights regarding your personal data:
            </p>
            <ul className="space-y-3 ml-4">
              {[
                { label: "ACCESS", desc: "Request a copy of all personal data we hold about you" },
                { label: "DELETE", desc: "Request deletion of your account and all associated data" },
                { label: "EXPORT", desc: "Download your BOM data in standard formats (CSV, JSON)" },
                { label: "CORRECT", desc: "Update or correct any inaccurate personal information" },
                { label: "OBJECT", desc: "Opt out of certain data processing activities" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-trace-500 text-xs font-mono font-medium shrink-0 w-16">{item.label}</span>
                  <span>{item.desc}</span>
                </li>
              ))}
            </ul>
            <p>
              To exercise any of these rights, please contact us using the information provided
              below. We will respond to your request within 30 days.
            </p>
          </div>
        </section>

        {/* Section 6: Cookies */}
        <section id="cookies" className="mb-12 scroll-mt-20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-trace-500 text-sm font-mono">06</span>
            Cookies
          </h2>
          <div className="space-y-4 text-substrate-400 leading-relaxed">
            <p>
              We use minimal, functional cookies that are essential for the operation of our
              platform. These include:
            </p>
            <ul className="space-y-2 ml-4">
              {[
                { name: "Session cookies", desc: "To keep you logged in during your visit" },
                { name: "Security cookies", desc: "To protect against cross-site request forgery" },
                { name: "Preference cookies", desc: "To remember your display and interface preferences" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-trace-500 mt-2 shrink-0" />
                  <span><strong className="text-white">{item.name}:</strong> {item.desc}</span>
                </li>
              ))}
            </ul>
            <p>
              We do not use tracking cookies, advertising cookies, or third-party analytics
              cookies that follow you across websites. Your browsing activity on PrecisionBOM
              stays on PrecisionBOM.
            </p>
          </div>
        </section>

        {/* Section 7: Contact */}
        <section id="contact" className="mb-12 scroll-mt-20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-trace-500 text-sm font-mono">07</span>
            Contact Us
          </h2>
          <div className="space-y-4 text-substrate-400 leading-relaxed">
            <p>
              If you have questions about this Privacy Policy, your personal data, or would like
              to exercise your rights, please contact us:
            </p>
            <div className="p-6 rounded border border-substrate-800 bg-substrate-950">
              <p className="text-white font-medium">PrecisionBOM Privacy Team</p>
              <p className="mt-2">
                Email:{" "}
                <a
                  href="mailto:privacy@precisionbom.io"
                  className="text-trace-500 hover:text-trace-400 transition-colors"
                >
                  privacy@precisionbom.io
                </a>
              </p>
            </div>
            <p>
              We will respond to all legitimate requests within 30 days. Occasionally it may take
              longer if your request is particularly complex or you have made multiple requests.
            </p>
          </div>
        </section>

        {/* Navigation */}
        <div className="pt-8 border-t border-substrate-800">
          <Link
            href="/terms"
            className="text-trace-500 hover:text-trace-400 transition-colors text-sm"
          >
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}

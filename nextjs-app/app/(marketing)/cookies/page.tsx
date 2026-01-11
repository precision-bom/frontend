import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | PrecisionBOM",
  description: "How PrecisionBOM uses cookies and similar technologies.",
};

const sections = [
  { id: "what-are-cookies", title: "WHAT ARE COOKIES" },
  { id: "cookies-we-use", title: "COOKIES WE USE" },
  { id: "third-party", title: "THIRD-PARTY COOKIES" },
  { id: "managing-cookies", title: "MANAGING COOKIES" },
  { id: "changes", title: "POLICY CHANGES" },
  { id: "contact", title: "CONTACT" },
];

export default function CookiesPage() {
  return (
    <div className="bg-black text-white">
      {/* Header */}
      <header className="border-b-4 border-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <pre className="font-mono text-xs text-gray-500 mb-6">
{`┌─────────────────────────────────────────────────────────────┐
│ DOCUMENT: COOKIE_POLICY.md                                  │
│ VERSION: 1.0.0                                              │
│ LAST_MODIFIED: 2025-01-10                                   │
└─────────────────────────────────────────────────────────────┘`}
          </pre>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            COOKIE<br />
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
            This Cookie Policy explains how PrecisionBOM uses cookies and similar tracking
            technologies when you visit our platform. We believe in transparency about the
            technologies we use and your choices regarding them.
          </p>
        </div>

        {/* Section 1: What Are Cookies */}
        <section id="what-are-cookies" className="mb-12 scroll-mt-20">
          <SectionHeader number="01" title="WHAT ARE COOKIES" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-white p-6 font-mono text-sm">
              <pre className="text-green-500 mb-4">/* DEFINITION */</pre>
              <p className="text-gray-300">
                Cookies are small text files stored on your device when you visit a website.
                They help websites remember your preferences and understand how you interact
                with content.
              </p>
            </div>
            <p>
              Cookies serve various functions including authentication, security, preferences,
              and analytics. They can be &quot;session&quot; cookies (deleted when you close your browser)
              or &quot;persistent&quot; cookies (remain until expiration or deletion).
            </p>
          </div>
        </section>

        {/* Section 2: Cookies We Use */}
        <section id="cookies-we-use" className="mb-12 scroll-mt-20">
          <SectionHeader number="02" title="COOKIES WE USE" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-green-500 bg-black p-6 mb-6">
              <pre className="font-mono text-green-500 text-xs mb-2">/* NOTICE */</pre>
              <h3 className="text-green-400 font-bold uppercase mb-2">MINIMAL COOKIE USAGE</h3>
              <p className="text-gray-400">
                PrecisionBOM uses only essential, functional cookies. We do not use
                advertising or cross-site tracking cookies.
              </p>
            </div>

            <div className="border-4 border-white p-6">
              <pre className="font-mono text-green-500 text-xs mb-4">ESSENTIAL_COOKIES = [</pre>
              <div className="space-y-4 ml-4">
                {[
                  {
                    name: "session_id",
                    purpose: "Maintains authenticated session state",
                    duration: "Session",
                    type: "ESSENTIAL",
                  },
                  {
                    name: "csrf_token",
                    purpose: "Protects against cross-site request forgery",
                    duration: "Session",
                    type: "SECURITY",
                  },
                  {
                    name: "preferences",
                    purpose: "Stores UI preferences (theme, layout)",
                    duration: "1 year",
                    type: "FUNCTIONAL",
                  },
                  {
                    name: "auth_token",
                    purpose: "JWT authentication token",
                    duration: "7 days",
                    type: "ESSENTIAL",
                  },
                ].map((cookie, i) => (
                  <div key={i} className="border-4 border-gray-800 p-4 hover:border-green-500 transition-all duration-200">
                    <div className="flex items-center gap-4 mb-2">
                      <code className="text-green-500 font-bold">{cookie.name}</code>
                      <span className="text-xs px-2 py-1 border border-gray-600 text-gray-500">{cookie.type}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{cookie.purpose}</p>
                    <p className="text-xs text-gray-600">Duration: {cookie.duration}</p>
                  </div>
                ))}
              </div>
              <pre className="font-mono text-green-500 mt-4">]</pre>
            </div>
          </div>
        </section>

        {/* Section 3: Third-Party Cookies */}
        <section id="third-party" className="mb-12 scroll-mt-20">
          <SectionHeader number="03" title="THIRD-PARTY COOKIES" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              We minimize the use of third-party services that set cookies. Currently, the
              following third parties may set cookies when you use PrecisionBOM:
            </p>
            <div className="space-y-4">
              {[
                {
                  provider: "Vercel",
                  purpose: "Hosting and performance optimization",
                  policy: "https://vercel.com/legal/privacy-policy",
                },
                {
                  provider: "Neon",
                  purpose: "Database connection management",
                  policy: "https://neon.tech/privacy",
                },
              ].map((item, i) => (
                <div key={i} className="border-4 border-gray-800 p-4 hover:border-green-500 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold uppercase">{item.provider}</span>
                    <span className="text-xs text-gray-600">Third-Party</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{item.purpose}</p>
                  <a
                    href={item.policy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-500 hover:text-green-300 font-mono"
                  >
                    VIEW PRIVACY POLICY →
                  </a>
                </div>
              ))}
            </div>
            <div className="border-l-4 border-green-500 pl-6">
              <p>
                We do not use Google Analytics, Facebook Pixel, or similar advertising
                and tracking services. Your browsing activity on PrecisionBOM stays on PrecisionBOM.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Managing Cookies */}
        <section id="managing-cookies" className="mb-12 scroll-mt-20">
          <SectionHeader number="04" title="MANAGING COOKIES" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              You can control and manage cookies through your browser settings:
            </p>
            <div className="border-4 border-white p-6 font-mono text-sm">
              <pre className="text-green-500 mb-4">BROWSER_SETTINGS = {`{`}</pre>
              <div className="ml-4 space-y-2">
                {[
                  { browser: "Chrome", path: "Settings → Privacy and Security → Cookies" },
                  { browser: "Firefox", path: "Settings → Privacy & Security → Cookies" },
                  { browser: "Safari", path: "Preferences → Privacy → Cookies" },
                  { browser: "Edge", path: "Settings → Cookies and Site Permissions" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-green-500 w-20">{item.browser}:</span>
                    <span className="text-gray-300">&quot;{item.path}&quot;,</span>
                  </div>
                ))}
              </div>
              <pre className="text-green-500 mt-4">{`}`}</pre>
            </div>
            <div className="border-4 border-yellow-500/50 bg-yellow-500/5 p-6">
              <pre className="font-mono text-yellow-500 text-xs mb-2">/* WARNING */</pre>
              <p className="text-gray-400">
                Disabling essential cookies may prevent you from logging in or using
                certain features of PrecisionBOM. Functional cookies are required for
                the platform to operate correctly.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Policy Changes */}
        <section id="changes" className="mb-12 scroll-mt-20">
          <SectionHeader number="05" title="POLICY CHANGES" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              We may update this Cookie Policy periodically to reflect changes in our
              practices or for operational, legal, or regulatory reasons. Changes will
              be posted on this page with an updated modification date.
            </p>
            <p>
              Continued use of PrecisionBOM after changes constitutes acceptance of the
              updated policy.
            </p>
          </div>
        </section>

        {/* Section 6: Contact */}
        <section id="contact" className="mb-12 scroll-mt-20">
          <SectionHeader number="06" title="CONTACT" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>For questions about our use of cookies:</p>
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
          </div>
        </section>

        {/* Navigation */}
        <div className="pt-8 border-t-4 border-white flex justify-between items-center">
          <Link
            href="/terms"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span>───</span>
            TERMS OF SERVICE
          </Link>
          <Link
            href="/security"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            SECURITY
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

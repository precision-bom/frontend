import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA Policy | PrecisionBOM",
  description: "Digital Millennium Copyright Act policy and takedown procedures.",
};

const sections = [
  { id: "overview", title: "OVERVIEW" },
  { id: "filing-notice", title: "FILING A NOTICE" },
  { id: "counter-notice", title: "COUNTER-NOTIFICATION" },
  { id: "repeat-infringers", title: "REPEAT INFRINGERS" },
  { id: "designated-agent", title: "DESIGNATED AGENT" },
];

export default function DMCAPage() {
  return (
    <div className="bg-black text-white">
      {/* Header */}
      <header className="border-b-4 border-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <pre className="font-mono text-xs text-gray-500 mb-6">
{`┌─────────────────────────────────────────────────────────────┐
│ DOCUMENT: DMCA_POLICY.md                                    │
│ VERSION: 1.0.0                                              │
│ LAST_MODIFIED: 2025-01-10                                   │
└─────────────────────────────────────────────────────────────┘`}
          </pre>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            <span className="text-green-500">DMCA</span><br />
            POLICY
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
            PrecisionBOM respects the intellectual property rights of others and expects
            users to do the same. This policy outlines our procedures for responding to
            claims of copyright infringement under the Digital Millennium Copyright Act (DMCA).
          </p>
        </div>

        {/* Section 1: Overview */}
        <section id="overview" className="mb-12 scroll-mt-20">
          <SectionHeader number="01" title="OVERVIEW" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              In accordance with the DMCA, we will respond expeditiously to claims of
              copyright infringement that are reported to our designated agent. Upon
              receipt of a valid notice, we will:
            </p>
            <div className="border-4 border-white p-6 font-mono text-sm">
              <pre className="text-green-500 mb-4">RESPONSE_PROCEDURE = [</pre>
              {[
                "Remove or disable access to allegedly infringing material",
                "Notify the user who posted the material",
                "Provide information about counter-notification rights",
                "Forward counter-notifications to the complaining party",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 ml-4 mb-2">
                  <span className="text-green-500">[{String(i + 1).padStart(2, "0")}]</span>
                  <span className="text-white">&quot;{item}&quot;,</span>
                </div>
              ))}
              <pre className="text-green-500">]</pre>
            </div>
          </div>
        </section>

        {/* Section 2: Filing a Notice */}
        <section id="filing-notice" className="mb-12 scroll-mt-20">
          <SectionHeader number="02" title="FILING A NOTICE" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              To file a DMCA takedown notice, you must provide a written communication
              containing the following elements:
            </p>
            <div className="border-4 border-white p-6">
              <pre className="font-mono text-green-500 text-xs mb-4">/* REQUIRED_ELEMENTS */</pre>
              {[
                {
                  num: "01",
                  title: "Identification of Work",
                  desc: "Identify the copyrighted work claimed to have been infringed",
                },
                {
                  num: "02",
                  title: "Infringing Material",
                  desc: "Identify the material claimed to be infringing with sufficient detail for us to locate it",
                },
                {
                  num: "03",
                  title: "Contact Information",
                  desc: "Your address, telephone number, and email address",
                },
                {
                  num: "04",
                  title: "Good Faith Statement",
                  desc: "A statement that you have a good faith belief that use is not authorized",
                },
                {
                  num: "05",
                  title: "Accuracy Statement",
                  desc: "A statement, under penalty of perjury, that the information is accurate and you are authorized to act",
                },
                {
                  num: "06",
                  title: "Signature",
                  desc: "Physical or electronic signature of the copyright owner or authorized agent",
                },
              ].map((item, i) => (
                <div key={i} className="border-4 border-gray-800 p-4 mb-4 last:mb-0 hover:border-green-500 transition-all duration-200">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-mono text-green-500">[{item.num}]</span>
                    <span className="text-white font-bold uppercase">{item.title}</span>
                  </div>
                  <p className="text-sm text-gray-400 ml-12">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="border-4 border-yellow-500/50 bg-yellow-500/5 p-6">
              <pre className="font-mono text-yellow-500 text-xs mb-2">/* WARNING */</pre>
              <p className="text-gray-400">
                Filing a false DMCA notice may result in liability for damages, including
                costs and attorneys&apos; fees. Please ensure your claim is valid before submission.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Counter-Notification */}
        <section id="counter-notice" className="mb-12 scroll-mt-20">
          <SectionHeader number="03" title="COUNTER-NOTIFICATION" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              If you believe your content was removed in error, you may submit a
              counter-notification containing:
            </p>
            <div className="border-4 border-white p-6 font-mono text-sm">
              <pre className="text-green-500 mb-4">COUNTER_NOTICE_REQUIREMENTS = [</pre>
              {[
                "Your physical or electronic signature",
                "Identification of the removed material and its previous location",
                "Statement under penalty of perjury that removal was by mistake or misidentification",
                "Your name, address, and telephone number",
                "Consent to jurisdiction of federal court in your district",
                "Agreement to accept service of process from the complaining party",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 ml-4 mb-2">
                  <span className="text-green-500">●</span>
                  <span className="text-white">&quot;{item}&quot;,</span>
                </div>
              ))}
              <pre className="text-green-500">]</pre>
            </div>
            <p>
              Upon receipt of a valid counter-notification, we will forward it to the
              original complainant. If no lawsuit is filed within 10-14 business days,
              we may restore the removed content.
            </p>
          </div>
        </section>

        {/* Section 4: Repeat Infringers */}
        <section id="repeat-infringers" className="mb-12 scroll-mt-20">
          <SectionHeader number="04" title="REPEAT INFRINGERS" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <div className="border-4 border-red-500/50 bg-red-500/5 p-6">
              <pre className="font-mono text-red-500 text-xs mb-2">/* TERMINATION POLICY */</pre>
              <p className="text-gray-400">
                PrecisionBOM maintains a policy of terminating the accounts of users who
                are determined to be repeat infringers of copyright.
              </p>
            </div>
            <p>
              We consider a user to be a repeat infringer when they have been the subject
              of more than two valid DMCA notices without corresponding successful
              counter-notifications. Account termination may occur without prior notice.
            </p>
          </div>
        </section>

        {/* Section 5: Designated Agent */}
        <section id="designated-agent" className="mb-12 scroll-mt-20">
          <SectionHeader number="05" title="DESIGNATED AGENT" />
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              DMCA notices and counter-notifications should be sent to our designated agent:
            </p>
            <div className="border-4 border-white p-6 hover:border-green-500 transition-all duration-200">
              <pre className="font-mono text-green-500 text-xs mb-4">/* DESIGNATED_AGENT */</pre>
              <div className="space-y-4">
                <div>
                  <p className="text-white font-bold uppercase">PRECISIONBOM DMCA AGENT</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Email:</span>{" "}
                    <a href="mailto:dmca@precisionbom.com" className="text-green-500 hover:text-green-300">
                      dmca@precisionbom.com
                    </a>
                  </p>
                  <p>
                    <span className="text-gray-600">Subject Line:</span>{" "}
                    <span className="text-gray-300">DMCA Notice or DMCA Counter-Notice</span>
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Please allow 1-2 business days for acknowledgment of receipt.
            </p>
          </div>
        </section>

        {/* Navigation */}
        <div className="pt-8 border-t-4 border-white flex justify-between items-center">
          <Link
            href="/acceptable-use"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span>───</span>
            ACCEPTABLE USE
          </Link>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-300 font-mono text-sm uppercase tracking-wider transition-all duration-200 group"
          >
            PRIVACY POLICY
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

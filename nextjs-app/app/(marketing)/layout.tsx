import Link from "next/link";
import Image from "next/image";
import WalletConnect from "@/components/WalletConnect";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navigation - Brutalist */}
      <nav className="sticky top-0 z-50 border-b-4 border-white bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Image
                src="/precision-bom-logo.svg"
                alt="PrecisionBOM"
                width={180}
                height={36}
                className="h-9 w-auto"
                priority
              />
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/features"
                className="font-mono text-sm text-neutral-400 hover:text-green-500 transition-colors uppercase tracking-wider"
              >
                [FEATURES]
              </Link>
              <Link
                href="/internals"
                className="font-mono text-sm text-neutral-400 hover:text-green-500 transition-colors uppercase tracking-wider"
              >
                [INTERNALS]
              </Link>
              <Link
                href="/about"
                className="font-mono text-sm text-neutral-400 hover:text-green-500 transition-colors uppercase tracking-wider"
              >
                [ABOUT]
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <WalletConnect />
              <div className="h-4 w-[1px] bg-substrate-800 mx-1" />
              <Link
                href="/login"
                className="font-mono text-sm text-neutral-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                LOGIN
              </Link>
              <Link
                href="/register"
                className="font-mono text-sm px-4 py-2 bg-green-500 text-black border-2 border-green-500 hover:bg-black hover:text-green-500 transition-colors uppercase tracking-wider font-bold"
              >
                SIGN UP
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">{children}</main>

      {/* Footer - Brutalist */}
      <footer className="relative z-10 border-t-4 border-white bg-black overflow-hidden">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* ASCII Divider */}
          <pre className="font-mono text-xs text-center mb-8">
            <span className="text-green-500/50">════════════════════════════════════════</span>
            <span className="text-green-400/30">════════════════════════════════════════</span>
          </pre>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <span className="font-mono text-sm font-bold tracking-tighter">
                PRECISION<span className="text-green-500">BOM</span>
              </span>
              <p className="mt-2 text-neutral-600 text-xs font-mono">
                <span className="text-green-500">//</span> AI-POWERED BOM SOURCING
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-neutral-600">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-500">OPERATIONAL</span>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-mono text-xs text-green-500 uppercase tracking-wider mb-4">
                [PRODUCT]
              </h4>
              <div className="flex flex-col gap-2 font-mono text-xs text-neutral-500 uppercase tracking-wider">
                <Link href="/features" className="hover:text-green-500 transition-colors">
                  FEATURES
                </Link>
                <Link href="/internals" className="hover:text-green-500 transition-colors">
                  INTERNALS
                </Link>
                <Link href="/about" className="hover:text-green-500 transition-colors">
                  ABOUT
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-mono text-xs text-green-500 uppercase tracking-wider mb-4">
                [LEGAL]
              </h4>
              <div className="flex flex-col gap-2 font-mono text-xs text-neutral-500 uppercase tracking-wider">
                <Link href="/terms" className="hover:text-green-500 transition-colors">
                  TERMS
                </Link>
                <Link href="/privacy" className="hover:text-green-500 transition-colors">
                  PRIVACY
                </Link>
                <Link href="/cookies" className="hover:text-green-500 transition-colors">
                  COOKIES
                </Link>
                <Link href="/acceptable-use" className="hover:text-green-500 transition-colors">
                  ACCEPTABLE USE
                </Link>
              </div>
            </div>

            {/* Security & Compliance */}
            <div>
              <h4 className="font-mono text-xs text-green-500 uppercase tracking-wider mb-4">
                [SECURITY]
              </h4>
              <div className="flex flex-col gap-2 font-mono text-xs text-neutral-500 uppercase tracking-wider">
                <Link href="/security" className="hover:text-green-500 transition-colors">
                  SECURITY
                </Link>
                <Link href="/dmca" className="hover:text-green-500 transition-colors">
                  DMCA
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-mono text-xs text-neutral-600">
              © {new Date().getFullYear()} PrecisionBOM. All rights reserved.
            </span>
            <div className="flex items-center gap-4 font-mono text-xs text-neutral-600">
              <a href="mailto:legal@precisionbom.com" className="hover:text-green-500 transition-colors">
                legal@precisionbom.com
              </a>
              <a
                href="https://github.com/precision-bom/precisionBOM"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-500 transition-colors flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GITHUB
              </a>
            </div>
          </div>

          {/* ASCII Footer */}
          <pre className="font-mono text-xs text-center mt-8">
            <span className="text-green-500 animate-pulse">●</span>
            <span className="text-neutral-800">────────────────────────────────</span>
            <span className="text-green-400">●</span>
            <span className="text-neutral-800">────────────────────────────────</span>
            <span className="text-green-500 animate-pulse">●</span>
          </pre>
        </div>
      </footer>
    </div>
  );
}

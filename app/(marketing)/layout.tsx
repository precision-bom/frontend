import Link from "next/link";
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
            <Link href="/" className="flex items-center gap-2 group">
              <pre className="font-mono text-xs leading-none hidden sm:block">
                <span className="text-green-500">{`┌─┐`}</span>
                {"\n"}
                <span className="text-green-500">{`│`}</span>
                <span className="text-green-400 animate-pulse">●</span>
                <span className="text-green-500">{`│`}</span>
                {"\n"}
                <span className="text-green-500">{`└─┘`}</span>
              </pre>
              <span className="font-mono text-lg font-bold tracking-tighter group-hover:text-green-500 transition-colors">
                PRECISION<span className="text-green-500">BOM</span>
              </span>
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* ASCII Divider */}
          <pre className="font-mono text-xs text-center mb-8">
            <span className="text-green-500/50">════════════════════════════════════════</span>
            <span className="text-green-400/30">════════════════════════════════════════</span>
          </pre>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Brand */}
            <div className="flex items-center gap-6">
              <span className="font-mono text-sm font-bold tracking-tighter">
                PRECISION<span className="text-green-500">BOM</span>
              </span>
              <span className="hidden sm:block text-neutral-600 text-xs font-mono">
                <span className="text-green-500">//</span> AI-POWERED BOM SOURCING
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 font-mono text-xs text-neutral-500 uppercase tracking-wider">
              <Link href="/features" className="hover:text-green-500 transition-colors">
                FEATURES
              </Link>
              <Link href="/about" className="hover:text-green-500 transition-colors">
                ABOUT
              </Link>
              <Link href="/privacy" className="hover:text-green-500 transition-colors">
                PRIVACY
              </Link>
              <Link href="/terms" className="hover:text-green-500 transition-colors">
                TERMS
              </Link>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 font-mono text-xs text-neutral-600">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-500">OPERATIONAL</span>
              </span>
              <span>© {new Date().getFullYear()}</span>
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

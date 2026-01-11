import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-substrate-950 text-white font-mono">
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-50 pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-substrate-800 backdrop-blur-md bg-substrate-950/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  {/* PCB trace pattern logo */}
                  <rect x="2" y="2" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <circle cx="8" cy="8" r="2" className="fill-trace-500" />
                  <circle cx="24" cy="8" r="2" fill="currentColor" />
                  <circle cx="8" cy="24" r="2" fill="currentColor" />
                  <circle cx="24" cy="24" r="2" className="fill-trace-500" />
                  <path d="M8 8 L16 16 L24 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M8 24 L16 16 L24 24" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <circle cx="16" cy="16" r="3" className="fill-trace-500" />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight">
                <span className="text-white">Precision</span>
                <span className="text-trace-500">BOM</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/features"
                className="text-sm text-substrate-400 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="/about"
                className="text-sm text-substrate-400 hover:text-white transition-colors"
              >
                About
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm px-4 py-2 text-substrate-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-2 bg-white hover:bg-substrate-200 text-substrate-950 rounded transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-substrate-800 bg-substrate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Brand */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">
                  <span className="text-white">Precision</span>
                  <span className="text-trace-500">BOM</span>
                </span>
              </Link>
              <span className="hidden sm:block text-substrate-600 text-xs">
                AI-powered BOM sourcing
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-xs text-substrate-500">
              <Link href="/features" className="hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/about" className="hover:text-white transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 text-xs text-substrate-600">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-trace-500" />
                <span>Operational</span>
              </div>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

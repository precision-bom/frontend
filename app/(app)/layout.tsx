"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
        setLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-substrate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-substrate-400">
          <svg
            className="animate-spin h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="font-mono text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-substrate-950 bg-dark-gradient">
      {/* Grid overlay */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid pointer-events-none opacity-50" />

      {/* Header */}
      <header className="relative border-b border-substrate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/app" className="flex items-center gap-3 group">
              <div className="relative">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-trace-500"
                >
                  <rect
                    x="2"
                    y="2"
                    width="28"
                    height="28"
                    rx="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="8" cy="8" r="2" fill="currentColor" />
                  <circle cx="24" cy="8" r="2" fill="currentColor" />
                  <circle cx="8" cy="24" r="2" fill="currentColor" />
                  <circle cx="24" cy="24" r="2" fill="currentColor" />
                  <path
                    d="M8 8 L16 16 L24 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M8 24 L16 16 L24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <span className="font-mono font-semibold text-lg">
                <span className="text-trace-500">Precision</span>
                <span className="text-copper-400">BOM</span>
              </span>
            </Link>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-substrate-400 font-mono">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-mono text-substrate-400 hover:text-silkscreen hover:bg-substrate-800 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative">{children}</main>
    </div>
  );
}

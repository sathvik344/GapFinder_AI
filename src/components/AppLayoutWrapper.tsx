"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { Sparkles, ArrowRight, Compass } from "lucide-react";
import Link from "next/link";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, isAuthPage, pathname, router]);

  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  // Loading Screen while verifying session
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-ivory-50 dark:bg-pine-950 text-forest-900 dark:text-forest-100 transition-colors">
        <div className="flex flex-col items-center gap-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-forest-900 dark:bg-forest-800 flex items-center justify-center text-ivory-50 shadow-xl border border-forest-800/40 animate-pulse">
            <Compass className="w-8 h-8 text-coral-400" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="font-extrabold text-base tracking-tight text-forest-950 dark:text-forest-50">
              GapFinder <span className="text-coral-500">AI</span>
            </h2>
            <p className="text-xs text-forest-600 dark:text-forest-300 font-medium">
              Verifying student diagnostic session...
            </p>
          </div>
          <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  // If unauthenticated and not an auth page, render blank while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-pine-950 text-forest-900 dark:text-forest-100 flex w-full transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Prominent Demo Mode Banner if in Demo Mode */}
        {user.isDemo && (
          <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-800/50 px-6 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Evaluation Demo Session:</strong> Exploring bundled Computer Networks dataset. Live RAG and real diagnostic scoring active.
              </span>
            </div>
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1 font-bold text-coral-600 dark:text-coral-400 hover:underline shrink-0 text-[11px]"
            >
              <span>Switch Account / Sign In</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { GraduationCap, Sparkles, LogIn, ArrowRight } from "lucide-react";
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-slate-100 transition-colors">
        <div className="flex flex-col items-center gap-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-electric flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 animate-pulse">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="font-extrabold text-base tracking-tight">
              GapFinder <span className="text-teal-neon dark:text-teal-neon">AI</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verifying student learning session...
            </p>
          </div>
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  // If unauthenticated and not an auth page, render blank while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-slate-100 flex w-full transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Prominent Demo Mode Banner if in Demo Mode */}
        {user.isDemo && (
          <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border-b border-amber-200/50 dark:border-amber-900/40 px-6 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> Exploring bundled Computer Networks dataset. Live RAG and real diagnostic scoring are active.
              </span>
            </div>
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1 font-bold text-indigo-600 dark:text-teal-neon hover:underline shrink-0 text-[11px]"
            >
              <span>Connect Supabase / Sign In</span>
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

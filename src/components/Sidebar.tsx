"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BarChart3,
  BookMarked,
  BrainCircuit,
  CalendarCheck,
  FileText,
  GraduationCap,
  Layers,
  LogIn,
  LogOut,
  RotateCcw,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const navigationItems = [
  { name: "Learning Dashboard", href: "/", icon: BarChart3 },
  { name: "Course Materials", href: "/materials", icon: FileText },
  { name: "Syllabus Topic Map", href: "/topic-map", icon: Layers },
  { name: "Diagnostic Quiz", href: "/quiz", icon: BrainCircuit },
  { name: "Knowledge Gap Audit", href: "/gap-report", icon: BookMarked },
  { name: "Revision Planner", href: "/revision-plan", icon: CalendarCheck },
  { name: "Grounded AI Tutor", href: "/assistant", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [status, setStatus] = useState<{ mode: string; message: string }>({
    mode: "demo",
    message: "Demo Mode (Bundled Dataset)",
  });
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus({
          mode: data.mode,
          message: data.mode === "live" ? "Live Gemini + Supabase" : "Demo Mode (Local Data)",
        });
      })
      .catch(() => {});
  }, []);

  const handleResetData = async () => {
    if (confirm("Reset application to the baseline sample Computer Networks dataset?")) {
      setResetting(true);
      try {
        await fetch("/api/demo/reset", { method: "POST" });
        window.location.reload();
      } catch (e) {
        console.error(e);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-navy-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 text-slate-700 dark:text-slate-300 transition-colors z-20">
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-850">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-electric flex items-center justify-center text-white shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight block">
                  GapFinder <span className="text-teal-neon">AI</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">
                Learning Analytics
              </span>
            </div>
          </Link>

          {/* Active Subject Pill */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="truncate">
              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase block tracking-wider">
                Current Syllabus
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block">
                Computer Networks
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-neon border border-teal-500/20 font-bold">
              CS401
            </span>
          </div>
        </div>

        {/* User Session Quick Profile */}
        <div className="px-3 pt-3">
          {user ? (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/15 dark:bg-indigo-600/30 text-indigo-600 dark:text-teal-neon flex items-center justify-center shrink-0 font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white block truncate leading-tight">
                      {user.name || "Student"}
                    </span>
                    {user.isDemo ? (
                      <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                        Demo
                      </span>
                    ) : (
                      <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Auth
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate leading-tight">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-navy-900 hover:bg-indigo-100 dark:hover:bg-navy-850 text-indigo-600 dark:text-teal-neon border border-indigo-200 dark:border-indigo-900/60 text-xs font-semibold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </Link>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-850 bg-slate-50/70 dark:bg-navy-950 space-y-3">
        {/* Backend Connectivity Status */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-[11px]">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                status.mode === "live" ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="font-bold text-slate-800 dark:text-slate-200">{status.message}</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            {status.mode === "live"
              ? "Gemini 1.5 Flash + Supabase pgvector"
              : "Demo Mode active. Real scoring & deterministic RAG."}
          </p>
        </div>

        {/* Theme Toggle Bar */}
        <div className="flex items-center justify-between p-1.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 pl-1 font-medium">Theme:</span>
          <ThemeToggle showLabels />
        </div>

        {/* Reset Button */}
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-navy-900 dark:hover:bg-navy-850 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
          <span>{resetting ? "Resetting..." : "Reset Sample Data"}</span>
        </button>
      </div>
    </aside>
  );
}

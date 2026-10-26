"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookMarked,
  BrainCircuit,
  CalendarCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Study Materials", href: "/materials", icon: FileText },
  { name: "Topic Map", href: "/topic-map", icon: Layers },
  { name: "Diagnostic Quiz", href: "/quiz", icon: BrainCircuit },
  { name: "Knowledge Gap Report", href: "/gap-report", icon: BookMarked },
  { name: "Revision Planner", href: "/revision-plan", icon: CalendarCheck },
  { name: "AI Study Assistant", href: "/assistant", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
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
    if (confirm("Reset application to the sample Computer Networks dataset?")) {
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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 text-slate-300">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight block">
                GapFinder <span className="text-indigo-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Adaptive Mastery Engine
              </span>
            </div>
          </Link>

          {/* Active Subject Pill */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div className="truncate">
              <span className="text-[10px] text-indigo-400 font-semibold uppercase block">
                Active Subject
              </span>
              <span className="text-xs font-medium text-white truncate block">
                Computer Networks
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
              Sample
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & Reset */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
        {/* Mode Pill */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-[11px]">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                status.mode === "live" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="font-semibold text-slate-200">{status.message}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {status.mode === "live"
              ? "Gemini 1.5 Flash + pgvector enabled"
              : "Demo Mode active. Real scoring & deterministic RAG."}
          </p>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
          <span>{resetting ? "Resetting..." : "Reset Sample Data"}</span>
        </button>
      </div>
    </aside>
  );
}

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
  Layers,
  LogOut,
  RotateCcw,
  Sparkles,
  Compass,
  Database,
  CheckCircle2,
  GraduationCap,
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
    message: "Stored Database Active",
  });
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus({
          mode: data.mode,
          message: data.mode === "live" ? "Live Gemini + Supabase" : "Stored Database Active",
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
    <aside className="w-64 bg-ivory-50 dark:bg-pine-900 border-r border-ivory-200 dark:border-pine-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 text-forest-800 dark:text-forest-200 transition-colors duration-200 z-20">
      <div className="flex flex-col min-h-0">
        {/* Academic Brand Header */}
        <div className="p-5 border-b border-ivory-200 dark:border-pine-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-forest-900 dark:bg-forest-800 border border-forest-800/40 flex items-center justify-center text-ivory-50 shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-coral-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-forest-950 dark:text-ivory-50 text-base tracking-tight block">
                  GapFinder <span className="text-coral-500">AI</span>
                </span>
              </div>
              <span className="text-[10px] text-forest-600 dark:text-forest-400 font-semibold uppercase tracking-wider block">
                Precision Knowledge Lab
              </span>
            </div>
          </Link>

          {/* Active Syllabus Badge */}
          <div className="mt-4 p-2.5 rounded-xl bg-white dark:bg-pine-850 border border-ivory-200 dark:border-pine-750 shadow-paper flex items-center justify-between">
            <div className="truncate">
              <span className="text-[9px] text-coral-600 dark:text-coral-400 font-bold uppercase block tracking-wider">
                Current Syllabus
              </span>
              <span className="text-xs font-bold text-forest-950 dark:text-ivory-50 truncate block">
                Computer Networks
              </span>
            </div>
            <GraduationCap className="w-4 h-4 text-forest-600 dark:text-forest-400 shrink-0 ml-1.5" />
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-forest-500 dark:text-forest-400 tracking-wider">
            Diagnostic Modules
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white dark:bg-pine-800 text-forest-950 dark:text-ivory-50 shadow-paper font-bold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-coral-500 before:rounded-r"
                    : "text-forest-700 dark:text-forest-300 hover:bg-white/60 dark:hover:bg-pine-850 hover:text-forest-950 dark:hover:text-ivory-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-coral-500" : "text-forest-500 dark:text-forest-400"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & User Section */}
      <div className="p-4 border-t border-ivory-200 dark:border-pine-800/80 space-y-3 bg-ivory-100/50 dark:bg-pine-950/40">
        {/* Backend Connectivity Status */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-pine-850 border border-ivory-200 dark:border-pine-800 text-[11px] shadow-paper space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-forest-900 dark:text-ivory-50 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-coral-500 shrink-0" />
              <span>Storage Backend</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forest-700 dark:text-forest-300 bg-forest-100 dark:bg-pine-750 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-500 dark:bg-forest-400" />
              Ready
            </span>
          </div>
          <p className="text-[10px] text-forest-600 dark:text-forest-400 truncate">
            {status.message}
          </p>
        </div>

        {/* User Account Bar & Logout */}
        {user && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-coral-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="min-w-0 truncate">
                <span className="text-xs font-bold text-forest-950 dark:text-ivory-50 truncate block leading-tight">
                  {user.name || user.email.split("@")[0]}
                </span>
                <span className="text-[10px] text-forest-600 dark:text-forest-400 truncate block">
                  {user.isDemo ? "Demo Student" : "Database Student"}
                </span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-forest-600 dark:text-forest-400 hover:text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-950/40 transition-colors"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Reset Dataset Trigger */}
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-forest-600 dark:text-forest-400 hover:text-forest-900 dark:hover:text-ivory-50 py-1 transition-colors"
        >
          <RotateCcw className={`w-3 h-3 ${resetting ? "animate-spin" : ""}`} />
          <span>{resetting ? "Resetting..." : "Reset Sample Materials"}</span>
        </button>
      </div>
    </aside>
  );
}

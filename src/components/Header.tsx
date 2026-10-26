"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthContext";
import { Database, LogIn, LogOut, User, CheckCircle2, Sparkles } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export function Header({ title, subtitle, actionButton }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 py-4 flex items-center justify-between transition-colors">
      <div className="min-w-0 pr-4">
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Active Subject Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-neon" />
          <span>
            Curriculum: <strong className="text-slate-900 dark:text-white">Computer Networks</strong>
          </span>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Auth Profile / Login Link */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-navy-900 border border-indigo-200/60 dark:border-slate-800 text-xs">
              <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                {user.name || user.email.split("@")[0]}
              </span>
              {user.isDemo ? (
                <span className="text-[9px] uppercase font-bold text-amber-700 dark:text-amber-300 px-1 py-0.5 rounded bg-amber-500/20">
                  Demo
                </span>
              ) : (
                <span className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-300 px-1 py-0.5 rounded bg-emerald-500/20 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Live
                </span>
              )}
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        )}

        {actionButton}
      </div>
    </header>
  );
}

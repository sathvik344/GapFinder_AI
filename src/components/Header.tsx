"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthContext";
import { LogIn, LogOut, CheckCircle2, Compass, GraduationCap } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export function Header({ title, subtitle, actionButton }: HeaderProps) {
  const { user, logout, isConfigured } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-ivory-50/90 dark:bg-pine-900/90 backdrop-blur-md border-b border-ivory-200 dark:border-pine-800 px-6 sm:px-8 py-4 flex items-center justify-between transition-colors duration-200">
      <div className="min-w-0 pr-4">
        <h1 className="text-lg sm:text-xl font-extrabold text-forest-950 dark:text-ivory-50 tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-forest-600 dark:text-forest-400 mt-0.5 truncate font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Active Subject Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-pine-850 border border-ivory-200 dark:border-pine-750 text-xs text-forest-700 dark:text-forest-300 font-medium shadow-paper">
          <GraduationCap className="w-3.5 h-3.5 text-coral-500" />
          <span>
            Curriculum: <strong className="text-forest-950 dark:text-ivory-50 font-bold">Computer Networks</strong>
          </span>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Auth Profile / Login Link */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-ivory-200 dark:border-pine-800">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white dark:bg-pine-850 border border-ivory-200 dark:border-pine-800 text-xs shadow-paper">
              <div className="w-5 h-5 rounded-md bg-forest-800 dark:bg-forest-700 text-ivory-50 flex items-center justify-center text-[10px] font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
              <span className="font-bold text-forest-950 dark:text-ivory-50 max-w-[120px] truncate">
                {user.name || user.email.split("@")[0]}
              </span>
              {user.isDemo ? (
                <span className="text-[9px] uppercase font-bold text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60">
                  Demo
                </span>
              ) : (
                <span className="text-[9px] uppercase font-bold text-forest-700 dark:text-forest-300 px-1.5 py-0.5 rounded bg-forest-100 dark:bg-forest-900/60 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5 text-forest-600 dark:text-forest-400" />
                  {isConfigured ? "Live" : "Active"}
                </span>
              )}
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-xl text-forest-600 dark:text-forest-400 hover:text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-950/40 transition-colors"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-ivory-200 dark:border-pine-800">
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-950 hover:bg-black dark:bg-pine-800 dark:hover:bg-black text-white text-xs font-bold shadow-md border border-forest-900 dark:border-pine-700 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-coral-400" />
              <span>Sign In</span>
            </Link>
          </div>
        )}

        {actionButton}
      </div>
    </header>
  );
}

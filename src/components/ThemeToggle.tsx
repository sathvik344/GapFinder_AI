"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export function ThemeToggle({ className = "", showLabels = false }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white/50 dark:bg-pine-900/50 animate-pulse ${className}`}
        aria-hidden="true"
      />
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {showLabels ? (
        <div className="flex items-center p-1 rounded-xl bg-ivory-100 dark:bg-pine-900 border border-ivory-200 dark:border-pine-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              theme === "light"
                ? "bg-white dark:bg-pine-800 text-forest-950 dark:text-ivory-50 shadow-paper font-bold"
                : "text-forest-600 hover:text-forest-950 dark:text-forest-400 dark:hover:text-ivory-50"
            }`}
            aria-label="Light mode"
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>Ivory</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              theme === "dark"
                ? "bg-white dark:bg-pine-800 text-forest-950 dark:text-ivory-50 shadow-paper font-bold"
                : "text-forest-600 hover:text-forest-950 dark:text-forest-400 dark:hover:text-ivory-50"
            }`}
            aria-label="Dark mode"
          >
            <Moon className="w-3.5 h-3.5 text-coral-400" />
            <span>Pine</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              theme === "system"
                ? "bg-white dark:bg-pine-800 text-forest-950 dark:text-ivory-50 shadow-paper font-bold"
                : "text-forest-600 hover:text-forest-950 dark:text-forest-400 dark:hover:text-ivory-50"
            }`}
            aria-label="System default theme"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Auto</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={cycleTheme}
          className="p-2 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-850 text-forest-800 dark:text-forest-200 hover:bg-ivory-100 dark:hover:bg-pine-800 shadow-paper transition-colors flex items-center justify-center group"
          title={`Theme: ${theme}. Click to switch theme (Ivory Light → Pine Dark → Auto)`}
          aria-label={`Current theme: ${theme}. Toggle theme`}
        >
          {theme === "dark" ? (
            <Moon className="w-4 h-4 text-coral-400 transition-transform group-hover:rotate-12" />
          ) : theme === "light" ? (
            <Sun className="w-4 h-4 text-amber-600 transition-transform group-hover:rotate-45" />
          ) : (
            <Laptop className="w-4 h-4 text-forest-600 dark:text-forest-400" />
          )}
        </button>
      )}
    </div>
  );
}

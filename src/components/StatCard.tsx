import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  colorScheme?: "forest" | "coral" | "emerald" | "amber" | "rose" | "indigo" | "teal" | "violet";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = "forest",
}: StatCardProps) {
  const schemeStyles = {
    forest: "bg-forest-50 dark:bg-pine-800/80 text-forest-700 dark:text-forest-300 border-forest-200 dark:border-pine-700",
    coral: "bg-coral-50 dark:bg-coral-950/50 text-coral-600 dark:text-coral-400 border-coral-200 dark:border-coral-800/60",
    emerald: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
    amber: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
    rose: "bg-coral-50 dark:bg-coral-950/50 text-coral-600 dark:text-coral-400 border-coral-200 dark:border-coral-800/60",
    indigo: "bg-forest-50 dark:bg-pine-800 text-forest-700 dark:text-forest-300 border-forest-200 dark:border-pine-700",
    teal: "bg-forest-100 dark:bg-pine-800 text-forest-700 dark:text-forest-300 border-forest-200 dark:border-pine-700",
    violet: "bg-forest-50 dark:bg-pine-800 text-forest-700 dark:text-forest-300 border-forest-200 dark:border-pine-700",
  }[colorScheme];

  return (
    <div className="bg-white dark:bg-pine-900 rounded-2xl p-5 border border-ivory-200 dark:border-pine-800 shadow-paper hover:border-ivory-300 dark:hover:border-pine-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-forest-600 dark:text-forest-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${schemeStyles}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <span className="text-3xl font-extrabold text-forest-950 dark:text-ivory-50 tracking-tight">{value}</span>
        {subtitle && <p className="text-xs text-forest-600 dark:text-forest-400 mt-1 font-medium">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-ivory-150 dark:border-pine-800 flex items-center text-xs">
          <span
            className={`font-bold ${
              trend.isPositive ? "text-emerald-700 dark:text-emerald-400" : "text-coral-600 dark:text-coral-400"
            }`}
          >
            {trend.value}
          </span>
          <span className="text-forest-500 dark:text-forest-400 ml-1.5 font-medium">vs benchmark</span>
        </div>
      )}
    </div>
  );
}

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
  colorScheme?: "indigo" | "emerald" | "amber" | "rose" | "violet" | "teal";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = "indigo",
}: StatCardProps) {
  const schemeStyles = {
    indigo: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60",
    emerald: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60",
    amber: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/60",
    rose: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/60",
    violet: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-violet-glow border-purple-100 dark:border-purple-900/60",
    teal: "bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-neon border-teal-100 dark:border-teal-900/60",
  }[colorScheme];

  return (
    <div className="bg-white dark:bg-navy-850 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${schemeStyles}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</span>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs">
          <span
            className={`font-bold ${
              trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {trend.value}
          </span>
          <span className="text-slate-400 dark:text-slate-500 ml-1.5 font-medium">vs baseline target</span>
        </div>
      )}
    </div>
  );
}

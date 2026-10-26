import React from "react";
import { MasteryLevel } from "@/lib/types";

interface TopicBadgeProps {
  level: MasteryLevel;
  score?: number;
  className?: string;
}

export function TopicBadge({ level, score, className = "" }: TopicBadgeProps) {
  let colorStyles = "";
  let label = "";

  switch (level) {
    case "strong":
      colorStyles = "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
      label = "Strong";
      break;
    case "medium":
      colorStyles = "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
      label = "Medium";
      break;
    case "weak":
      colorStyles = "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60";
      label = "Weak";
      break;
    default:
      colorStyles = "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      label = "Untested";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorStyles} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          level === "strong"
            ? "bg-emerald-500"
            : level === "medium"
            ? "bg-amber-500"
            : level === "weak"
            ? "bg-rose-500"
            : "bg-slate-400"
        }`}
      />
      {label} {score !== undefined && `(${score}%)`}
    </span>
  );
}

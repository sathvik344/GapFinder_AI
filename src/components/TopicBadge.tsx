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
      colorStyles = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
      label = "Strong";
      break;
    case "medium":
      colorStyles = "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60";
      label = "Medium";
      break;
    case "weak":
      colorStyles = "bg-coral-50 dark:bg-coral-950/60 text-coral-700 dark:text-coral-300 border-coral-200 dark:border-coral-800/60";
      label = "Weak";
      break;
    default:
      colorStyles = "bg-ivory-100 dark:bg-pine-800 text-forest-700 dark:text-forest-300 border-ivory-200 dark:border-pine-700";
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
            ? "bg-emerald-600"
            : level === "medium"
            ? "bg-amber-500"
            : level === "weak"
            ? "bg-coral-500"
            : "bg-forest-400"
        }`}
      />
      {label} {score !== undefined && `(${score}%)`}
    </span>
  );
}

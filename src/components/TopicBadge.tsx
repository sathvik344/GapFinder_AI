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
      colorStyles = "bg-emerald-50 text-emerald-700 border-emerald-200";
      label = "Strong";
      break;
    case "medium":
      colorStyles = "bg-amber-50 text-amber-700 border-amber-200";
      label = "Medium";
      break;
    case "weak":
      colorStyles = "bg-rose-50 text-rose-700 border-rose-200";
      label = "Weak";
      break;
    default:
      colorStyles = "bg-slate-50 text-slate-600 border-slate-200";
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

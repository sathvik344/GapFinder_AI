"use client";

import React from "react";
import { SourceCitation } from "@/lib/types";
import { BookOpen, FileText, Layers, X } from "lucide-react";

interface SourceCitationModalProps {
  citation: SourceCitation | null;
  onClose: () => void;
}

export function SourceCitationModal({ citation, onClose }: SourceCitationModalProps) {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-navy-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-navy-900/60">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-teal-neon">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Grounded Source Citation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-navy-900/60 border border-indigo-100/60 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium block">Document:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1 mt-0.5 truncate">
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-neon shrink-0" />
                {citation.documentName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium block">Page & Section:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1 mt-0.5 truncate">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-neon shrink-0" />
                Page {citation.pageNumber} • {citation.sectionTitle || "Main Section"}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Retrieved Grounded Passage:
            </span>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
              &ldquo;{citation.snippet}&rdquo;
            </div>
          </div>

          {citation.relevanceScore !== undefined && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Vector Cosine Relevance Score:</span>
              <span className="font-bold text-indigo-600 dark:text-teal-neon">
                {Math.round(citation.relevanceScore * 100)}% match
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Close Citation
          </button>
        </div>
      </div>
    </div>
  );
}

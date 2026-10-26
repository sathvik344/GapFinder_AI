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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-pine-900 rounded-2xl shadow-paper-lg border border-ivory-200 dark:border-pine-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-200 dark:border-pine-800 bg-ivory-100/70 dark:bg-pine-950/60">
          <div className="flex items-center gap-2 text-coral-600 dark:text-coral-400 font-serif">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-bold text-forest-950 dark:text-forest-50 text-base">Grounded Source Citation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-forest-400 hover:text-forest-700 dark:hover:text-forest-200 hover:bg-ivory-200 dark:hover:bg-pine-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-ivory-50 dark:bg-pine-950/70 border border-ivory-200 dark:border-pine-800 text-xs">
            <div>
              <span className="text-forest-500 dark:text-forest-400 font-medium block">Document:</span>
              <span className="font-bold text-forest-950 dark:text-forest-100 flex items-center gap-1.5 mt-0.5 truncate">
                <FileText className="w-3.5 h-3.5 text-coral-500 shrink-0" />
                {citation.documentName}
              </span>
            </div>
            <div>
              <span className="text-forest-500 dark:text-forest-400 font-medium block">Page & Section:</span>
              <span className="font-bold text-forest-950 dark:text-forest-100 flex items-center gap-1.5 mt-0.5 truncate">
                <Layers className="w-3.5 h-3.5 text-coral-500 shrink-0" />
                Page {citation.pageNumber} • {citation.sectionTitle || "Main Section"}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono font-bold text-forest-500 dark:text-forest-400 uppercase tracking-wider block mb-2">
              Retrieved Grounded Passage:
            </span>
            <div className="p-4 rounded-xl bg-ivory-50 dark:bg-pine-950 border border-ivory-200 dark:border-pine-800 text-xs text-forest-800 dark:text-forest-200 leading-relaxed font-mono">
              &ldquo;{citation.snippet}&rdquo;
            </div>
          </div>

          {citation.relevanceScore !== undefined && (
            <div className="flex items-center justify-between text-xs text-forest-500 dark:text-forest-400 pt-2 border-t border-ivory-200 dark:border-pine-800">
              <span className="font-serif">Vector Cosine Relevance Score:</span>
              <span className="font-mono font-bold text-coral-600 dark:text-coral-400">
                {Math.round(citation.relevanceScore * 100)}% match
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-ivory-200 dark:border-pine-800 bg-ivory-50/50 dark:bg-pine-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold transition-colors shadow-coral"
          >
            Close Citation
          </button>
        </div>
      </div>
    </div>
  );
}

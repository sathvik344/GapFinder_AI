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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-indigo-700">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-semibold text-slate-800 text-base">Grounded Source Citation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/60 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Document:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                {citation.documentName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Page & Section:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                Page {citation.pageNumber} • {citation.sectionTitle || "Main Section"}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Retrieved Chunk Passage:
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed font-mono">
              &ldquo;{citation.snippet}&rdquo;
            </div>
          </div>

          {citation.relevanceScore !== undefined && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Vector Cosine Relevance:</span>
              <span className="font-semibold text-indigo-600">
                {Math.round(citation.relevanceScore * 100)}% match
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

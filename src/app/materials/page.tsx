"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import {
  BookOpen,
  FileText,
  Layers,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  CheckCircle,
  Eye,
  FileCheck,
  Sparkles,
  Database,
  Search,
} from "lucide-react";
import { DocumentCategory, DocumentChunk, DocumentMetadata } from "@/lib/types";

export default function MaterialsPage() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "direct">("upload");

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>("notes");
  const [customTitle, setCustomTitle] = useState("");
  const [directText, setDirectText] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
        if (data.documents.length > 0 && !selectedDocId) {
          setSelectedDocId(data.documents[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      fetch(`/api/documents/${selectedDocId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.chunks) setChunks(data.chunks);
        })
        .catch(console.error);
    }
  }, [selectedDocId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setUploading(true);

    try {
      const formData = new FormData();
      if (activeTab === "upload" && file) {
        formData.append("file", file);
      } else if (activeTab === "direct" && directText) {
        formData.append("text", directText);
      } else {
        setStatusMsg({ type: "error", text: "Please select a file or paste document content." });
        setUploading(false);
        return;
      }

      formData.append("category", category);
      if (customTitle) formData.append("title", customTitle);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({
          type: "success",
          text: `Document ingested successfully! Indexed ${data.chunksCreated} vector chunks across ${data.pagesExtracted || 1} pages with metadata preserved.`,
        });
        setFile(null);
        setCustomTitle("");
        setDirectText("");
        await fetchDocs();
        if (data.document?.id) setSelectedDocId(data.document.id);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Upload failed." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to upload document." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this document and all its indexed chunks from the RAG store?")) {
      try {
        await fetch(`/api/documents/${id}`, { method: "DELETE" });
        await fetchDocs();
        if (selectedDocId === id) setSelectedDocId(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Course Materials & RAG Knowledge Store"
        subtitle="Manage syllabi, textbooks, and past papers. Extracted chunks are vectorized for zero-hallucination diagnostics."
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">
        {/* Upload Form Box */}
        <div className="bg-white dark:bg-navy-850 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600 dark:text-teal-neon" />
                <span>Ingest New Study Material</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Supported formats: PDF (.pdf), Plain Text (.txt), Markdown (.md). Preserves page numbers and section headers.
              </p>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-navy-900 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "upload"
                    ? "bg-white dark:bg-navy-800 text-indigo-600 dark:text-teal-neon shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("direct")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "direct"
                    ? "bg-white dark:bg-navy-800 text-indigo-600 dark:text-teal-neon shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4: Transport Layer Notes"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="syllabus">Syllabus / Course Outline</option>
                  <option value="textbook">Textbook Chapter</option>
                  <option value="notes">Lecture Notes / Summary</option>
                  <option value="past_paper">Past Exam Paper / Question Bank</option>
                </select>
              </div>
            </div>

            {activeTab === "upload" ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-teal-electric rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-navy-900/50">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.txt,.md,.json"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <FileText className="w-8 h-8 text-indigo-600 dark:text-teal-neon mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {file ? file.name : "Click to select a PDF or text file"}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF, TXT, MD up to 15MB"}
                  </span>
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Text / Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste lecture notes or chapter content here..."
                  value={directText}
                  onChange={(e) => setDirectText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>
            )}

            {statusMsg && (
              <div
                className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
                  statusMsg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Extracting Text & Sliding-Window Chunking...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Process & Vectorize Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Documents and Chunks Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Documents List */}
          <div className="bg-white dark:bg-navy-850 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Ingested Materials ({documents.length})
              </h3>
              <span className="text-[11px] font-bold text-teal-neon">
                {documents.reduce((acc, d) => acc + d.chunkCount, 0)} Chunks
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {documents.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-600 dark:border-teal-electric bg-indigo-50/60 dark:bg-navy-900 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-navy-900/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {doc.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 font-bold uppercase text-slate-600 dark:text-slate-300">
                            {doc.category.replace("_", " ")}
                          </span>
                          {doc.isSample && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold border border-teal-500/20">
                              Sample Data
                            </span>
                          )}
                        </div>
                      </div>

                      {!doc.isSample && (
                        <button
                          onClick={(e) => handleDelete(doc.id, e)}
                          title="Delete Document"
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{doc.chunkCount} RAG chunks</span>
                      <span>Page count: {doc.pageCount || 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chunks Inspector */}
          <div className="lg:col-span-2 bg-white dark:bg-navy-850 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-teal-neon" />
                  <span>RAG Vector Chunks ({chunks.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Extracted via 350-word sliding window with 50-word overlap. Chunks preserve document name, page number, and section title for precise citations.
                </p>
              </div>
            </div>

            {chunks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select a document from the left to inspect its indexed vector chunks.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {chunks.map((chk, i) => (
                  <div
                    key={chk.id || i}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-navy-900/60 space-y-2 hover:border-indigo-300 dark:hover:border-teal-electric transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-700 dark:text-teal-neon flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" />
                        {chk.sectionTitle || `Chunk #${i + 1}`}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Page {chk.pageNumber} • ~{chk.tokenEstimate} tokens
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed bg-white dark:bg-navy-950 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
                      {chk.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

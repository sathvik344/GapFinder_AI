"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import {
  FileText,
  Layers,
  Trash2,
  Upload,
  AlertCircle,
  CheckCircle,
  Sparkles,
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
    <div className="flex-1 pb-16 bg-ivory-50 dark:bg-pine-950 transition-colors duration-200">
      <Header
        title="Course Materials & RAG Knowledge Store"
        subtitle="Manage syllabi, textbooks, and past papers. Extracted chunks are vectorized for zero-hallucination diagnostics."
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">
        {/* Upload Form Box */}
        <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 border border-ivory-200 dark:border-pine-800 shadow-paper transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-forest-950 dark:text-ivory-50 flex items-center gap-2">
                <Upload className="w-5 h-5 text-coral-500" />
                <span>Ingest New Study Material</span>
              </h2>
              <p className="text-xs text-forest-600 dark:text-forest-400 mt-0.5">
                Supported formats: PDF (.pdf), Plain Text (.txt), Markdown (.md). Preserves page numbers and section headers.
              </p>
            </div>

            <div className="flex p-1 bg-ivory-100 dark:bg-pine-850 rounded-xl text-xs font-semibold self-start sm:self-auto border border-ivory-200 dark:border-pine-800">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "upload"
                    ? "bg-white dark:bg-pine-800 text-forest-950 dark:text-ivory-50 shadow-paper font-bold"
                    : "text-forest-600 dark:text-forest-400"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("direct")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "direct"
                    ? "bg-white dark:bg-pine-800 text-forest-950 dark:text-ivory-50 shadow-paper font-bold"
                    : "text-forest-600 dark:text-forest-400"
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4: Transport Layer Notes"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-850 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-coral-500 outline-none transition-colors shadow-paper"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1">
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-850 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-coral-500 outline-none shadow-paper"
                >
                  <option value="syllabus">Syllabus / Course Outline</option>
                  <option value="textbook">Textbook Chapter</option>
                  <option value="notes">Lecture Notes / Summary</option>
                  <option value="past_paper">Past Exam Paper / Question Bank</option>
                </select>
              </div>
            </div>

            {activeTab === "upload" ? (
              <div className="border-2 border-dashed border-ivory-300 dark:border-pine-750 hover:border-coral-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-ivory-50/50 dark:bg-pine-950/40">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.txt,.md,.json"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <FileText className="w-8 h-8 text-coral-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-forest-900 dark:text-ivory-100 block">
                    {file ? file.name : "Click to select a PDF or text file"}
                  </span>
                  <span className="text-[11px] text-forest-500 dark:text-forest-400 mt-1 block">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF, TXT, MD up to 15MB"}
                  </span>
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1">
                  Document Text / Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste lecture notes or chapter content here..."
                  value={directText}
                  onChange={(e) => setDirectText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-850 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-coral-500 outline-none font-mono shadow-paper"
                />
              </div>
            )}

            {statusMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  statusMsg.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-coral-50 dark:bg-coral-950/40 text-coral-800 dark:text-coral-300 border border-coral-200 dark:border-coral-800"
                }`}
              >
                {statusMsg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-coral-600" />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-coral transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Chunking & Indexing Material...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Process & Vectorize Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Dual-Column Document List & Chunks Browser */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document List */}
          <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-forest-950 dark:text-ivory-50">
                Indexed Corpus ({documents.length})
              </h3>
              <span className="text-[11px] text-coral-600 dark:text-coral-400 font-semibold">
                {documents.reduce((acc, d) => acc + d.chunkCount, 0)} Total Chunks
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {documents.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-coral-500 bg-coral-50/50 dark:bg-coral-950/20 shadow-paper"
                        : "border-ivory-200 dark:border-pine-800 hover:border-ivory-300 dark:hover:border-pine-700 bg-white dark:bg-pine-850"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-forest-950 dark:text-ivory-50 truncate block">
                          {doc.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-forest-500 dark:text-forest-400">
                          <span className="uppercase font-semibold text-[10px] text-coral-600 dark:text-coral-400">
                            {doc.category.replace("_", " ")}
                          </span>
                          <span>•</span>
                          <span>{doc.chunkCount} Chunks</span>
                          <span>•</span>
                          <span>{doc.pageCount} Pages</span>
                        </div>
                      </div>

                      {!doc.isSample && (
                        <button
                          onClick={(e) => handleDelete(doc.id, e)}
                          className="p-1 rounded text-forest-400 hover:text-coral-600 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extracted Chunks Inspector */}
          <div className="lg:col-span-2 bg-white dark:bg-pine-900 rounded-2xl p-6 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-forest-950 dark:text-ivory-50 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-coral-500" />
                  <span>RAG Chunk & Metadata Browser</span>
                </h3>
                <p className="text-xs text-forest-600 dark:text-forest-400 mt-0.5">
                  Inspect the exact passage boundaries, page references, and section headers fed to Gemini.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-ivory-100 dark:bg-pine-850 text-forest-800 dark:text-ivory-100 border border-ivory-200 dark:border-pine-750">
                {chunks.length} Extracted Chunks
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {chunks.map((chk, i) => (
                <div
                  key={chk.id || i}
                  className="p-4 rounded-xl border border-ivory-200 dark:border-pine-800 bg-ivory-50/50 dark:bg-pine-850/60 space-y-2 shadow-paper"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-coral-600 dark:text-coral-400 truncate">
                      {chk.sectionTitle || "Section Passage"}
                    </span>
                    <span className="text-[11px] font-semibold text-forest-500 dark:text-forest-400 shrink-0">
                      Page {chk.pageNumber} • {chk.tokenEstimate || 350} tokens
                    </span>
                  </div>

                  <p className="text-xs text-forest-800 dark:text-forest-200 leading-relaxed font-sans font-normal">
                    {chk.content}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-forest-500 dark:text-forest-400 border-t border-ivory-150 dark:border-pine-800">
                    <span>Vector: {chk.embedding ? "Indexed 768-dim float" : "Dense Vector Stored"}</span>
                    <span>Document: {chk.documentName}</span>
                  </div>
                </div>
              ))}
              {chunks.length === 0 && (
                <div className="p-8 text-center text-xs text-forest-400">
                  Select a document from the left to inspect its indexed passages.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          text: `Document processed successfully! Extracted ${data.chunksCreated} chunks.`,
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
    if (confirm("Delete this document and all its indexed chunks?")) {
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
        title="Study Materials & Vector Corpus"
        subtitle="Manage syllabi, textbooks, and past papers. Extracted chunks are embedded for RAG."
      />

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Upload Form Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <span>Upload New Study Material</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Supported formats: PDF (.pdf), Plain Text (.txt), Markdown (.md).
              </p>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "upload" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("direct")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "direct" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4: Transport Layer Notes"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="syllabus">Syllabus / Course Outline</option>
                  <option value="textbook">Textbook Chapter</option>
                  <option value="notes">Lecture Notes / Summary</option>
                  <option value="past_paper">Past Exam Paper / Question Bank</option>
                </select>
              </div>
            </div>

            {activeTab === "upload" ? (
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.txt,.md,.json"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-800 block">
                    {file ? file.name : "Click to select a PDF or text file"}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF, TXT, MD up to 10MB"}
                  </span>
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Text / Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste lecture notes or chapter content here..."
                  value={directText}
                  onChange={(e) => setDirectText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>
            )}

            {statusMsg && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                  statusMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Extracting Text & Chunking...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Process & Index Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Documents and Chunks Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Documents List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Uploaded Materials ({documents.length})
              </h3>
              <span className="text-xs text-slate-500">
                {documents.reduce((acc, d) => acc + d.chunkCount, 0)} Total Chunks
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {documents.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {doc.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-semibold uppercase text-slate-600">
                            {doc.category.replace("_", " ")}
                          </span>
                          {doc.isSample && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-semibold">
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

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{doc.chunkCount} RAG chunks</span>
                      <span>Page count: {doc.pageCount || 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chunks Inspector */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>RAG Vector Chunks ({chunks.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chunks preserve document name, page number, and section headers for accurate source citations.
                </p>
              </div>
            </div>

            {chunks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select a document from the left to inspect its indexed chunks.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {chunks.map((chk, i) => (
                  <div
                    key={chk.id || i}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-700 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" />
                        {chk.sectionTitle || `Chunk #${i + 1}`}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Page {chk.pageNumber} • ~{chk.tokenEstimate} tokens
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-mono leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
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

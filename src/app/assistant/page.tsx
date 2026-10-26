"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SourceCitationModal } from "@/components/SourceCitationModal";
import {
  BookOpen,
  BrainCircuit,
  Send,
  Sparkles,
  User,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  FileCheck,
  Target,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { GroundedChatMessage, SourceCitation } from "@/lib/types";

const SUGGESTED_QUERIES = [
  {
    topic: "Transport Layer",
    query: "Explain the TCP 3-way handshake and why SYN consumes a sequence number.",
  },
  {
    topic: "TCP Congestion Control",
    query: "How does TCP Reno handle 3 duplicate ACKs versus a Retransmission Timeout (RTO)?",
  },
  {
    topic: "Routing Algorithms",
    query: "Explain the Count-to-Infinity problem and how Split Horizon resolves it.",
  },
  {
    topic: "Error Detection",
    query: "What is the CRC checksum calculation procedure with generator polynomial G(x)?",
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<GroundedChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "Welcome to your GapFinder Grounded Concept Tutor. Every technical explanation here is synthesized strictly from your uploaded syllabus, textbooks, and notes with verifiable page citations. Select a curriculum query below or enter a technical concept to review.",
      timestamp: new Date().toISOString(),
      groundedInUploadedCorpus: true,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<SourceCitation | null>(null);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: GroundedChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrieve grounded explanation");
      }

      const botMsg: GroundedChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: "assistant",
        text: data.text,
        timestamp: new Date().toISOString(),
        citations: data.citations,
        groundedInUploadedCorpus: data.groundedInUploadedCorpus,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: GroundedChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: "assistant",
        text: `Error processing grounded query: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Header
        title="Grounded Curriculum Tutor & Concept Explainer"
        subtitle="Explanations synthesized strictly from retrieved textbook and lecture chunks with verifiable citations."
        actionButton={
          <Link
            href="/quiz"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Test This Concept</span>
          </Link>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6 min-h-0">
        {/* Left Sidebar: Concept Bank & Grounding Safeguard */}
        <div className="hidden lg:flex flex-col w-80 shrink-0 space-y-4 overflow-y-auto pr-1">
          {/* Grounding Safeguard Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-teal-neon text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-neon" />
              <span>Zero-Hallucination RAG</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              The AI tutor is constrained to only answer using sentences grounded in your indexed syllabus and textbooks. Answers include direct clickable page citations.
            </p>
          </div>

          {/* Quick Curriculum Queries */}
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
              High-Yield Exam Prompts
            </span>
            <div className="space-y-2">
              {SUGGESTED_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sq.query)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 hover:bg-indigo-50/70 dark:hover:bg-navy-800 border border-slate-200/70 dark:border-slate-800 text-xs transition-colors space-y-1 group"
                >
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-teal-neon uppercase tracking-wide block">
                    {sq.topic}
                  </span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white block leading-snug line-clamp-2">
                    {sq.query}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Explanation Feed */}
        <div className="flex-1 flex flex-col bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden min-h-0">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.sender === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      isAssistant
                        ? "bg-gradient-to-tr from-indigo-600 to-violet-electric text-white shadow-xs"
                        : "bg-teal-electric text-white"
                    }`}
                  >
                    {isAssistant ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                      isAssistant
                        ? "bg-slate-50 dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                        : "bg-indigo-600 text-white font-medium shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Citations Pills for Grounded Answers */}
                    {isAssistant && msg.citations && msg.citations.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Grounded Citations:
                        </span>
                        {msg.citations.map((cite, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCitation(cite)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-navy-800 text-indigo-700 dark:text-teal-neon text-[11px] font-bold border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>
                              {cite.documentName} (p. {cite.pageNumber})
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 max-w-2xl mr-auto animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="rounded-2xl p-4 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Retrieving relevant chunks and verifying citations...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Inquiry Input Bar */}
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-900/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask a technical concept grounded in your syllabus and notes..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <span>Explain</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Source Citation Preview Modal */}
      <SourceCitationModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />
    </div>
  );
}

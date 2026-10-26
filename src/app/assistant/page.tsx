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
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-coral transition-all"
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
          <div className="p-4 rounded-2xl bg-white dark:bg-pine-900 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-2">
            <div className="flex items-center gap-2 text-forest-800 dark:text-forest-200 text-xs font-bold uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero-Hallucination RAG</span>
            </div>
            <p className="text-[11px] text-forest-700/80 dark:text-forest-300/80 leading-relaxed font-sans">
              The AI tutor is constrained to only answer using sentences grounded in your indexed syllabus and textbooks. Answers include direct clickable page citations.
            </p>
          </div>

          {/* Quick Curriculum Queries */}
          <div className="p-4 rounded-2xl bg-white dark:bg-pine-900 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-3">
            <span className="text-xs font-serif font-bold text-forest-950 dark:text-forest-50 block tracking-tight">
              High-Yield Exam Prompts
            </span>
            <div className="space-y-2">
              {SUGGESTED_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sq.query)}
                  className="w-full text-left p-3 rounded-xl bg-ivory-50/80 dark:bg-pine-950/70 hover:bg-coral-50/40 dark:hover:bg-pine-800 border border-ivory-200 dark:border-pine-800/80 hover:border-coral-300 dark:hover:border-coral-700/50 text-xs transition-all space-y-1 group"
                >
                  <span className="text-[10px] font-mono font-bold text-coral-600 dark:text-coral-400 uppercase tracking-wider block">
                    {sq.topic}
                  </span>
                  <span className="text-[11px] text-forest-800 dark:text-forest-200 group-hover:text-forest-950 dark:group-hover:text-white block leading-snug font-serif">
                    {sq.query}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Explanation Feed */}
        <div className="flex-1 flex flex-col bg-white dark:bg-pine-900 rounded-2xl border border-ivory-200 dark:border-pine-800 shadow-paper overflow-hidden min-h-0">
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
                        ? "bg-forest-900 dark:bg-pine-800 text-coral-400 border border-forest-800 dark:border-pine-700 shadow-xs"
                        : "bg-coral-500 text-white shadow-coral"
                    }`}
                  >
                    {isAssistant ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                      isAssistant
                        ? "bg-ivory-50/80 dark:bg-pine-950/80 border border-ivory-200 dark:border-pine-800 text-forest-900 dark:text-forest-100 shadow-paper font-serif"
                        : "bg-coral-500 text-white font-medium shadow-coral font-sans"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Citations Pills for Grounded Answers */}
                    {isAssistant && msg.citations && msg.citations.length > 0 && (
                      <div className="pt-2 border-t border-ivory-200 dark:border-pine-800 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-forest-500 dark:text-forest-400 font-mono font-bold uppercase tracking-wider">
                          Grounded Citations:
                        </span>
                        {msg.citations.map((cite, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCitation(cite)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-pine-900 text-forest-800 dark:text-forest-200 text-[11px] font-mono font-semibold border border-ivory-300 dark:border-pine-750 hover:border-coral-400 hover:text-coral-600 dark:hover:text-coral-400 transition-colors shadow-xs"
                          >
                            <BookOpen className="w-3 h-3 text-coral-500" />
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
                <div className="w-8 h-8 rounded-xl bg-forest-900 text-coral-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="rounded-2xl p-4 bg-ivory-50/80 dark:bg-pine-950/80 border border-ivory-200 dark:border-pine-800 text-xs text-forest-600 dark:text-forest-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
                    <span className="font-serif">Retrieving relevant chunks and verifying citations...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Inquiry Input Bar */}
          <div className="p-4 border-t border-ivory-200 dark:border-pine-800 bg-ivory-50/60 dark:bg-pine-950/50">
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
                className="flex-1 px-4 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-900 text-forest-950 dark:text-forest-50 placeholder:text-forest-400 dark:placeholder:text-forest-500 text-xs focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-coral"
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

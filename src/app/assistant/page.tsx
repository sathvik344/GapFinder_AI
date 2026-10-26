"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { SourceCitationModal } from "@/components/SourceCitationModal";
import {
  BookOpen,
  Bot,
  Send,
  Sparkles,
  User,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { GroundedChatMessage, SourceCitation } from "@/lib/types";

const SUGGESTED_QUERIES = [
  "Explain the TCP 3-way handshake and why SYN consumes a sequence number.",
  "How does TCP Reno handle 3 duplicate ACKs versus a Retransmission Timeout (RTO)?",
  "Explain the Count-to-Infinity problem and how Split Horizon resolves it.",
  "What is the CRC checksum calculation procedure with generator polynomial G(x)?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<GroundedChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "Hello! I am your GapFinder AI Study Assistant. Every explanation I provide is grounded strictly in your uploaded syllabus, textbooks, and lecture notes, complete with page citations. What concept would you like to review today?",
      timestamp: new Date().toISOString(),
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
        throw new Error(data.error || "Failed to get explanation");
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
        title="Topic Explanation Assistant"
        subtitle="Conversational tutor strictly grounded in your uploaded study material with source citations."
      />

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-6 min-h-0">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl shadow-xs space-y-3 ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Grounded Citation Pills */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.citations.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveCitation(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[10px] border border-indigo-100 transition-colors"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>
                          {c.documentName} (p. {c.pageNumber})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-2 text-slate-500">
                <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Searching vector corpus & synthesizing grounded explanation...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries Chips */}
        <div className="py-3 flex flex-wrap gap-2">
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-600 transition-all truncate max-w-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-md flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question about your uploaded materials (e.g. TCP Slow Start threshold)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2 text-xs outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Source Citation Modal */}
      <SourceCitationModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />
    </div>
  );
}

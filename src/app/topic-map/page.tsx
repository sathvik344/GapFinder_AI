"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TopicBadge } from "@/components/TopicBadge";
import {
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Layers,
  Plus,
  Target,
  Sparkles,
} from "lucide-react";
import { Topic } from "@/lib/types";

export default function TopicMapPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newUnit, setNewUnit] = useState("Unit 6: Advanced Topics");
  const [newWeightage, setNewWeightage] = useState<"High" | "Medium" | "Low">("Medium");
  const [newSubtopics, setNewSubtopics] = useState("");

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/topics");
      const data = await res.json();
      if (data.topics) setTopics(data.topics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTopicName,
          unit: newUnit,
          examWeightage: newWeightage,
          subtopics: newSubtopics.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTopicName("");
        setNewSubtopics("");
        await fetchTopics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Syllabus Topic Map & Mastery Hierarchy"
        subtitle="Structured syllabus decomposition with real-time mastery tracking."
        actionButton={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Syllabus Topic</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">
        {/* Topic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Header Unit & Mastery */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {topic.unit}
                  </span>
                  <TopicBadge level={topic.masteryLevel} score={topic.currentScore} />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {topic.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {topic.description}
                </p>

                {/* Subtopic Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {topic.subtopics.map((sub, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Meta & Quiz CTA */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Weightage: <strong className="text-slate-700 dark:text-slate-200">{topic.examWeightage}</strong>
                  </span>
                  <span>
                    Attempted: <strong className="text-slate-700 dark:text-slate-200">{topic.questionsAttempted} Qs</strong>
                  </span>
                </div>

                <Link
                  href={`/quiz?topicId=${topic.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Test Topic Mastery</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Topic */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add New Syllabus Topic
              </h3>
              <form onSubmit={handleAddTopic} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless LANs & 802.11 Protocols"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      required
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Weightage
                    </label>
                    <select
                      value={newWeightage}
                      onChange={(e) => setNewWeightage(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subtopics (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSMA/CA, RTS/CTS Handshake, SSID"
                    value={newSubtopics}
                    onChange={(e) => setNewSubtopics(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Save Topic
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

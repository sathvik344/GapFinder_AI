"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { TopicBadge } from "@/components/TopicBadge";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { GapAnalysisReport, QuizResult, Topic } from "@/lib/types";

export default function DashboardPage() {
  const [report, setReport] = useState<GapAnalysisReport | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizResult[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [repRes, topRes, docRes] = await Promise.all([
          fetch("/api/gap-report"),
          fetch("/api/topics"),
          fetch("/api/documents"),
        ]);

        const repData = await repRes.json();
        const topData = await topRes.json();

        if (repData.report) setReport(repData.report);
        if (topData.topics) setTopics(topData.topics);

        // Fetch recent quizzes
        const quizRes = await fetch("/api/quiz/evaluate", { method: "GET" }).catch(() => null);
        // From storage endpoint or fallback
      } catch (e) {
        console.error("Dashboard load failed:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const weakCount = report?.weakTopics.length || 0;
  const mediumCount = report?.mediumTopics.length || 0;
  const strongCount = report?.strongTopics.length || 0;
  const readiness = report?.overallReadiness || 0;

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Student Learning Dashboard"
        subtitle="Real-time knowledge gap analytics and exam readiness monitoring."
        actionButton={
          <Link
            href="/quiz"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Take Diagnostic Quiz</span>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Sample Data Notice Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">
                  Preloaded Sample Subject: Computer Networks
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Sample Data Active
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                4 study documents parsed (Syllabus, Textbook, Notes, Past Exams) with 31 RAG chunks ready for gap analysis.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/materials"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium border border-white/20 transition-colors"
            >
              Inspect Corpus
            </Link>
            <Link
              href="/revision-plan"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              View Revision Plan
            </Link>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Overall Readiness"
            value={`${readiness}%`}
            subtitle="Weighted across syllabus modules"
            icon={TrendingUp}
            colorScheme={readiness >= 75 ? "emerald" : readiness >= 60 ? "amber" : "rose"}
            trend={{
              value: readiness >= 80 ? "+5% Target met" : `${80 - readiness}% below target`,
              isPositive: readiness >= 80,
            }}
          />
          <StatCard
            title="Weak Priority Topics"
            value={weakCount}
            subtitle="Scoring < 60% in diagnostic tests"
            icon={AlertTriangle}
            colorScheme="rose"
          />
          <StatCard
            title="Medium Mastery Topics"
            value={mediumCount}
            subtitle="Scoring 60% – 79%"
            icon={BookOpen}
            colorScheme="amber"
          />
          <StatCard
            title="Strong Mastered Topics"
            value={strongCount}
            subtitle="Scoring ≥ 80% (Exam ready)"
            icon={Award}
            colorScheme="emerald"
          />
        </div>

        {/* Middle Section: Mastery Breakdown + High Priority Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topic Mastery Distribution */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Topic Mastery Breakdown</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated from diagnostic quiz attempts and unit weightage.
                </p>
              </div>
              <Link
                href="/topic-map"
                className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Full Topic Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {topics.map((topic) => {
                const pct = topic.currentScore;
                const barColor =
                  topic.masteryLevel === "strong"
                    ? "bg-emerald-500"
                    : topic.masteryLevel === "medium"
                    ? "bg-amber-500"
                    : "bg-rose-500";

                return (
                  <div
                    key={topic.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{topic.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({topic.unit})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{pct}%</span>
                        <TopicBadge level={topic.masteryLevel} />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Exam Weightage: <strong className="text-slate-600">{topic.examWeightage}</strong></span>
                      <span>Target: {topic.targetScore}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Knowledge Gaps Action Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Identified Gaps</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                  {report?.identifiedGaps.length || 0} Alert(s)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Actionable study targets requiring immediate review before the exam.
              </p>

              <div className="space-y-3 mt-4">
                {report?.identifiedGaps.slice(0, 3).map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate">{gap.topicName}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          gap.severity === "critical"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {gap.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{gap.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link
                href="/gap-report"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <span>Explore Full Gap Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">RAG Grounded Quizzes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate multiple-choice and short-answer questions created strictly from your uploaded syllabus and lecture notes.
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-700 pt-1"
            >
              <span>Start Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Deterministic Revision Planner</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dynamic spaced repetition schedule prioritizing weak topics according to your exam deadline and daily study hours.
            </p>
            <Link
              href="/revision-plan"
              className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700 pt-1"
            >
              <span>Build Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Grounded AI Study Tutor</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ask complex conceptual questions and receive precise answers with clickable citations referencing page numbers and notes.
            </p>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-1 text-xs text-purple-600 font-semibold hover:text-purple-700 pt-1"
            >
              <span>Ask Tutor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

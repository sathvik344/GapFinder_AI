"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { TopicBadge } from "@/components/TopicBadge";
import { useAuth } from "@/components/AuthContext";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Flame,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  UploadCloud,
} from "lucide-react";
import { GapAnalysisReport, QuizResult, Topic, DocumentMetadata } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<GapAnalysisReport | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Completed task tracker in dashboard
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

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
        const docData = await docRes.json();

        if (repData.report) setReport(repData.report);
        if (repData.recentAttempts) setRecentAttempts(repData.recentAttempts);
        if (topData.topics) setTopics(topData.topics);
        if (docData.documents) setDocuments(docData.documents);
      } catch (e) {
        console.error("Dashboard load failed:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const weakCount = report?.weakTopics.length || 0;
  const mediumCount = report?.mediumTopics.length || 0;
  const strongCount = report?.strongTopics.length || 0;
  const readiness = report?.overallReadiness || 0;

  // Real calculation of quiz accuracy from attempts
  const averageAccuracy =
    recentAttempts.length > 0
      ? Math.round(
          recentAttempts.reduce((sum: number, a: QuizResult) => sum + a.overallScore, 0) /
            recentAttempts.length
        )
      : 60;

  const studentFirstName = user?.name ? user.name.split(" ")[0] : "Student";

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Learning Analytics Dashboard"
        subtitle="Real-time knowledge gap diagnostics, mastery tracking, and adaptive revision."
        actionButton={
          <Link
            href="/quiz"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-teal-neon" />
            <span>Take Diagnostic Quiz</span>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">
        {/* Welcome Section & Quick Action Hub */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 border border-slate-800 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-electric/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-teal-neon uppercase tracking-wider">
                Exam Readiness Overview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1 font-semibold">
                <Flame className="w-3 h-3 text-amber-400" />
                4-Day Study Streak
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Welcome back, {studentFirstName} 👋
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              You have <strong className="text-rose-400 font-bold">{weakCount} critical knowledge gaps</strong> in Computer Networks. Your personalized revision schedule allocates 50% of study time to weak topics to hit the 80% exam benchmark.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/materials"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all shadow-xs"
            >
              <UploadCloud className="w-4 h-4 text-teal-neon" />
              <span>Upload Materials</span>
            </Link>
            <Link
              href="/revision-plan"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Continue Revision Plan</span>
            </Link>
          </div>
        </div>

        {/* 4 Top KPI Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Overall Readiness"
            value={`${readiness}%`}
            subtitle="Weighted across syllabus units"
            icon={TrendingUp}
            colorScheme={readiness >= 75 ? "emerald" : readiness >= 60 ? "amber" : "rose"}
            trend={{
              value: readiness >= 80 ? "+5% Target Met" : `${80 - readiness}% below target`,
              isPositive: readiness >= 80,
            }}
          />
          <StatCard
            title="Weak Priority Topics"
            value={weakCount}
            subtitle="Scoring < 60% in diagnostic tests"
            icon={AlertTriangle}
            colorScheme="rose"
            trend={{
              value: `${weakCount} urgent gaps`,
              isPositive: weakCount === 0,
            }}
          />
          <StatCard
            title="Diagnostic Accuracy"
            value={`${averageAccuracy}%`}
            subtitle="Calculated across all quiz attempts"
            icon={BrainCircuit}
            colorScheme="teal"
          />
          <StatCard
            title="Mastered Topics"
            value={strongCount}
            subtitle="Scoring ≥ 80% (Exam Ready)"
            icon={Award}
            colorScheme="emerald"
          />
        </div>

        {/* Topic Mastery Tri-Split Visualization Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Curriculum Topic Mastery Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Classified using mathematical thresholds: Weak (&lt;60%), Medium (60–79%), Strong (≥80%).
              </p>
            </div>
            <Link
              href="/topic-map"
              className="text-xs text-indigo-600 dark:text-teal-neon font-bold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Explore Complete Syllabus Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. WEAK FOCUS ZONE (<60%) */}
            <div className="bg-white dark:bg-navy-850 rounded-2xl p-5 border border-rose-200/80 dark:border-rose-900/50 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                      Weak Focus Zone (&lt;60%)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40">
                    {report?.weakTopics.length || 0} Topics
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Priority study targets. Revision scheduler assigns 50% of available hours here.
                </p>

                <div className="space-y-2.5 pt-1">
                  {report?.weakTopics.map((top) => (
                    <div
                      key={top.id}
                      className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                          {top.name}
                        </span>
                        <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 shrink-0">
                          {top.currentScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-rose-200/60 dark:bg-rose-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all"
                          style={{ width: `${top.currentScore}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{top.unit}</span>
                        <Link
                          href={`/quiz?topic=${encodeURIComponent(top.id)}`}
                          className="font-bold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-0.5"
                        >
                          <span>Practice Now</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {(!report?.weakTopics || report.weakTopics.length === 0) && (
                    <div className="p-4 rounded-xl text-center text-xs text-slate-400 bg-slate-50 dark:bg-navy-900">
                      No weak topics detected. Great job!
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-rose-100 dark:border-rose-950">
                <span className="text-[11px] text-slate-400 font-medium">
                  Allocated Study Share: <strong className="text-rose-600 dark:text-rose-400">50%</strong>
                </span>
              </div>
            </div>

            {/* 2. MEDIUM REINFORCE ZONE (60–79%) */}
            <div className="bg-white dark:bg-navy-850 rounded-2xl p-5 border border-amber-200/80 dark:border-amber-900/50 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                      Medium Reinforce (60–79%)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/40">
                    {report?.mediumTopics.length || 0} Topics
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Moderate proficiency. Past paper drills and targeted retesting recommended.
                </p>

                <div className="space-y-2.5 pt-1">
                  {report?.mediumTopics.map((top) => (
                    <div
                      key={top.id}
                      className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                          {top.name}
                        </span>
                        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 shrink-0">
                          {top.currentScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-amber-200/60 dark:bg-amber-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${top.currentScore}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{top.unit}</span>
                        <Link
                          href={`/quiz?topic=${encodeURIComponent(top.id)}`}
                          className="font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-0.5"
                        >
                          <span>Retest</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {(!report?.mediumTopics || report.mediumTopics.length === 0) && (
                    <div className="p-4 rounded-xl text-center text-xs text-slate-400 bg-slate-50 dark:bg-navy-900">
                      No medium topics in this tier.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-amber-100 dark:border-amber-950">
                <span className="text-[11px] text-slate-400 font-medium">
                  Allocated Study Share: <strong className="text-amber-600 dark:text-amber-400">35%</strong>
                </span>
              </div>
            </div>

            {/* 3. STRONG MASTERED ZONE (≥80%) */}
            <div className="bg-white dark:bg-navy-850 rounded-2xl p-5 border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                      Strong Mastered (≥80%)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                    {report?.strongTopics.length || 0} Topics
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Exam-ready concepts. Requires minimal spaced repetition maintenance.
                </p>

                <div className="space-y-2.5 pt-1">
                  {report?.strongTopics.map((top) => (
                    <div
                      key={top.id}
                      className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                          {top.name}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {top.currentScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-200/60 dark:bg-emerald-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${top.currentScore}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{top.unit}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Exam Ready</span>
                      </div>
                    </div>
                  ))}
                  {(!report?.strongTopics || report.strongTopics.length === 0) && (
                    <div className="p-4 rounded-xl text-center text-xs text-slate-400 bg-slate-50 dark:bg-navy-900">
                      No strong topics yet. Complete quizzes to raise scores!
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-100 dark:border-emerald-950">
                <span className="text-[11px] text-slate-400 font-medium">
                  Allocated Study Share: <strong className="text-emerald-600 dark:text-emerald-400">15%</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Middle Section: Knowledge Gap Audit & Today's Study Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Identified Knowledge Gaps Audit */}
          <div className="lg:col-span-2 bg-white dark:bg-navy-850 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Knowledge Gap Diagnostic Audit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Actionable learning deficiencies identified from quiz submissions with source evidence.
                </p>
              </div>
              <Link
                href="/gap-report"
                className="text-xs text-indigo-600 dark:text-teal-neon font-bold hover:underline flex items-center gap-1"
              >
                <span>Full Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {report?.identifiedGaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-900/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {gap.topicName}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        gap.severity === "critical"
                          ? "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                          : "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                      }`}
                    >
                      {gap.severity}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-navy-850 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                      Diagnosed Concept: {gap.concept}
                    </span>
                    {gap.description}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Recommended Remediation: <span className="font-medium text-slate-700 dark:text-slate-300">{gap.recommendation}</span>
                    </span>
                    <Link
                      href="/assistant"
                      className="font-bold text-indigo-600 dark:text-teal-neon hover:underline shrink-0 text-xs ml-3"
                    >
                      Ask Tutor →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Quiz Attempts Log */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-3">
                Recent Diagnostic Assessment Logs
              </span>
              <div className="space-y-2">
                {recentAttempts.map((att: QuizResult, i: number) => (
                  <div
                    key={att.quizId || i}
                    className="p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-teal-neon flex items-center justify-center font-bold">
                        Q{i + 1}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          Computer Networks Diagnostic Assessment
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {att.totalQuestions} questions evaluated with partial credit • {new Date(att.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {att.overallScore}%
                      </span>
                      <TopicBadge
                        level={
                          att.overallScore >= 80 ? "strong" : att.overallScore >= 60 ? "medium" : "weak"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Today's Adaptive Revision Tasks */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-navy-850 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Today&apos;s Revision Slot
                  </h3>
                  <span className="text-[11px] text-teal-neon font-semibold">Day 1 of 14 • 2h Allocated</span>
                </div>
                <Link
                  href="/revision-plan"
                  className="text-xs text-indigo-600 dark:text-teal-neon font-bold hover:underline"
                >
                  Full Plan →
                </Link>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: "task-1",
                    topic: "TCP Congestion Control & Flow Control",
                    type: "Deep Dive Concept Review",
                    duration: "45 mins",
                    priority: "High (Weak)",
                  },
                  {
                    id: "task-2",
                    topic: "TCP Slow Start & AIMD Calculations",
                    type: "Active Recall & Derivations",
                    duration: "35 mins",
                    priority: "High (Weak)",
                  },
                  {
                    id: "task-3",
                    topic: "Routing Algorithms & Bellman-Ford",
                    type: "Past Paper Question Drill",
                    duration: "30 mins",
                    priority: "Medium",
                  },
                  {
                    id: "task-4",
                    topic: "CRC Checksum Generator Polynomial",
                    type: "Spaced Retention Check",
                    duration: "10 mins",
                    priority: "Maintenance",
                  },
                ].map((task) => {
                  const isDone = completedTasks[task.id];
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isDone
                          ? "bg-slate-50 dark:bg-navy-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                          : "bg-white dark:bg-navy-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={!!isDone}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-indigo-600 accent-indigo-600 dark:accent-indigo-500"
                        />
                        <div className="flex-1 space-y-1">
                          <span
                            className={`text-xs font-bold block leading-tight ${
                              isDone ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {task.topic}
                          </span>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{task.type}</span>
                            <span className="font-semibold text-indigo-600 dark:text-teal-neon">
                              {task.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <Link
                  href="/quiz"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>Start Today&apos;s Review Quiz</span>
                </Link>
              </div>
            </div>

            {/* Ingested Materials Summary Card */}
            <div className="bg-white dark:bg-navy-850 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Corpus Ingestion Status
                </span>
                <span className="text-[10px] font-bold text-teal-neon bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                  4 Documents Active
                </span>
              </div>

              <div className="space-y-2">
                {documents.slice(0, 4).map((doc: DocumentMetadata) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-teal-neon shrink-0" />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                        {doc.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {doc.chunkCount} chunks
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/materials"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Additional Textbooks / Papers</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

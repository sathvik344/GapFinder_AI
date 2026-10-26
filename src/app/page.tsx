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
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Flame,
  Plus,
  Sparkles,
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
    <div className="flex-1 pb-16 bg-ivory-50 dark:bg-pine-950 transition-colors duration-200">
      <Header
        title="Knowledge Diagnostic Dashboard"
        subtitle="Mathematical gap diagnostics, syllabus mastery tracking, and spaced revision."
        actionButton={
          <Link
            href="/quiz"
            className="flex items-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold shadow-coral transition-all"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Take Diagnostic Quiz</span>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">
        {/* Welcome Section & Quick Action Hub */}
        <div className="p-6 rounded-3xl bg-forest-950 border border-forest-850 text-ivory-50 shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-forest-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-coral-400 uppercase tracking-wider">
                Exam Readiness Overview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-900 text-forest-200 border border-forest-750 flex items-center gap-1 font-semibold">
                <Flame className="w-3 h-3 text-coral-400" />
                4-Day Diagnostic Streak
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-ivory-50">
              Welcome back, {studentFirstName}
            </h2>
            <p className="text-xs text-forest-200 max-w-xl leading-relaxed">
              You currently have <strong className="text-coral-400 font-bold">{weakCount} critical knowledge gaps</strong> in Computer Networks. Your personalized revision schedule allocates 50% of study time to weak topics to hit the 80% exam benchmark.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/materials"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-850 text-ivory-100 text-xs font-semibold border border-forest-750 transition-all shadow-paper"
            >
              <UploadCloud className="w-4 h-4 text-coral-400" />
              <span>Upload Materials</span>
            </Link>
            <Link
              href="/revision-plan"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-coral transition-all"
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
            colorScheme={readiness >= 75 ? "emerald" : readiness >= 60 ? "amber" : "coral"}
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
            colorScheme="coral"
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
            colorScheme="forest"
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
              <h3 className="text-base font-extrabold text-forest-950 dark:text-ivory-50 tracking-tight">
                Curriculum Topic Mastery Breakdown
              </h3>
              <p className="text-xs text-forest-600 dark:text-forest-400 mt-0.5">
                Classified using documented thresholds: Weak (&lt;60%), Medium (60–79%), Strong (≥80%).
              </p>
            </div>
            <Link
              href="/topic-map"
              className="text-xs text-coral-600 dark:text-coral-400 font-bold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Explore Complete Syllabus Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. WEAK FOCUS ZONE (<60%) */}
            <div className="bg-white dark:bg-pine-900 rounded-2xl p-5 border border-coral-200/90 dark:border-coral-900/60 shadow-paper space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-coral-500 animate-pulse" />
                    <span className="text-xs font-bold text-coral-700 dark:text-coral-400 uppercase tracking-wide">
                      Weak Focus Zone (&lt;60%)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-coral-600 dark:text-coral-300 px-2 py-0.5 rounded-full bg-coral-50 dark:bg-coral-950/60 border border-coral-200 dark:border-coral-800/60">
                    {report?.weakTopics.length || 0} Topics
                  </span>
                </div>
                <p className="text-[11px] text-forest-600 dark:text-forest-400">
                  Priority study targets. Revision scheduler assigns 50% of available study hours here.
                </p>

                <div className="space-y-2.5 pt-1">
                  {report?.weakTopics.map((top) => (
                    <div
                      key={top.id}
                      className="p-3 rounded-xl bg-coral-50/40 dark:bg-coral-950/20 border border-coral-100 dark:border-coral-900/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-forest-950 dark:text-ivory-50 leading-snug">
                          {top.name}
                        </span>
                        <span className="text-xs font-extrabold text-coral-600 dark:text-coral-400 shrink-0">
                          {top.currentScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-coral-100 dark:bg-coral-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-coral-500 rounded-full transition-all"
                          style={{ width: `${top.currentScore}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-forest-500 dark:text-forest-400">
                        <span>{top.unit}</span>
                        <Link
                          href={`/quiz?topic=${encodeURIComponent(top.id)}`}
                          className="font-bold text-coral-600 dark:text-coral-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>Practice Now</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {(!report?.weakTopics || report.weakTopics.length === 0) && (
                    <div className="p-4 rounded-xl text-center text-xs text-forest-500 bg-ivory-100 dark:bg-pine-850">
                      No weak topics detected. Great job!
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-coral-100 dark:border-coral-900/60">
                <span className="text-[11px] text-forest-600 dark:text-forest-400 font-medium">
                  Allocated Study Share: <strong className="text-coral-600 dark:text-coral-400 font-bold">50%</strong>
                </span>
              </div>
            </div>

            {/* 2. MEDIUM REINFORCE ZONE (60–79%) */}
            <div className="bg-white dark:bg-pine-900 rounded-2xl p-5 border border-amber-200/90 dark:border-amber-900/60 shadow-paper space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">
                      Medium Reinforce (60–79%)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60">
                    {report?.mediumTopics.length || 0} Topics
                  </span>
                </div>
                <p className="text-[11px] text-forest-600 dark:text-forest-400">
                  Moderate proficiency. Past paper drills and targeted active recall recommended.
                </p>

                <div className="space-y-2.5 pt-1">
                  {report?.mediumTopics.map((top) => (
                    <div
                      key={top.id}
                      className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-forest-950 dark:text-ivory-50 leading-snug">
                          {top.name}
                        </span>
                        <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 shrink-0">
                          {top.currentScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-amber-100 dark:bg-amber-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${top.currentScore}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-forest-500 dark:text-forest-400">
                        <span>{top.unit}</span>
                        <Link
                          href={`/quiz?topic=${encodeURIComponent(top.id)}`}
                          className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                        >
                          <span>Retest</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {(!report?.mediumTopics || report.mediumTopics.length === 0) && (
                    <div className="p-4 rounded-xl text-center text-xs text-forest-500 bg-ivory-100 dark:bg-pine-850">
                      No medium topics in this tier.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-amber-100 dark:border-amber-900/60">
                <span className="text-[11px] text-forest-600 dark:text-forest-400 font-medium">
                  Allocated Study Share: <strong className="text-amber-700 dark:text-amber-400 font-bold">35%</strong>
                </span>
              </div>
            </div>

            {/* 3. STRONG MASTERED ZONE (≥80%) */}
            <div className="bg-white dark:bg-pine-900 rounded-2xl p-5 border border-emerald-200/90 dark:border-emerald-900/60 shadow-paper space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
                      Strong Mastered (≥80%)
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
                    {report?.strongTopics.length || 0} Topics
                  </span>
                </div>
                <p className="text-[11px] text-forest-600 dark:text-forest-400">
                  Exam-ready concepts. Requires minimal spaced repetition maintenance.
                </p>

                <div className="space-y-2.5 pt-1">
                  {report?.strongTopics.map((top) => (
                    <div
                      key={top.id}
                      className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-forest-950 dark:text-ivory-50 leading-snug">
                          {top.name}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0">
                          {top.currentScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${top.currentScore}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-forest-500 dark:text-forest-400">
                        <span>{top.unit}</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">Exam Ready</span>
                      </div>
                    </div>
                  ))}
                  {(!report?.strongTopics || report.strongTopics.length === 0) && (
                    <div className="p-4 rounded-xl text-center text-xs text-forest-500 bg-ivory-100 dark:bg-pine-850">
                      No strong topics yet. Complete quizzes to raise scores!
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/60">
                <span className="text-[11px] text-forest-600 dark:text-forest-400 font-medium">
                  Allocated Study Share: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">15%</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Middle Section: Knowledge Gap Audit & Today's Study Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Identified Knowledge Gaps Audit */}
          <div className="lg:col-span-2 bg-white dark:bg-pine-900 rounded-2xl p-6 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-forest-950 dark:text-ivory-50 tracking-tight">
                  Knowledge Gap Diagnostic Audit
                </h3>
                <p className="text-xs text-forest-600 dark:text-forest-400 mt-0.5">
                  Actionable deficiencies identified from quiz submissions with source citations.
                </p>
              </div>
              <Link
                href="/gap-report"
                className="text-xs text-coral-600 dark:text-coral-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>Full Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {report?.identifiedGaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-ivory-200 dark:border-pine-800 bg-ivory-50/60 dark:bg-pine-850/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-forest-950 dark:text-ivory-50">
                        {gap.topicName}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        gap.severity === "critical"
                          ? "bg-coral-100 dark:bg-coral-950/70 text-coral-700 dark:text-coral-300 border border-coral-200 dark:border-coral-800"
                          : "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {gap.severity}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-pine-900 border border-ivory-200 dark:border-pine-800 text-xs text-forest-800 dark:text-forest-200 leading-relaxed shadow-paper">
                    <span className="font-bold text-forest-950 dark:text-ivory-50 block mb-0.5">
                      Diagnosed Concept: {gap.concept}
                    </span>
                    {gap.description}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-forest-600 dark:text-forest-400 text-[11px]">
                      Remediation: <span className="font-medium text-forest-900 dark:text-ivory-100">{gap.recommendation}</span>
                    </span>
                    <Link
                      href="/assistant"
                      className="font-bold text-coral-600 dark:text-coral-400 hover:underline shrink-0 text-xs ml-3"
                    >
                      Ask Tutor →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Quiz Attempts Log */}
            <div className="pt-4 border-t border-ivory-150 dark:border-pine-800">
              <span className="text-xs font-bold text-forest-950 dark:text-ivory-50 block mb-3">
                Recent Diagnostic Assessment Logs
              </span>
              <div className="space-y-2">
                {recentAttempts.map((att: QuizResult, i: number) => (
                  <div
                    key={att.quizId || i}
                    className="p-3 rounded-xl bg-white dark:bg-pine-850 border border-ivory-200 dark:border-pine-800 flex items-center justify-between text-xs shadow-paper"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-forest-100 dark:bg-pine-750 text-forest-800 dark:text-ivory-50 flex items-center justify-center font-bold">
                        Q{i + 1}
                      </div>
                      <div>
                        <span className="font-bold text-forest-950 dark:text-ivory-50 block">
                          Computer Networks Diagnostic Assessment
                        </span>
                        <span className="text-[10px] text-forest-500 dark:text-forest-400">
                          {att.totalQuestions} questions evaluated with partial credit • {new Date(att.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-forest-950 dark:text-ivory-50">
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
            <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-forest-950 dark:text-ivory-50 tracking-tight">
                    Today&apos;s Revision Slot
                  </h3>
                  <span className="text-[11px] text-coral-600 dark:text-coral-400 font-semibold">Day 1 of 14 • 2h Allocated</span>
                </div>
                <Link
                  href="/revision-plan"
                  className="text-xs text-forest-700 dark:text-forest-300 font-bold hover:underline"
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
                          ? "bg-ivory-100/60 dark:bg-pine-950/40 border-ivory-200 dark:border-pine-800 opacity-60"
                          : "bg-white dark:bg-pine-850 border-ivory-200 dark:border-pine-800 hover:border-coral-300 dark:hover:border-pine-700 shadow-paper"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={!!isDone}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-coral-500 accent-coral-500"
                        />
                        <div className="flex-1 space-y-1">
                          <span
                            className={`text-xs font-bold block leading-tight ${
                              isDone ? "line-through text-forest-400" : "text-forest-950 dark:text-ivory-50"
                            }`}
                          >
                            {task.topic}
                          </span>
                          <div className="flex items-center justify-between text-[10px] text-forest-500 dark:text-forest-400">
                            <span>{task.type}</span>
                            <span className="font-semibold text-coral-600 dark:text-coral-400">
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-coral transition-all"
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>Start Today&apos;s Review Quiz</span>
                </Link>
              </div>
            </div>

            {/* Ingested Materials Summary Card */}
            <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-forest-600 dark:text-forest-400 tracking-wider">
                  Corpus Ingestion Status
                </span>
                <span className="text-[10px] font-bold text-forest-700 dark:text-forest-300 bg-forest-100 dark:bg-pine-800 px-2 py-0.5 rounded-full border border-forest-200 dark:border-pine-700">
                  4 Documents Active
                </span>
              </div>

              <div className="space-y-2">
                {documents.slice(0, 4).map((doc: DocumentMetadata) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-xl bg-ivory-50 dark:bg-pine-850 border border-ivory-200 dark:border-pine-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-coral-500 shrink-0" />
                      <span className="font-bold text-forest-950 dark:text-ivory-50 truncate text-[11px]">
                        {doc.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-forest-500 dark:text-forest-400 shrink-0">
                      {doc.chunkCount} chunks
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/materials"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-ivory-300 dark:border-pine-700 text-xs font-semibold text-forest-700 dark:text-forest-300 hover:text-coral-600 hover:border-coral-400 transition-colors"
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

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TopicBadge } from "@/components/TopicBadge";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { GapAnalysisReport } from "@/lib/types";

export default function GapReportPage() {
  const [report, setReport] = useState<GapAnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "weak" | "medium" | "strong">("all");

  useEffect(() => {
    fetch("/api/gap-report")
      .then((res) => res.json())
      .then((data) => {
        if (data.report) setReport(data.report);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const weakList = report?.weakTopics || [];
  const mediumList = report?.mediumTopics || [];
  const strongList = report?.strongTopics || [];
  const gaps = report?.identifiedGaps || [];
  const readiness = report?.overallReadiness || 0;

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Knowledge Gap Analysis Report"
        subtitle="Objective mastery classifications (<60% Weak, 60–79% Medium, ≥80% Strong) calculated from actual quiz evaluations."
        actionButton={
          <Link
            href="/revision-plan"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Generate Revision Plan</span>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Top Summary Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Circular Readiness Indicator */}
            <div className="relative w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center shrink-0">
              <div
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center ${
                  readiness >= 75
                    ? "bg-emerald-50 text-emerald-700"
                    : readiness >= 60
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                <span className="text-xl font-black">{readiness}%</span>
                <span className="text-[9px] uppercase font-bold tracking-wider">Readiness</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {readiness >= 80
                    ? "Exam Prepared: High Subject Mastery"
                    : readiness >= 60
                    ? "Moderate Readiness: Targeted Practice Needed"
                    : "High Risk: Foundational Gaps Detected"}
                </h2>
                <span className="text-xs text-slate-400">
                  • Last assessed {report?.lastUpdated ? new Date(report.lastUpdated).toLocaleDateString() : "recently"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Diagnostic analysis indicates <strong className="text-rose-600">{weakList.length} weak topics</strong> require immediate review to avoid point penalties in high-weightage sections.
              </p>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-center min-w-[80px]">
              <span className="text-xs text-rose-600 font-semibold block">Weak</span>
              <span className="text-lg font-bold text-rose-700">{weakList.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center min-w-[80px]">
              <span className="text-xs text-amber-600 font-semibold block">Medium</span>
              <span className="text-lg font-bold text-amber-700">{mediumList.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center min-w-[80px]">
              <span className="text-xs text-emerald-600 font-semibold block">Strong</span>
              <span className="text-lg font-bold text-emerald-700">{strongList.length}</span>
            </div>
          </div>
        </div>

        {/* Detailed Identified Gaps Cards */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Identified Knowledge Gaps & Remediation</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Specific conceptual misconceptions discovered from quiz responses.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((gap, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{gap.topicName}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      gap.severity === "critical"
                        ? "bg-rose-100 text-rose-700 border border-rose-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {gap.severity} priority
                  </span>
                </div>
                <div className="text-xs font-semibold text-indigo-700">
                  Concept: {gap.concept}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{gap.description}</p>
                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-800">
                  <span className="font-semibold text-slate-900 block mb-0.5">Recommended Action:</span>
                  <p className="text-slate-600">{gap.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Classification Buckets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weak Topics */}
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Weak Topics (&lt; 60%)</span>
              </h4>
              <span className="text-xs font-bold text-rose-600">{weakList.length}</span>
            </div>

            <div className="space-y-3">
              {weakList.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{t.name}</span>
                    <span className="text-xs font-bold text-rose-600">{t.currentScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{t.unit} • Weightage: {t.examWeightage}</p>
                  <Link
                    href={`/quiz?topicId=${t.id}`}
                    className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-semibold hover:underline"
                  >
                    <span>Practice Drill</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Medium Topics */}
          <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Medium Topics (60% – 79%)</span>
              </h4>
              <span className="text-xs font-bold text-amber-600">{mediumList.length}</span>
            </div>

            <div className="space-y-3">
              {mediumList.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{t.name}</span>
                    <span className="text-xs font-bold text-amber-600">{t.currentScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{t.unit} • Weightage: {t.examWeightage}</p>
                  <Link
                    href={`/quiz?topicId=${t.id}`}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold hover:underline"
                  >
                    <span>Elevate to Strong</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Strong Topics */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Strong Topics (≥ 80%)</span>
              </h4>
              <span className="text-xs font-bold text-emerald-600">{strongList.length}</span>
            </div>

            <div className="space-y-3">
              {strongList.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{t.name}</span>
                    <span className="text-xs font-bold text-emerald-600">{t.currentScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{t.unit} • Mastered</p>
                  <span className="text-[11px] text-emerald-700 font-medium block">
                    Maintenance revision scheduled
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

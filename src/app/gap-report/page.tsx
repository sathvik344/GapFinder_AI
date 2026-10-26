"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SourceCitationModal } from "@/components/SourceCitationModal";
import { TopicBadge } from "@/components/TopicBadge";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { GapAnalysisReport, SourceCitation } from "@/lib/types";

export default function GapReportPage() {
  const [report, setReport] = useState<GapAnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<SourceCitation | null>(null);

  useEffect(() => {
    fetch("/api/gap-report")
      .then((res) => res.json())
      .then((data) => {
        if (data.report) setReport(data.report);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleEvidence = (id: string) => {
    setExpandedTopicId((prev) => (prev === id ? null : id));
  };

  const weakList = report?.weakTopics || [];
  const mediumList = report?.mediumTopics || [];
  const strongList = report?.strongTopics || [];
  const gaps = report?.identifiedGaps || [];
  const readiness = report?.overallReadiness || 0;

  return (
    <div className="flex-1 pb-16 bg-ivory-50 dark:bg-pine-950 transition-colors duration-200">
      <Header
        title="Knowledge Gap Diagnostic Audit"
        subtitle="Objective mastery classifications (<60% Weak, 60–79% Medium, ≥80% Strong) backed by verifiable quiz evidence."
        actionButton={
          <Link
            href="/revision-plan"
            className="flex items-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold shadow-coral transition-all"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Generate Revision Plan</span>
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">
        {/* Top Summary Banner */}
        <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 sm:p-8 border border-ivory-200 dark:border-pine-800 shadow-paper flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 rounded-full border-4 border-ivory-200 dark:border-pine-800 flex items-center justify-center shrink-0">
              <div
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center ${
                  readiness >= 75
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                    : readiness >= 60
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                    : "bg-coral-50 dark:bg-coral-950/60 text-coral-700 dark:text-coral-300"
                }`}
              >
                <span className="text-2xl font-black">{readiness}%</span>
                <span className="text-[9px] uppercase font-bold tracking-wider">Readiness</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-forest-950 dark:text-ivory-50">
                  {readiness >= 80
                    ? "Exam Prepared: High Subject Mastery"
                    : readiness >= 60
                    ? "Moderate Readiness: Targeted Practice Required"
                    : "High Risk: Foundational Gaps Detected"}
                </h2>
                <span className="text-xs text-forest-500 dark:text-forest-400">
                  • Assessed {report?.lastUpdated ? new Date(report.lastUpdated).toLocaleDateString() : "recently"}
                </span>
              </div>
              <p className="text-xs text-forest-600 dark:text-forest-400 max-w-xl leading-relaxed">
                Diagnostic analysis indicates <strong className="text-coral-600 dark:text-coral-400 font-bold">{weakList.length} weak topics</strong> require immediate review. The revision algorithm has prioritized these concepts in your daily schedule.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-800/60 text-center min-w-[84px] shadow-paper">
              <span className="text-xs text-coral-600 dark:text-coral-400 font-bold block">Weak (&lt;60%)</span>
              <span className="text-xl font-black text-coral-700 dark:text-coral-300">{weakList.length}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center min-w-[84px] shadow-paper">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold block">Medium (60-79%)</span>
              <span className="text-xl font-black text-amber-800 dark:text-amber-300">{mediumList.length}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center min-w-[84px] shadow-paper">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block">Strong (≥80%)</span>
              <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">{strongList.length}</span>
            </div>
          </div>
        </div>

        {/* Detailed Identified Gaps Cards */}
        <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 sm:p-8 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-forest-950 dark:text-ivory-50 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-coral-500" />
                <span>Identified Knowledge Gaps & Remediation Plans</span>
              </h3>
              <p className="text-xs text-forest-600 dark:text-forest-400 mt-0.5">
                Specific conceptual misconceptions discovered from quiz responses.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((gap, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-ivory-200 dark:border-pine-800 bg-ivory-50/50 dark:bg-pine-850/60 space-y-2.5 hover:border-coral-300 dark:hover:border-pine-700 transition-colors shadow-paper"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-950 dark:text-ivory-50">{gap.topicName}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      gap.severity === "critical"
                        ? "bg-coral-100 dark:bg-coral-950/60 text-coral-700 dark:text-coral-300 border border-coral-200 dark:border-coral-800/60"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                    }`}
                  >
                    {gap.severity} priority
                  </span>
                </div>
                <div className="text-xs font-bold text-coral-600 dark:text-coral-400">
                  Concept: {gap.concept}
                </div>
                <p className="text-xs text-forest-800 dark:text-forest-200 leading-relaxed">{gap.description}</p>
                <div className="pt-2 border-t border-ivory-200 dark:border-pine-800 text-xs">
                  <span className="font-bold text-forest-950 dark:text-ivory-50 block mb-0.5">Remediation:</span>
                  <p className="text-forest-600 dark:text-forest-400">{gap.recommendation}</p>
                </div>
                {gap.citation && (
                  <button
                    onClick={() => setActiveCitation(gap.citation!)}
                    className="pt-1 text-[11px] text-coral-600 dark:text-coral-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Reference: {gap.citation.documentName} (Page {gap.citation.pageNumber})</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Topic Classification Buckets with Audit Evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weak Topics */}
          <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 border border-coral-200 dark:border-coral-900/60 shadow-paper space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-coral-700 dark:text-coral-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-coral-500 animate-pulse" />
                <span>Weak Topics (&lt; 60%)</span>
              </h4>
              <span className="text-xs font-bold text-coral-600 dark:text-coral-300 px-2 py-0.5 rounded-full bg-coral-50 dark:bg-coral-950/50">
                {weakList.length}
              </span>
            </div>

            <div className="space-y-3">
              {weakList.map((t) => {
                const isExpanded = expandedTopicId === t.id;
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-coral-200/80 dark:border-coral-900/40 bg-coral-50/30 dark:bg-coral-950/20 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest-950 dark:text-ivory-50">{t.name}</span>
                      <span className="text-xs font-extrabold text-coral-600 dark:text-coral-400">{t.currentScore}%</span>
                    </div>
                    <p className="text-[11px] text-forest-500 dark:text-forest-400">
                      {t.unit} • Weightage: <strong className="text-forest-800 dark:text-forest-200">{t.examWeightage}</strong>
                    </p>

                    <button
                      type="button"
                      onClick={() => toggleEvidence(t.id)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-coral-600 dark:text-coral-400 pt-1 border-t border-coral-100 dark:border-coral-900/40"
                    >
                      <span>Classification Evidence</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && t.classificationEvidence && (
                      <div className="p-3 rounded-xl bg-white dark:bg-pine-850 border border-coral-200 dark:border-coral-900 text-[11px] space-y-2 text-forest-800 dark:text-forest-200 animate-in fade-in duration-150">
                        <div>
                          <span className="font-bold text-coral-800 dark:text-coral-300 block">Threshold Rule:</span>
                          <span>{t.classificationEvidence.thresholdRule}</span>
                        </div>
                        <div>
                          <span className="font-bold text-forest-950 dark:text-ivory-50 block">Assessment Marks:</span>
                          <span>
                            {t.classificationEvidence.marksEarned} / {t.classificationEvidence.questionsAttempted} marks ({t.classificationEvidence.accuracyPercentage}%)
                          </span>
                        </div>
                        {t.classificationEvidence.identifiedDeficiencies.length > 0 && (
                          <div>
                            <span className="font-bold text-coral-700 dark:text-coral-400 block">Identified Gaps:</span>
                            <ul className="list-disc pl-4 space-y-0.5 text-coral-900 dark:text-coral-200">
                              {t.classificationEvidence.identifiedDeficiencies.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {t.classificationEvidence.sourceCitations && t.classificationEvidence.sourceCitations.length > 0 && (
                          <div className="pt-1 border-t border-ivory-200 dark:border-pine-800">
                            <button
                              onClick={() => setActiveCitation(t.classificationEvidence!.sourceCitations![0])}
                              className="text-coral-600 dark:text-coral-400 hover:underline font-bold flex items-center gap-1"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Source: {t.classificationEvidence.sourceCitations[0].documentName} (p. {t.classificationEvidence.sourceCitations[0].pageNumber})</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between">
                      <Link
                        href={`/quiz?topicId=${t.id}`}
                        className="inline-flex items-center gap-1 text-[11px] text-coral-600 dark:text-coral-400 font-bold hover:underline"
                      >
                        <span>Targeted Practice Drill</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Medium Topics */}
          <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/60 shadow-paper space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Medium Topics (60% – 79%)</span>
              </h4>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50">
                {mediumList.length}
              </span>
            </div>

            <div className="space-y-3">
              {mediumList.map((t) => {
                const isExpanded = expandedTopicId === t.id;
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest-950 dark:text-ivory-50">{t.name}</span>
                      <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">{t.currentScore}%</span>
                    </div>
                    <p className="text-[11px] text-forest-500 dark:text-forest-400">
                      {t.unit} • Weightage: <strong className="text-forest-800 dark:text-forest-200">{t.examWeightage}</strong>
                    </p>

                    <button
                      type="button"
                      onClick={() => toggleEvidence(t.id)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 pt-1 border-t border-amber-100 dark:border-amber-900/40"
                    >
                      <span>Classification Evidence</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && t.classificationEvidence && (
                      <div className="p-3 rounded-xl bg-white dark:bg-pine-850 border border-amber-200 dark:border-amber-900 text-[11px] space-y-2 text-forest-800 dark:text-forest-200 animate-in fade-in duration-150">
                        <div>
                          <span className="font-bold text-amber-800 dark:text-amber-300 block">Threshold Rule:</span>
                          <span>{t.classificationEvidence.thresholdRule}</span>
                        </div>
                        <div>
                          <span className="font-bold text-forest-950 dark:text-ivory-50 block">Assessment Marks:</span>
                          <span>
                            {t.classificationEvidence.marksEarned} / {t.classificationEvidence.questionsAttempted} marks ({t.classificationEvidence.accuracyPercentage}%)
                          </span>
                        </div>
                        {t.classificationEvidence.demonstratedCompetencies.length > 0 && (
                          <div>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Mastered Concepts:</span>
                            <ul className="list-disc pl-4 space-y-0.5 text-forest-600 dark:text-forest-400">
                              {t.classificationEvidence.demonstratedCompetencies.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between">
                      <Link
                        href={`/quiz?topicId=${t.id}`}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-bold hover:underline"
                      >
                        <span>Elevate to Strong (≥80%)</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strong Topics */}
          <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-900/60 shadow-paper space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Strong Topics (≥ 80%)</span>
              </h4>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50">
                {strongList.length}
              </span>
            </div>

            <div className="space-y-3">
              {strongList.map((t) => {
                const isExpanded = expandedTopicId === t.id;
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest-950 dark:text-ivory-50">{t.name}</span>
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">{t.currentScore}%</span>
                    </div>
                    <p className="text-[11px] text-forest-500 dark:text-forest-400">{t.unit} • Mastered</p>

                    <button
                      type="button"
                      onClick={() => toggleEvidence(t.id)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 pt-1 border-t border-emerald-100 dark:border-emerald-900/40"
                    >
                      <span>Classification Evidence</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && t.classificationEvidence && (
                      <div className="p-3 rounded-xl bg-white dark:bg-pine-850 border border-emerald-200 dark:border-emerald-900 text-[11px] space-y-2 text-forest-800 dark:text-forest-200 animate-in fade-in duration-150">
                        <div>
                          <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Threshold Rule:</span>
                          <span>{t.classificationEvidence.thresholdRule}</span>
                        </div>
                        <div>
                          <span className="font-bold text-forest-950 dark:text-ivory-50 block">Assessment Marks:</span>
                          <span>
                            {t.classificationEvidence.marksEarned} / {t.classificationEvidence.questionsAttempted} marks ({t.classificationEvidence.accuracyPercentage}%)
                          </span>
                        </div>
                        {t.classificationEvidence.demonstratedCompetencies.length > 0 && (
                          <div>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Confirmed Competencies:</span>
                            <ul className="list-disc pl-4 space-y-0.5 text-forest-600 dark:text-forest-400">
                              {t.classificationEvidence.demonstratedCompetencies.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block pt-1">
                      Maintenance revision scheduled
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Source Citation Modal */}
        <SourceCitationModal
          citation={activeCitation}
          onClose={() => setActiveCitation(null)}
        />
      </div>
    </div>
  );
}

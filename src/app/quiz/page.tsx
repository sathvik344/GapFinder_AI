"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SourceCitationModal } from "@/components/SourceCitationModal";
import { TopicBadge } from "@/components/TopicBadge";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  FileText,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  QuestionEvaluation,
  QuizQuestion,
  QuizResult,
  QuizSubmissionAnswer,
  SourceCitation,
  Topic,
} from "@/lib/types";

export default function QuizPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [questionType, setQuestionType] = useState<"multiple_choice" | "short_answer" | "mixed">("mixed");

  // Quiz state
  const [phase, setPhase] = useState<"setup" | "running" | "result">("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [activeCitation, setActiveCitation] = useState<SourceCitation | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/topics")
      .then((res) => res.json())
      .then((data) => {
        if (data.topics) {
          setTopics(data.topics);
          const urlParams = new URLSearchParams(window.location.search);
          const tid = urlParams.get("topicId");
          if (tid) setSelectedTopicId(tid);
        }
      })
      .catch(console.error);
  }, []);

  const handleStartQuiz = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId === "all" ? topics[0]?.id : selectedTopicId,
          questionCount,
          questionType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      setQuestions(data.questions);
      setUserAnswers({});
      setCurrentIndex(0);
      setPhase("running");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (ans: string) => {
    const currentQ = questions[currentIndex];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: ans,
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    const submissions: QuizSubmissionAnswer[] = questions.map((q) => ({
      questionId: q.id,
      userAnswer: userAnswers[q.id] || "",
    }));

    try {
      const res = await fetch("/api/quiz/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          submissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Evaluation failed");
      }

      setQuizResult(data.quizResult);
      setPhase("result");
    } catch (err: any) {
      setErrorMsg(err.message || "Evaluation error");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Adaptive Diagnostic Quiz"
        subtitle="RAG-grounded assessments generated strictly from your uploaded syllabus and notes."
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
        {/* Phase 1: Setup */}
        {phase === "setup" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Configure Diagnostic Quiz</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select your focus topic and question formats. All questions are dynamically synthesized from indexed document chunks.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Focus Topic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                >
                  <option value="all">Full Subject Diagnostic (All Units)</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.unit}) — Current: {t.currentScore}% ({t.masteryLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Question Count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value={3}>3 Questions (Quick Check)</option>
                    <option value={5}>5 Questions (Standard Diagnostic)</option>
                    <option value={8}>8 Questions (In-Depth Assessment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Question Format
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="mixed">Mixed (MCQ + Short Answer)</option>
                    <option value="multiple_choice">Multiple Choice Only</option>
                    <option value="short_answer">Short Answer Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Grounded verification: source chunks are referenced for every question.
              </span>
              <button
                onClick={handleStartQuiz}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing from Vector Chunks...</span>
                  </>
                ) : (
                  <>
                    <span>Begin Quiz</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Running Quiz */}
        {phase === "running" && currentQ && (
          <div className="space-y-6">
            {/* Top Bar Progress */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Question {currentIndex + 1} of {totalQ}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-800">
                  {currentQ.type === "multiple_choice" ? "Multiple Choice" : "Short Answer"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                <span>{answeredCount} of {totalQ} Answered</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              {/* Grounded Citation Badge */}
              {currentQ.sourceCitations && currentQ.sourceCitations.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveCitation(currentQ.sourceCitations[0])}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800/60 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      Grounded Source: {currentQ.sourceCitations[0].documentName} (Page{" "}
                      {currentQ.sourceCitations[0].pageNumber})
                    </span>
                  </button>
                </div>
              )}

              {/* Question Text */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Answers: MCQ vs Short Answer */}
              {currentQ.type === "multiple_choice" && currentQ.options ? (
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = userAnswers[currentQ.id] === opt;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectAnswer(opt)}
                        className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 font-semibold shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <span className="flex-1 pr-3">{opt}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500"
                              : "border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Your Technical Answer:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your explanation here. Include key protocols, steps, or calculations..."
                    value={userAnswers[currentQ.id] || ""}
                    onChange={(e) => handleSelectAnswer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed font-sans"
                  />
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block text-right">
                    {(userAnswers[currentQ.id] || "").length} characters entered
                  </span>
                </div>
              )}

              {/* Navigation and Submit */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < totalQ - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Evaluating Answers...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Quiz for Evaluation</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Results & Feedback */}
        {phase === "result" && quizResult && (
          <div className="space-y-8">
            {/* Score Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4 transition-colors">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Diagnostic Assessment Result
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl font-black text-slate-900 dark:text-white">
                  {quizResult.overallScore}%
                </span>
                <TopicBadge
                  level={
                    quizResult.overallScore >= 80
                      ? "strong"
                      : quizResult.overallScore >= 60
                      ? "medium"
                      : "weak"
                  }
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {quizResult.correctCount} of {quizResult.totalQuestions} questions evaluated correct.
                Topic scores and revision priority algorithms have been dynamically updated!
              </p>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href="/gap-report"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  View Knowledge Gap Report
                </Link>
                <Link
                  href="/revision-plan"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                >
                  Updated Revision Plan
                </Link>
                <button
                  onClick={() => setPhase("setup")}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                >
                  Take Another Quiz
                </button>
              </div>
            </div>

            {/* Topic Breakdown with Documented Threshold Evidence */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Topic Performance & Classification Evidence</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluated against documented thresholds: Weak (&lt;60%), Medium (60–79%), Strong (≥80%).
                  </p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                  ✓ Revision Plan Re-synced
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizResult.topicBreakdown.map((tb) => (
                  <div
                    key={tb.topicId}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{tb.topicName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {tb.evidence?.marksEarned ?? tb.correctQuestions} / {tb.totalQuestions} marks earned ({tb.score}%)
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <TopicBadge level={tb.masteryLevel} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Rule Applied: </span>
                        <span>{tb.evidence?.thresholdRule || (tb.score >= 80 ? "Score ≥ 80% (Strong)" : tb.score >= 60 ? "Score 60%–79% (Medium)" : "Score < 60% (Weak)")}</span>
                      </div>
                      {tb.evidence?.identifiedDeficiencies && tb.evidence.identifiedDeficiencies.length > 0 && (
                        <div className="text-rose-700 dark:text-rose-400 font-medium">
                          Gap: {tb.evidence.identifiedDeficiencies[0]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Evaluation Review */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Detailed Question-by-Question Review ({quizResult.evaluations.length})
              </h3>

              <div className="space-y-6">
                {quizResult.evaluations.map((ev, i) => {
                  const q = questions.find((item) => item.id === ev.questionId);
                  return (
                    <div
                      key={ev.questionId || i}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Q{i + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {q?.topicName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {ev.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Correct (100%)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                              <XCircle className="w-3.5 h-3.5" />
                              {Math.round(ev.score * 100)}% Credit
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{q?.question}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block mb-1">
                            Your Answer:
                          </span>
                          <span className={ev.isCorrect ? "text-slate-800 dark:text-slate-200" : "text-rose-700 dark:text-rose-400 font-medium"}>
                            {ev.userAnswer || "(No answer provided)"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block mb-1">
                            Correct Technical Benchmark:
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">{ev.correctAnswer}</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                        <span className="font-semibold text-slate-900 dark:text-white block">Explanation & Mistake Analysis:</span>
                        <p className="leading-relaxed">{ev.explanation}</p>
                        {ev.gapIdentified && (
                          <p className="text-amber-800 dark:text-amber-300 font-medium pt-1">
                            Gap Identified: {ev.gapIdentified}
                          </p>
                        )}
                      </div>

                      {ev.sourceCitations && ev.sourceCitations.length > 0 && (
                        <div className="pt-1 flex items-center justify-between text-xs">
                          <button
                            onClick={() => setActiveCitation(ev.sourceCitations[0])}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>
                              Citation: {ev.sourceCitations[0].documentName} (Page{" "}
                              {ev.sourceCitations[0].pageNumber})
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Source Citation Modal */}
        <SourceCitationModal
          citation={activeCitation}
          onClose={() => setActiveCitation(null)}
        />
      </div>
    </div>
  );
}

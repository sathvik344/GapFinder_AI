"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function QuizContainer() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams?.get("topic") || searchParams?.get("topicId") || "all";

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopic);
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
          if (initialTopic && initialTopic !== "all") {
            setSelectedTopicId(initialTopic);
          }
        }
      })
      .catch(console.error);
  }, [initialTopic]);

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

    const formattedAnswers: QuizSubmissionAnswer[] = questions.map((q) => ({
      questionId: q.id,
      userAnswer: userAnswers[q.id] || "",
    }));

    try {
      const res = await fetch("/api/quiz/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to evaluate quiz");
      }

      setQuizResult(data.result);
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
    <div className="flex-1 pb-16 bg-ivory-50 dark:bg-pine-950 transition-colors duration-200">
      <Header
        title="Adaptive Diagnostic Quiz Generator"
        subtitle="RAG-grounded assessments dynamically generated from your uploaded curriculum."
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8">
        {/* Phase 1: Setup */}
        {phase === "setup" && (
          <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 sm:p-8 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-6 transition-colors">
            <div>
              <h2 className="text-lg font-extrabold text-forest-950 dark:text-ivory-50 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-coral-500" />
                <span>Configure Diagnostic Assessment</span>
              </h2>
              <p className="text-xs text-forest-600 dark:text-forest-400 mt-1 font-medium">
                Select focus topic and assessment format. Questions are grounded strictly in indexed curriculum chunks.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-800/60 text-xs text-coral-800 dark:text-coral-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1.5">
                  Focus Curriculum Topic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-850 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-coral-500 outline-none font-medium shadow-paper"
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
                  <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1.5">
                    Question Count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-850 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-coral-500 outline-none font-medium shadow-paper"
                  >
                    <option value={3}>3 Questions (Rapid Knowledge Check)</option>
                    <option value={5}>5 Questions (Standard Diagnostic Assessment)</option>
                    <option value={8}>8 Questions (In-Depth Mastery Audit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200 mb-1.5">
                    Question Format
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-850 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-coral-500 outline-none font-medium shadow-paper"
                  >
                    <option value="mixed">Mixed (Multiple Choice + Short Answer)</option>
                    <option value="multiple_choice">Multiple Choice Only</option>
                    <option value="short_answer">Technical Short Answer Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-ivory-150 dark:border-pine-800 flex items-center justify-between">
              <span className="text-xs text-forest-500 dark:text-forest-400 font-medium">
                Verified Grounding: Questions strictly store document & page citations.
              </span>
              <button
                onClick={handleStartQuiz}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-coral transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Questions from RAG Chunks...</span>
                  </>
                ) : (
                  <>
                    <span>Generate & Begin Quiz</span>
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
            <div className="bg-white dark:bg-pine-900 rounded-2xl p-4 border border-ivory-200 dark:border-pine-800 shadow-paper flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-forest-900 dark:text-forest-100">
                  Question {currentIndex + 1} of {totalQ}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest-100 dark:bg-pine-800 text-forest-800 dark:text-ivory-50 font-semibold border border-forest-200 dark:border-pine-700">
                  {currentQ.type === "multiple_choice" ? "Multiple Choice" : "Short Answer"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-forest-500 dark:text-forest-400 font-medium">
                <span>{answeredCount} of {totalQ} Answered</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 sm:p-8 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-6 transition-colors">
              {/* Grounded Citation Badge */}
              {currentQ.sourceCitations && currentQ.sourceCitations.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveCitation(currentQ.sourceCitations[0])}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 hover:bg-forest-200 dark:bg-pine-800 dark:hover:bg-pine-750 text-forest-800 dark:text-ivory-50 text-xs font-semibold border border-forest-200 dark:border-pine-700 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-coral-500" />
                    <span>
                      Retrieved from: {currentQ.sourceCitations[0].documentName} (Page{" "}
                      {currentQ.sourceCitations[0].pageNumber})
                    </span>
                  </button>
                </div>
              )}

              {/* Question Text */}
              <h3 className="text-base font-extrabold text-forest-950 dark:text-ivory-50 leading-relaxed">
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
                            ? "border-coral-500 bg-coral-50/60 dark:bg-coral-950/30 text-coral-950 dark:text-ivory-50 font-bold shadow-xs"
                            : "border-ivory-200 dark:border-pine-800 hover:border-ivory-300 dark:hover:border-pine-700 hover:bg-ivory-50 dark:hover:bg-pine-850 text-forest-900 dark:text-forest-200"
                        }`}
                      >
                        <span className="flex-1 pr-3">{opt}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-coral-500 bg-coral-500"
                              : "border-ivory-300 dark:border-pine-700"
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
                  <label className="block text-xs font-semibold text-forest-800 dark:text-forest-200">
                    Your Technical Explanation:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your answer here. Include specific protocols, key equations, or sequence steps..."
                    value={userAnswers[currentQ.id] || ""}
                    onChange={(e) => handleSelectAnswer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ivory-200 dark:border-pine-800 bg-white dark:bg-pine-850 text-forest-950 dark:text-ivory-50 text-xs focus:ring-2 focus:ring-coral-500 outline-none leading-relaxed font-sans shadow-paper"
                  />
                  <span className="text-[11px] text-forest-500 dark:text-forest-400 block text-right">
                    {(userAnswers[currentQ.id] || "").length} characters entered
                  </span>
                </div>
              )}

              {/* Navigation and Submit */}
              <div className="pt-6 border-t border-ivory-150 dark:border-pine-800 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-forest-600 dark:text-forest-400 hover:bg-ivory-100 dark:hover:bg-pine-800 disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < totalQ - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                      className="px-5 py-2.5 rounded-xl bg-forest-900 dark:bg-forest-800 hover:bg-forest-850 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-paper"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmitQuiz}
                      className="px-6 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-coral transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Evaluating Answers & Updating Mastery...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Assessment for Grading</span>
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
            <div className="bg-white dark:bg-pine-900 rounded-2xl p-8 border border-ivory-200 dark:border-pine-800 shadow-paper text-center space-y-4 transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-500 dark:text-forest-400">
                Diagnostic Assessment Result
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl font-black text-forest-950 dark:text-ivory-50">
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
              <p className="text-xs text-forest-600 dark:text-forest-400 max-w-md mx-auto">
                {quizResult.correctCount} of {quizResult.totalQuestions} questions evaluated correct.
                Topic scores and revision priority algorithms have been dynamically updated!
              </p>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href="/gap-report"
                  className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-coral transition-colors"
                >
                  View Knowledge Gap Audit
                </Link>
                <Link
                  href="/revision-plan"
                  className="px-4 py-2 rounded-xl bg-forest-900 dark:bg-forest-800 hover:bg-forest-850 text-white text-xs font-bold transition-colors shadow-paper"
                >
                  Updated Revision Plan
                </Link>
                <button
                  onClick={() => setPhase("setup")}
                  className="px-4 py-2 rounded-xl border border-ivory-200 dark:border-pine-750 hover:bg-ivory-100 dark:hover:bg-pine-800 text-forest-800 dark:text-ivory-100 text-xs font-bold transition-colors"
                >
                  Take Another Quiz
                </button>
              </div>
            </div>

            {/* Topic Breakdown with Documented Threshold Evidence */}
            <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-forest-950 dark:text-ivory-50">
                    Topic Performance & Classification Evidence
                  </h3>
                  <p className="text-xs text-forest-600 dark:text-forest-400 mt-0.5">
                    Evaluated against documented thresholds: Weak (&lt;60%), Medium (60–79%), Strong (≥80%).
                  </p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  ✓ Revision Plan Re-synced
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizResult.topicBreakdown.map((tb) => (
                  <div
                    key={tb.topicId}
                    className="p-4 rounded-xl border border-ivory-200 dark:border-pine-800 bg-ivory-50/50 dark:bg-pine-850 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-forest-950 dark:text-ivory-50 block">{tb.topicName}</span>
                        <span className="text-[11px] text-forest-500 dark:text-forest-400">
                          {tb.evidence?.marksEarned ?? tb.correctQuestions} / {tb.totalQuestions} marks earned ({tb.score}%)
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <TopicBadge level={tb.masteryLevel} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-ivory-200/80 dark:border-pine-800 text-[11px] space-y-1 text-forest-600 dark:text-forest-400">
                      <div>
                        <span className="font-bold text-forest-950 dark:text-ivory-50">Rule Applied: </span>
                        <span>{tb.evidence?.thresholdRule || (tb.score >= 80 ? "Score ≥ 80% (Strong)" : tb.score >= 60 ? "Score 60%–79% (Medium)" : "Score < 60% (Weak)")}</span>
                      </div>
                      {tb.evidence?.identifiedDeficiencies && tb.evidence.identifiedDeficiencies.length > 0 && (
                        <div className="text-coral-600 dark:text-coral-400 font-semibold">
                          Gap: {tb.evidence.identifiedDeficiencies[0]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Evaluation Review */}
            <div className="bg-white dark:bg-pine-900 rounded-2xl p-6 border border-ivory-200 dark:border-pine-800 shadow-paper space-y-6 transition-colors">
              <h3 className="text-sm font-extrabold text-forest-950 dark:text-ivory-50">
                Detailed Question-by-Question Review ({quizResult.evaluations.length})
              </h3>

              <div className="space-y-6">
                {quizResult.evaluations.map((ev, i) => {
                  const q = questions.find((item) => item.id === ev.questionId);
                  return (
                    <div
                      key={ev.questionId || i}
                      className="p-5 rounded-2xl border border-ivory-200 dark:border-pine-800 bg-ivory-50/50 dark:bg-pine-850/60 space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-forest-100 dark:bg-pine-750 text-forest-800 dark:text-ivory-50">
                            Q{i + 1}
                          </span>
                          <span className="text-xs font-bold text-forest-500 dark:text-forest-400">
                            {q?.topicName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {ev.isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Correct (100%)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-coral-600 dark:text-coral-400 bg-coral-50 dark:bg-coral-950/50 px-2.5 py-1 rounded-full border border-coral-200 dark:border-coral-800">
                              <XCircle className="w-3.5 h-3.5" />
                              {Math.round(ev.score * 100)}% Credit
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-forest-950 dark:text-ivory-50">{q?.question}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-pine-900 border border-ivory-200 dark:border-pine-800">
                          <span className="text-[11px] font-semibold text-forest-500 dark:text-forest-400 block mb-1">
                            Your Answer:
                          </span>
                          <span className={ev.isCorrect ? "text-forest-950 dark:text-ivory-50" : "text-coral-600 dark:text-coral-400 font-medium"}>
                            {ev.userAnswer || "(No answer provided)"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-pine-900 border border-ivory-200 dark:border-pine-800">
                          <span className="text-[11px] font-semibold text-forest-500 dark:text-forest-400 block mb-1">
                            Correct Technical Benchmark:
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">{ev.correctAnswer}</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-pine-900 border border-ivory-200 dark:border-pine-800 text-xs text-forest-800 dark:text-forest-200 space-y-1">
                        <span className="font-bold text-forest-950 dark:text-ivory-50 block">Explanation & Analysis:</span>
                        <p className="leading-relaxed">{ev.explanation}</p>
                        {ev.gapIdentified && (
                          <p className="text-amber-800 dark:text-amber-300 font-semibold pt-1">
                            Gap Identified: {ev.gapIdentified}
                          </p>
                        )}
                      </div>

                      {ev.sourceCitations && ev.sourceCitations.length > 0 && (
                        <div className="pt-1 flex items-center justify-between text-xs">
                          <button
                            onClick={() => setActiveCitation(ev.sourceCitations[0])}
                            className="text-coral-600 dark:text-coral-400 hover:underline font-bold flex items-center gap-1"
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

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-forest-500">Loading diagnostic quiz...</div>}>
      <QuizContainer />
    </Suspense>
  );
}

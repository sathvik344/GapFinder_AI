import { QuestionEvaluation, QuizQuestion, QuizResult, QuizSubmissionAnswer, MasteryLevel } from "./types";

/**
 * Normalizes text for robust comparison (trims, lowercases, removes redundant punctuation/whitespace).
 */
export function normalizeText(text: string): string {
  return (text || "")
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Calculates deterministic keyword and concept coverage for short answers
 * when running locally or as a baseline fallback.
 */
export function evaluateShortAnswerBaseline(
  userAnswer: string,
  correctAnswer: string,
  modelExplanation: string
): { score: number; isCorrect: boolean; feedback: string; gapIdentified?: string } {
  const normUser = normalizeText(userAnswer);
  const normCorrect = normalizeText(correctAnswer);

  if (!normUser || normUser.length < 3) {
    return {
      score: 0,
      isCorrect: false,
      feedback: "No substantial answer provided. Please provide a detailed technical explanation.",
      gapIdentified: "Incomplete answer / topic unattempted.",
    };
  }

  // Exact or near-exact match
  if (normUser === normCorrect || normUser.includes(normCorrect)) {
    return {
      score: 1.0,
      isCorrect: true,
      feedback: "Excellent! Your answer accurately captures the full technical concept.",
    };
  }

  // Extract key technical tokens (>= 3 chars, including acronyms like SYN, ACK, TCP, UDP, etc.)
  const stopWords = new Set([
    "the", "and", "for", "are", "but", "not", "all", "any", "can", "had", "has", "its", "our", "out",
    "was", "who", "how", "why", "did", "let", "may", "per", "say", "see", "too", "use",
    "that", "this", "with", "from", "they", "will", "have", "were", "been", "which",
    "there", "their", "about", "would", "these", "other", "into", "more", "then", "them",
    "what", "when", "where", "also", "does", "than", "each", "used", "only", "using"
  ]);

  const extractKeywords = (text: string) =>
    Array.from(
      new Set(
        text
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length >= 3 && !stopWords.has(w))
      )
    );

  const primaryKeywords = extractKeywords(correctAnswer);
  const correctKeywords = primaryKeywords.length > 0 ? primaryKeywords : extractKeywords(modelExplanation);
  const userKeywords = extractKeywords(userAnswer);

  if (correctKeywords.length === 0) {
    return {
      score: 0.5,
      isCorrect: false,
      feedback: "Answer received but lacks sufficient benchmark details for full credit.",
    };
  }

  let matches = 0;
  const missedKeywords: string[] = [];

  for (const kw of correctKeywords) {
    if (userKeywords.includes(kw)) {
      matches++;
    } else {
      missedKeywords.push(kw);
    }
  }

  const coverageRatio = matches / correctKeywords.length;

  let finalScore = 0;
  let isCorrect = false;
  let feedback = "";
  let gap: string | undefined;

  if (coverageRatio >= 0.75) {
    finalScore = 1.0;
    isCorrect = true;
    feedback = "Strong answer! You covered all essential technical points.";
  } else if (coverageRatio >= 0.45) {
    finalScore = Math.round(coverageRatio * 100) / 100;
    isCorrect = false;
    feedback = `Partially correct (${Math.round(finalScore * 100)}%). You identified key aspects, but missed crucial points: ${missedKeywords.slice(0, 3).join(", ")}.`;
    gap = `Omission of technical specifics: ${missedKeywords.slice(0, 3).join(", ")}`;
  } else if (coverageRatio >= 0.2) {
    finalScore = 0.25;
    isCorrect = false;
    feedback = `Weak answer. Only partial conceptual awareness demonstrated. Missing key elements: ${missedKeywords.slice(0, 3).join(", ")}.`;
    gap = `Conceptual gap regarding ${missedKeywords.slice(0, 3).join(", ")}`;
  } else {
    finalScore = 0.0;
    isCorrect = false;
    feedback = `Incorrect or insufficient detail. Expected coverage of: ${correctKeywords.slice(0, 4).join(", ")}.`;
    gap = `Fundamental misunderstanding or missing knowledge.`;
  }

  return {
    score: finalScore,
    isCorrect,
    feedback,
    gapIdentified: gap,
  };
}

/**
 * Calculates topic mastery level according to the prompt's strict guidelines:
 * - Strong: >= 80%
 * - Medium: 60% - 79%
 * - Weak: < 60%
 */
export function calculateMasteryLevel(scorePercentage: number, totalQuestions: number): MasteryLevel {
  if (totalQuestions === 0) return "untested";
  if (scorePercentage >= 80) return "strong";
  if (scorePercentage >= 60) return "medium";
  return "weak";
}

/**
 * Evaluates full quiz submission with real mathematical scoring.
 */
export function evaluateQuizSubmission(
  questions: QuizQuestion[],
  submissions: QuizSubmissionAnswer[]
): QuizResult {
  const evaluations: QuestionEvaluation[] = [];
  const topicMap = new Map<
    string,
    { topicName: string; totalScore: number; count: number; correctCount: number }
  >();

  for (const q of questions) {
    const sub = submissions.find((s) => s.questionId === q.id);
    const userAnswer = sub?.userAnswer || "";

    let isCorrect = false;
    let score = 0;
    let explanation = q.explanation;
    let gapIdentified: string | undefined;

    if (q.type === "multiple_choice") {
      const normUser = normalizeText(userAnswer);
      const normCorrect = normalizeText(q.correctAnswer);

      if (normUser === normCorrect) {
        isCorrect = true;
        score = 1;
      } else {
        isCorrect = false;
        score = 0;
        gapIdentified = `Selected distractor "${userAnswer}". Correct concept requires understanding: ${q.correctAnswer}`;
      }
    } else {
      // Short answer evaluation
      const res = evaluateShortAnswerBaseline(userAnswer, q.correctAnswer, q.explanation);
      score = res.score;
      isCorrect = res.isCorrect;
      explanation = `${res.feedback} Expected: ${q.correctAnswer}`;
      gapIdentified = res.gapIdentified;
    }

    evaluations.push({
      questionId: q.id,
      isCorrect,
      score,
      userAnswer,
      correctAnswer: q.correctAnswer,
      explanation,
      gapIdentified,
      sourceCitations: q.sourceCitations,
    });

    // Topic aggregator
    const existing = topicMap.get(q.topicId) || {
      topicName: q.topicName,
      totalScore: 0,
      count: 0,
      correctCount: 0,
    };
    existing.totalScore += score;
    existing.count += 1;
    if (isCorrect) existing.correctCount += 1;
    topicMap.set(q.topicId, existing);
  }

  const totalPossible = questions.length;
  const totalEarned = evaluations.reduce((acc, curr) => acc + curr.score, 0);
  const overallScore = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  const correctCount = evaluations.filter((e) => e.isCorrect).length;

  const topicBreakdown = Array.from(topicMap.entries()).map(([topicId, data]) => {
    const topicScore = Math.round((data.totalScore / data.count) * 100);
    const masteryLevel = calculateMasteryLevel(topicScore, data.count);

    const relatedEvals = evaluations.filter((ev) => {
      const q = questions.find((item) => item.id === ev.questionId);
      return q?.topicId === topicId;
    });

    const demonstratedCompetencies = relatedEvals
      .filter((ev) => ev.isCorrect || ev.score >= 0.75)
      .map((ev) => {
        const q = questions.find((item) => item.id === ev.questionId);
        return q?.question ? q.question.slice(0, 80) : "Correct concept understanding";
      });

    const identifiedDeficiencies = relatedEvals
      .filter((ev) => !ev.isCorrect && ev.score < 0.75)
      .map((ev) => ev.gapIdentified || `Missed benchmark: expected ${ev.correctAnswer.slice(0, 60)}`);

    const citations = relatedEvals.flatMap((ev) => ev.sourceCitations);

    const thresholdRule =
      masteryLevel === "strong"
        ? "Strong Mastery Threshold (Score ≥ 80%)"
        : masteryLevel === "medium"
        ? "Medium Mastery Threshold (Score 60% – 79%)"
        : "Weak Mastery Threshold (Score < 60%)";

    return {
      topicId,
      topicName: data.topicName,
      score: topicScore,
      totalQuestions: data.count,
      correctQuestions: data.correctCount,
      masteryLevel,
      evidence: {
        thresholdRule,
        accuracyPercentage: topicScore,
        questionsAttempted: data.count,
        marksEarned: Math.round(data.totalScore * 10) / 10,
        demonstratedCompetencies,
        identifiedDeficiencies,
        sourceCitations: citations,
      },
    };
  });

  return {
    quizId: `quiz-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    correctCount,
    overallScore,
    topicBreakdown,
    evaluations,
  };
}

import { GapAnalysisReport, MasteryLevel, QuizResult, Topic } from "./types";
import { calculateMasteryLevel } from "./scoring";

/**
 * Updates topic scores dynamically based on the latest quiz result.
 * Implements an exponentially weighted moving average (or Bayesian update)
 * to smoothly integrate historical knowledge with new quiz performance.
 */
export function updateTopicScoresWithQuiz(
  existingTopics: Topic[],
  quizResult: QuizResult
): Topic[] {
  return existingTopics.map((topic) => {
    const attempt = quizResult.topicBreakdown.find((tb) => tb.topicId === topic.id);
    if (!attempt) return topic;

    // Weight recent performance (60% weight to new attempt if prior attempts exist, or 100% if first time)
    let newScore: number;
    let newAttempted = topic.questionsAttempted + attempt.totalQuestions;
    let newCorrect = topic.questionsCorrect + attempt.correctQuestions;

    if (topic.questionsAttempted === 0) {
      newScore = attempt.score;
    } else {
      // Historical blending: weighted by question volume
      newScore = Math.round((newCorrect / newAttempted) * 100);
    }

    const newMastery: MasteryLevel = calculateMasteryLevel(newScore, newAttempted);

    return {
      ...topic,
      currentScore: newScore,
      questionsAttempted: newAttempted,
      questionsCorrect: newCorrect,
      masteryLevel: newMastery,
      lastAssessedAt: quizResult.submittedAt,
    };
  });
}

/**
 * Generates a full Knowledge Gap Report from active topic mastery records.
 */
export function generateGapAnalysisReport(topics: Topic[]): GapAnalysisReport {
  const weakTopics = topics.filter((t) => t.masteryLevel === "weak");
  const mediumTopics = topics.filter((t) => t.masteryLevel === "medium");
  const strongTopics = topics.filter((t) => t.masteryLevel === "strong");
  const untestedTopics = topics.filter((t) => t.masteryLevel === "untested");

  // Weighted overall readiness based on topic weightage
  // High = 3x, Medium = 2x, Low = 1x
  let weightedScoreSum = 0;
  let totalWeight = 0;

  for (const t of topics) {
    const weight = t.examWeightage === "High" ? 3 : t.examWeightage === "Medium" ? 2 : 1;
    weightedScoreSum += t.currentScore * weight;
    totalWeight += weight;
  }

  const overallReadiness = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 0;

  // Synthesize concrete identified gaps with prioritized actions
  const identifiedGaps: GapAnalysisReport["identifiedGaps"] = [];

  for (const wt of weakTopics) {
    identifiedGaps.push({
      topicId: wt.id,
      topicName: wt.name,
      concept: wt.subtopics[0] || wt.name,
      description: `Current mastery is only ${wt.currentScore}%. High risk of point loss in ${wt.examWeightage}-weightage syllabus module.`,
      severity: wt.examWeightage === "High" ? "critical" : "moderate",
      recommendation: `Target ${wt.subtopics.slice(0, 2).join(" & ")}. Complete textbook reading and solve 5 short-answer problems before attempting retest.`,
    });
  }

  for (const mt of mediumTopics) {
    identifiedGaps.push({
      topicId: mt.id,
      topicName: mt.name,
      concept: mt.subtopics[1] || mt.name,
      description: `Borderline mastery (${mt.currentScore}%). Foundational knowledge is present, but complex multi-step questions fail.`,
      severity: "minor",
      recommendation: `Refine edge cases and calculation mechanics. Focus on past paper question drills.`,
    });
  }

  return {
    overallReadiness,
    totalTopics: topics.length,
    weakTopics,
    mediumTopics,
    strongTopics,
    untestedTopics,
    identifiedGaps,
    lastUpdated: new Date().toISOString(),
  };
}

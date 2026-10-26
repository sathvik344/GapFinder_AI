import { GapAnalysisReport, MasteryLevel, QuizResult, Topic } from "./types";
import { calculateMasteryLevel } from "./scoring";

/**
 * Updates topic scores dynamically based on the latest quiz result.
 * Aggregates marks earned, updates mastery classification according to strict thresholds,
 * and compiles concrete demonstrated evidence (competencies vs deficiencies).
 */
export function updateTopicScoresWithQuiz(
  existingTopics: Topic[],
  quizResult: QuizResult
): Topic[] {
  return existingTopics.map((topic) => {
    const attempt = quizResult.topicBreakdown.find((tb) => tb.topicId === topic.id);
    if (!attempt) return topic;

    const newAttempted = topic.questionsAttempted + attempt.totalQuestions;
    const newCorrect =
      topic.questionsCorrect + (attempt.evidence?.marksEarned ?? attempt.correctQuestions);

    const newScore = newAttempted > 0 ? Math.round((newCorrect / newAttempted) * 100) : 0;
    const newMastery: MasteryLevel = calculateMasteryLevel(newScore, newAttempted);

    const thresholdRule =
      newMastery === "strong"
        ? "Strong Mastery Threshold: Score ≥ 80%"
        : newMastery === "medium"
        ? "Medium Mastery Threshold: Score 60% – 79%"
        : "Weak Mastery Threshold: Score < 60%";

    const prevEvidence = topic.classificationEvidence;
    const newEvidence = attempt.evidence;

    const combinedCompetencies = Array.from(
      new Set([
        ...(prevEvidence?.demonstratedCompetencies || []),
        ...(newEvidence?.demonstratedCompetencies || []),
      ])
    );

    const combinedDeficiencies = Array.from(
      new Set([
        ...(prevEvidence?.identifiedDeficiencies || []),
        ...(newEvidence?.identifiedDeficiencies || []),
      ])
    );

    const citations = [
      ...(newEvidence?.sourceCitations || []),
      ...(prevEvidence?.sourceCitations || []),
    ].slice(0, 4);

    return {
      ...topic,
      currentScore: newScore,
      questionsAttempted: newAttempted,
      questionsCorrect: Math.round(newCorrect * 10) / 10,
      masteryLevel: newMastery,
      lastAssessedAt: quizResult.submittedAt,
      classificationEvidence: {
        thresholdRule,
        accuracyPercentage: newScore,
        questionsAttempted: newAttempted,
        marksEarned: Math.round(newCorrect * 10) / 10,
        demonstratedCompetencies: combinedCompetencies,
        identifiedDeficiencies: combinedDeficiencies,
        sourceCitations: citations,
      },
    };
  });
}

function ensureEvidence(t: Topic): Topic {
  if (t.classificationEvidence) return t;

  const thresholdRule =
    t.masteryLevel === "strong"
      ? "Strong Mastery Threshold: Score ≥ 80%"
      : t.masteryLevel === "medium"
      ? "Medium Mastery Threshold: Score 60% – 79%"
      : t.masteryLevel === "weak"
      ? "Weak Mastery Threshold: Score < 60%"
      : "Untested (0 questions attempted)";

  return {
    ...t,
    classificationEvidence: {
      thresholdRule,
      accuracyPercentage: t.currentScore,
      questionsAttempted: t.questionsAttempted,
      marksEarned: t.questionsCorrect,
      demonstratedCompetencies: t.subtopics.slice(0, 2),
      identifiedDeficiencies:
        t.masteryLevel === "weak"
          ? [`Low diagnostic accuracy (${t.currentScore}%) on ${t.subtopics[0] || t.name}`]
          : t.masteryLevel === "medium"
          ? [`Borderline consistency (${t.currentScore}%) on complex problems`]
          : [],
    },
  };
}

/**
 * Generates a full Knowledge Gap Report from active topic mastery records with evidence.
 */
export function generateGapAnalysisReport(topics: Topic[]): GapAnalysisReport {
  const enriched = topics.map(ensureEvidence);

  const weakTopics = enriched.filter((t) => t.masteryLevel === "weak");
  const mediumTopics = enriched.filter((t) => t.masteryLevel === "medium");
  const strongTopics = enriched.filter((t) => t.masteryLevel === "strong");
  const untestedTopics = enriched.filter((t) => t.masteryLevel === "untested");

  // Weighted overall readiness based on topic weightage
  // High = 3x, Medium = 2x, Low = 1x
  let weightedScoreSum = 0;
  let totalWeight = 0;

  for (const t of enriched) {
    const weight = t.examWeightage === "High" ? 3 : t.examWeightage === "Medium" ? 2 : 1;
    weightedScoreSum += t.currentScore * weight;
    totalWeight += weight;
  }

  const overallReadiness = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 0;

  // Synthesize concrete identified gaps with prioritized actions
  const identifiedGaps: GapAnalysisReport["identifiedGaps"] = [];

  for (const wt of weakTopics) {
    const deficiency =
      wt.classificationEvidence?.identifiedDeficiencies[0] ||
      `Current mastery is only ${wt.currentScore}%. High risk in ${wt.examWeightage}-weightage module.`;

    identifiedGaps.push({
      topicId: wt.id,
      topicName: wt.name,
      concept: wt.subtopics[0] || wt.name,
      description: deficiency,
      severity: wt.examWeightage === "High" ? "critical" : "moderate",
      recommendation: `Target ${wt.subtopics.slice(0, 2).join(" & ")}. Complete textbook reading and solve 5 short-answer problems before attempting retest.`,
      citation: wt.classificationEvidence?.sourceCitations?.[0],
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
      citation: mt.classificationEvidence?.sourceCitations?.[0],
    });
  }

  return {
    overallReadiness,
    totalTopics: enriched.length,
    weakTopics,
    mediumTopics,
    strongTopics,
    untestedTopics,
    identifiedGaps,
    lastUpdated: new Date().toISOString(),
  };
}

import { describe, it, expect } from "vitest";
import { generateGapAnalysisReport, updateTopicScoresWithQuiz } from "../src/lib/gapAnalysis";
import { QuizResult, Topic } from "../src/lib/types";

describe("Gap Analysis Engine", () => {
  const sampleTopics: Topic[] = [
    {
      id: "t1",
      name: "TCP Congestion Control",
      unit: "Unit 4",
      description: "AIMD, Slow Start, Reno vs Tahoe",
      examWeightage: "High",
      targetScore: 80,
      currentScore: 45,
      questionsAttempted: 10,
      questionsCorrect: 4.5,
      masteryLevel: "weak",
      subtopics: ["Slow Start", "AIMD"],
    },
    {
      id: "t2",
      name: "Data Link Framing & CRC",
      unit: "Unit 2",
      description: "Framing and error detection",
      examWeightage: "Medium",
      targetScore: 80,
      currentScore: 70,
      questionsAttempted: 10,
      questionsCorrect: 7,
      masteryLevel: "medium",
      subtopics: ["CRC", "Sliding Window"],
    },
    {
      id: "t3",
      name: "OSI Architecture",
      unit: "Unit 1",
      description: "Layered protocols",
      examWeightage: "Low",
      targetScore: 80,
      currentScore: 90,
      questionsAttempted: 10,
      questionsCorrect: 9,
      masteryLevel: "strong",
      subtopics: ["7 Layers"],
    },
  ];

  it("segregates topics into weak, medium and strong arrays correctly", () => {
    const report = generateGapAnalysisReport(sampleTopics);
    expect(report.weakTopics.length).toBe(1);
    expect(report.weakTopics[0].id).toBe("t1");
    expect(report.mediumTopics.length).toBe(1);
    expect(report.mediumTopics[0].id).toBe("t2");
    expect(report.strongTopics.length).toBe(1);
    expect(report.strongTopics[0].id).toBe("t3");
  });

  it("computes weighted overall readiness accurately based on exam weightages", () => {
    // Weights: High = 3, Medium = 2, Low = 1
    // Sum = (45 * 3) + (70 * 2) + (90 * 1) = 135 + 140 + 90 = 365
    // Total weight = 3 + 2 + 1 = 6
    // Expected readiness = Math.round(365 / 6) = 61%
    const report = generateGapAnalysisReport(sampleTopics);
    expect(report.overallReadiness).toBe(61);
  });

  it("assigns critical severity to weak topics with High exam weightage", () => {
    const report = generateGapAnalysisReport(sampleTopics);
    const tcpGap = report.identifiedGaps.find((g) => g.topicId === "t1");
    expect(tcpGap).toBeDefined();
    expect(tcpGap?.severity).toBe("critical");
  });

  it("dynamically updates topic scores when a quiz attempt completes", () => {
    const mockQuizResult: QuizResult = {
      quizId: "quiz-test-1",
      submittedAt: "2026-10-26T12:00:00Z",
      totalQuestions: 5,
      correctCount: 5,
      overallScore: 100,
      topicBreakdown: [
        {
          topicId: "t1",
          topicName: "TCP Congestion Control",
          score: 100,
          totalQuestions: 5,
          correctQuestions: 5,
          masteryLevel: "strong",
        },
      ],
      evaluations: [],
    };

    const updated = updateTopicScoresWithQuiz(sampleTopics, mockQuizResult);
    const updatedT1 = updated.find((t) => t.id === "t1");

    expect(updatedT1).toBeDefined();
    expect(updatedT1?.questionsAttempted).toBe(15);
    // Prior correct = 4.5, new correct = 5 -> total 9.5 out of 15 -> 63% (medium)
    expect(updatedT1?.currentScore).toBe(63);
    expect(updatedT1?.masteryLevel).toBe("medium");
  });
});

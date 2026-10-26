import { describe, it, expect } from "vitest";
import { evaluateQuizSubmission, evaluateShortAnswerBaseline } from "../src/lib/scoring";
import { generateGapAnalysisReport, updateTopicScoresWithQuiz } from "../src/lib/gapAnalysis";
import { generateRevisionPlan } from "../src/lib/scheduler";
import { QuizQuestion, QuizSubmissionAnswer, Topic } from "../src/lib/types";

describe("Diagnostic Engine & Dynamic Mastery Synchronization", () => {
  describe("1. Calculate Actual Marks from Student Answers", () => {
    it("awards 1 mark for accurate MCQs and 0 marks for distractors", () => {
      const questions: QuizQuestion[] = [
        {
          id: "q1",
          topicId: "top-1",
          topicName: "Transport Layer",
          type: "multiple_choice",
          question: "What is the initial window size in Slow Start?",
          options: ["1 MSS", "4 MSS", "16 MSS", "64 MSS"],
          correctAnswer: "1 MSS",
          explanation: "Slow start starts cwnd at 1 MSS.",
          sourceCitations: [],
        },
        {
          id: "q2",
          topicId: "top-1",
          topicName: "Transport Layer",
          type: "multiple_choice",
          question: "Which packet initiates TCP teardown?",
          options: ["FIN", "SYN", "RST", "ACK"],
          correctAnswer: "FIN",
          explanation: "Teardown uses FIN segments.",
          sourceCitations: [],
        },
      ];

      const submissions: QuizSubmissionAnswer[] = [
        { questionId: "q1", userAnswer: "1 MSS" }, // Correct -> 1 mark
        { questionId: "q2", userAnswer: "SYN" },   // Distractor -> 0 marks
      ];

      const result = evaluateQuizSubmission(questions, submissions);

      expect(result.evaluations[0].score).toBe(1);
      expect(result.evaluations[0].isCorrect).toBe(true);
      expect(result.evaluations[1].score).toBe(0);
      expect(result.evaluations[1].isCorrect).toBe(false);
      expect(result.correctCount).toBe(1);
      expect(result.overallScore).toBe(50);
    });

    it("awards partial marks (0.0 to 1.0) for short answers based on key concept coverage", () => {
      const benchmark = "Client sends SYN, server returns SYN-ACK, client sends ACK";
      const explanation = "Standard 3-way handshake";

      // Full marks
      const fullAns = "The client sends a SYN packet, the server responds with SYN-ACK, and the client sends ACK.";
      const fullRes = evaluateShortAnswerBaseline(fullAns, benchmark, explanation);
      expect(fullRes.score).toBe(1.0);
      expect(fullRes.isCorrect).toBe(true);

      // Partial marks (coverage ratio ~ 67%)
      const partAns = "Client sends SYN packet to server";
      const partRes = evaluateShortAnswerBaseline(partAns, benchmark, explanation);
      expect(partRes.score).toBeGreaterThan(0.3);
      expect(partRes.score).toBeLessThan(0.75);
      expect(partRes.isCorrect).toBe(false);
      expect(partRes.gapIdentified).toBeDefined();

      // Zero marks for unattempted / gibberish
      const zeroRes = evaluateShortAnswerBaseline("", benchmark, explanation);
      expect(zeroRes.score).toBe(0.0);
      expect(zeroRes.isCorrect).toBe(false);
    });
  });

  describe("2. Documented Classification Thresholds & Evidence Generation", () => {
    it("strictly classifies Weak (<60%), Medium (60-79%), Strong (>=80%) with audit evidence", () => {
      const mockTopics: Topic[] = [
        {
          id: "t-weak",
          name: "Congestion Control",
          unit: "Unit 4",
          description: "TCP Reno",
          examWeightage: "High",
          targetScore: 80,
          currentScore: 45, // < 60% -> Weak
          questionsAttempted: 10,
          questionsCorrect: 4.5,
          masteryLevel: "weak",
          subtopics: ["AIMD", "Slow Start"],
        },
        {
          id: "t-med",
          name: "Data Link Protocols",
          unit: "Unit 2",
          description: "Sliding Window",
          examWeightage: "Medium",
          targetScore: 80,
          currentScore: 72, // 60-79% -> Medium
          questionsAttempted: 10,
          questionsCorrect: 7.2,
          masteryLevel: "medium",
          subtopics: ["CRC Checksum", "Go-Back-N"],
        },
        {
          id: "t-strong",
          name: "Application Protocols",
          unit: "Unit 5",
          description: "DNS",
          examWeightage: "Low",
          targetScore: 80,
          currentScore: 90, // >= 80% -> Strong
          questionsAttempted: 10,
          questionsCorrect: 9,
          masteryLevel: "strong",
          subtopics: ["DNS Resolution"],
        },
      ];

      const report = generateGapAnalysisReport(mockTopics);

      expect(report.weakTopics.length).toBe(1);
      expect(report.weakTopics[0].masteryLevel).toBe("weak");
      expect(report.weakTopics[0].classificationEvidence?.thresholdRule).toContain("< 60%");
      expect(report.weakTopics[0].classificationEvidence?.marksEarned).toBe(4.5);

      expect(report.mediumTopics.length).toBe(1);
      expect(report.mediumTopics[0].masteryLevel).toBe("medium");
      expect(report.mediumTopics[0].classificationEvidence?.thresholdRule).toContain("60% – 79%");

      expect(report.strongTopics.length).toBe(1);
      expect(report.strongTopics[0].masteryLevel).toBe("strong");
      expect(report.strongTopics[0].classificationEvidence?.thresholdRule).toContain("≥ 80%");
    });
  });

  describe("3. End-to-End Demonstration: New Quiz Attempt Updates Topic Mastery AND Revision Plan", () => {
    it("dynamically drops mastery on failed quiz, updates topic to Weak, and reallocates revision hours", () => {
      // Step 1: Initial topic with Borderline / Medium score (70%)
      const initialTopics: Topic[] = [
        {
          id: "topic-routing",
          name: "IP Routing Protocols",
          unit: "Unit 3",
          description: "Dijkstra and Bellman-Ford",
          examWeightage: "High",
          targetScore: 80,
          currentScore: 70,
          questionsAttempted: 10,
          questionsCorrect: 7,
          masteryLevel: "medium",
          subtopics: ["Count to Infinity", "Dijkstra SPF"],
        },
        {
          id: "topic-dns",
          name: "DNS Resolution",
          unit: "Unit 5",
          description: "Iterative vs recursive",
          examWeightage: "Low",
          targetScore: 80,
          currentScore: 90,
          questionsAttempted: 10,
          questionsCorrect: 9,
          masteryLevel: "strong",
          subtopics: ["DNS Root Servers"],
        },
      ];

      // Initial revision plan: 0 weak topics
      const initialPlan = generateRevisionPlan({
        examDate: "2026-11-15",
        dailyHoursAvailable: 2,
        topics: initialTopics,
      });

      expect(initialPlan.weakTopicHours).toBe(0);
      expect(initialPlan.mediumTopicHours).toBeGreaterThan(0);

      // Step 2: Student takes a challenging 5-question quiz on IP Routing and gets 0 correct
      const quizQuestions: QuizQuestion[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `q-fail-${i}`,
        topicId: "topic-routing",
        topicName: "IP Routing Protocols",
        type: "multiple_choice",
        question: `Question ${i + 1} on Bellman-Ford convergence`,
        options: ["Correct Option", "Distractor 1", "Distractor 2", "Distractor 3"],
        correctAnswer: "Correct Option",
        explanation: "Documented in Section 3.3.",
        sourceCitations: [
          {
            chunkId: "chk-routing-3",
            documentName: "Unit_3_Routing_Algorithms_LectureNotes.pdf",
            category: "notes",
            pageNumber: 6,
            sectionTitle: "Section 3.3: Distance Vector Flaws",
            snippet: "Count-to-infinity problem occurs when link fails.",
          },
        ],
      }));

      const failedSubmissions: QuizSubmissionAnswer[] = quizQuestions.map((q) => ({
        questionId: q.id,
        userAnswer: "Distractor 1", // All incorrect
      }));

      // Evaluate the quiz
      const quizResult = evaluateQuizSubmission(quizQuestions, failedSubmissions);
      expect(quizResult.overallScore).toBe(0);
      expect(quizResult.topicBreakdown[0].score).toBe(0);

      // Step 3: Update topics with quiz results
      const updatedTopics = updateTopicScoresWithQuiz(initialTopics, quizResult);
      const updatedRouting = updatedTopics.find((t) => t.id === "topic-routing")!;

      // Prior correct = 7, new correct = 0 -> total 7 out of 15 attempted
      // 7 / 15 = 46.67% -> Math.round = 47%
      expect(updatedRouting.currentScore).toBe(47);
      expect(updatedRouting.questionsAttempted).toBe(15);
      expect(updatedRouting.questionsCorrect).toBe(7);

      // Verify Topic Dropped from Medium to Weak (< 60%)
      expect(updatedRouting.masteryLevel).toBe("weak");
      expect(updatedRouting.classificationEvidence?.thresholdRule).toContain("Weak Mastery Threshold");
      expect(updatedRouting.classificationEvidence?.sourceCitations?.[0].documentName).toBe(
        "Unit_3_Routing_Algorithms_LectureNotes.pdf"
      );

      // Step 4: Re-sync revision plan with the updated topics
      const updatedPlan = generateRevisionPlan({
        examDate: initialPlan.examDate,
        dailyHoursAvailable: initialPlan.dailyHoursAvailable,
        topics: updatedTopics,
      });

      // Assert that Weak Topic Hours were immediately allocated 50% priority!
      expect(updatedPlan.weakTopicHours).toBeGreaterThan(0);
      expect(updatedPlan.strategySummary).toContain("1 weak topics receive 50% priority time");

      // Verify that Day 1 now focuses on the newly classified Weak topic (IP Routing Protocols)
      expect(updatedPlan.dailySchedules[0].focusTopic).toBe("IP Routing Protocols");
      expect(updatedPlan.dailySchedules[0].tasks[0].priority).toBe("High");
    });

    it("dynamically elevates topic to Strong (>=80%) when student aces a retest, reducing revision pressure", () => {
      // Step 1: Initial Weak Topic (47%)
      const weakTopics: Topic[] = [
        {
          id: "topic-routing",
          name: "IP Routing Protocols",
          unit: "Unit 3",
          description: "Dijkstra and Bellman-Ford",
          examWeightage: "High",
          targetScore: 80,
          currentScore: 47,
          questionsAttempted: 15,
          questionsCorrect: 7,
          masteryLevel: "weak",
          subtopics: ["Count to Infinity", "Dijkstra SPF"],
        },
      ];

      // Step 2: Student studies and aces a 10-question retest (10/10 correct)
      const retestQuestions: QuizQuestion[] = Array.from({ length: 10 }).map((_, i) => ({
        id: `q-pass-${i}`,
        topicId: "topic-routing",
        topicName: "IP Routing Protocols",
        type: "multiple_choice",
        question: `Retest Q${i + 1}`,
        options: ["Correct Option", "Distractor A"],
        correctAnswer: "Correct Option",
        explanation: "Verified.",
        sourceCitations: [],
      }));

      const aceSubmissions: QuizSubmissionAnswer[] = retestQuestions.map((q) => ({
        questionId: q.id,
        userAnswer: "Correct Option",
      }));

      const retestResult = evaluateQuizSubmission(retestQuestions, aceSubmissions);
      expect(retestResult.overallScore).toBe(100);

      // Step 3: Update topics with the retest result
      const retestedTopics = updateTopicScoresWithQuiz(weakTopics, retestResult);
      const retestedRouting = retestedTopics.find((t) => t.id === "topic-routing")!;

      // Prior correct = 7, new correct = 10 -> total 17 out of 25 attempted
      // 17 / 25 = 68% -> elevates from Weak to Medium!
      expect(retestedRouting.currentScore).toBe(68);
      expect(retestedRouting.masteryLevel).toBe("medium");

      // If student takes 10 more questions and gets 10/10:
      // (17 + 10) / (25 + 10) = 27 / 35 = 77%
      // And with additional practice:
      const masteryQuestions: QuizQuestion[] = Array.from({ length: 15 }).map((_, i) => ({
        id: `q-mastery-${i}`,
        topicId: "topic-routing",
        topicName: "IP Routing Protocols",
        type: "multiple_choice",
        question: `Mastery Q${i + 1}`,
        correctAnswer: "A",
        explanation: "A",
        sourceCitations: [],
      }));
      const masterySubmissions = masteryQuestions.map((q) => ({ questionId: q.id, userAnswer: "A" }));
      const masteryResult = evaluateQuizSubmission(masteryQuestions, masterySubmissions);
      const masteredTopics = updateTopicScoresWithQuiz(retestedTopics, masteryResult);
      const finalRouting = masteredTopics.find((t) => t.id === "topic-routing")!;

      // Total correct = 17 + 15 = 32 out of 40 = 80%!
      expect(finalRouting.currentScore).toBe(80);
      expect(finalRouting.masteryLevel).toBe("strong");
      expect(finalRouting.classificationEvidence?.thresholdRule).toContain("≥ 80%");

      // Step 4: Recompute plan with 0 weak topics
      const masteredPlan = generateRevisionPlan({
        examDate: "2026-11-15",
        dailyHoursAvailable: 2,
        topics: masteredTopics,
      });

      expect(masteredPlan.weakTopicHours).toBe(0);
    });
  });
});

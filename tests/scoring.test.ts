import { describe, it, expect } from "vitest";
import {
  calculateMasteryLevel,
  evaluateQuizSubmission,
  evaluateShortAnswerBaseline,
  normalizeText,
} from "../src/lib/scoring";
import { QuizQuestion, QuizSubmissionAnswer } from "../src/lib/types";

describe("Scoring & Answer Evaluation Engine", () => {
  it("normalizes text by stripping whitespace and punctuation", () => {
    expect(normalizeText("  TCP / IP Handshake! ")).toBe("tcp ip handshake");
    expect(normalizeText("Selective-Repeat (ARQ)")).toBe("selectiverepeat arq");
  });

  describe("calculateMasteryLevel", () => {
    it("classifies scores >= 80% as strong", () => {
      expect(calculateMasteryLevel(80, 5)).toBe("strong");
      expect(calculateMasteryLevel(95, 10)).toBe("strong");
    });

    it("classifies scores between 60% and 79% as medium", () => {
      expect(calculateMasteryLevel(60, 5)).toBe("medium");
      expect(calculateMasteryLevel(72, 8)).toBe("medium");
      expect(calculateMasteryLevel(79, 10)).toBe("medium");
    });

    it("classifies scores < 60% as weak", () => {
      expect(calculateMasteryLevel(59, 10)).toBe("weak");
      expect(calculateMasteryLevel(45, 5)).toBe("weak");
      expect(calculateMasteryLevel(0, 3)).toBe("weak");
    });

    it("classifies 0 attempted questions as untested", () => {
      expect(calculateMasteryLevel(0, 0)).toBe("untested");
    });
  });

  describe("evaluateShortAnswerBaseline", () => {
    const correctAnswer = "Client sends SYN, server returns SYN-ACK, client sends ACK";
    const explanation = "Standard 3-step TCP connection establishment sequence numbers ISN_c and ISN_s";

    it("awards 1.0 for exact or high-coverage conceptual answers", () => {
      const userAns = "The client sends a SYN packet, the server responds with SYN-ACK, and the client returns ACK.";
      const res = evaluateShortAnswerBaseline(userAns, correctAnswer, explanation);
      expect(res.score).toBeGreaterThanOrEqual(0.75);
      expect(res.isCorrect).toBe(true);
    });

    it("awards partial credit (0.4 - 0.75) for partial conceptual coverage", () => {
      const userAns = "Client sends SYN packet to server";
      const res = evaluateShortAnswerBaseline(userAns, correctAnswer, explanation);
      expect(res.score).toBeGreaterThan(0);
      expect(res.score).toBeLessThan(0.75);
      expect(res.isCorrect).toBe(false);
      expect(res.gapIdentified).toBeDefined();
    });

    it("awards 0 score for empty or non-responsive answers", () => {
      const res = evaluateShortAnswerBaseline("", correctAnswer, explanation);
      expect(res.score).toBe(0);
      expect(res.isCorrect).toBe(false);
    });
  });

  describe("evaluateQuizSubmission", () => {
    const mockQuestions: QuizQuestion[] = [
      {
        id: "q1",
        topicId: "t-tcp",
        topicName: "TCP Protocols",
        type: "multiple_choice",
        question: "What is cwnd after 3 dup ACKs in Reno?",
        options: ["ssthresh + 3 MSS", "1 MSS", "0", "16 MSS"],
        correctAnswer: "ssthresh + 3 MSS",
        explanation: "Fast recovery cuts in half and inflates cwnd by 3 MSS.",
        sourceCitations: [],
      },
      {
        id: "q2",
        topicId: "t-tcp",
        topicName: "TCP Protocols",
        type: "multiple_choice",
        question: "Does UDP provide flow control?",
        options: ["No", "Yes", "Only in IPv6", "Optional"],
        correctAnswer: "No",
        explanation: "UDP does not provide flow or congestion control.",
        sourceCitations: [],
      },
    ];

    it("calculates 100% when all answers match", () => {
      const submissions: QuizSubmissionAnswer[] = [
        { questionId: "q1", userAnswer: "ssthresh + 3 MSS" },
        { questionId: "q2", userAnswer: "No" },
      ];

      const res = evaluateQuizSubmission(mockQuestions, submissions);
      expect(res.overallScore).toBe(100);
      expect(res.correctCount).toBe(2);
      expect(res.topicBreakdown[0].masteryLevel).toBe("strong");
    });

    it("calculates 50% when one answer is incorrect", () => {
      const submissions: QuizSubmissionAnswer[] = [
        { questionId: "q1", userAnswer: "ssthresh + 3 MSS" },
        { questionId: "q2", userAnswer: "Yes" }, // Wrong
      ];

      const res = evaluateQuizSubmission(mockQuestions, submissions);
      expect(res.overallScore).toBe(50);
      expect(res.correctCount).toBe(1);
      expect(res.topicBreakdown[0].masteryLevel).toBe("weak");
    });
  });
});

import { describe, it, expect } from "vitest";
import { generateRevisionPlan } from "../src/lib/scheduler";
import { Topic } from "../src/lib/types";

describe("Deterministic Revision Scheduler", () => {
  const sampleTopics: Topic[] = [
    {
      id: "t1",
      name: "TCP Congestion Control",
      unit: "Unit 4",
      description: "AIMD, Slow Start",
      examWeightage: "High",
      targetScore: 80,
      currentScore: 40,
      questionsAttempted: 10,
      questionsCorrect: 4,
      masteryLevel: "weak",
      subtopics: ["Slow Start", "AIMD"],
    },
    {
      id: "t2",
      name: "Data Link Protocols",
      unit: "Unit 2",
      description: "CRC, Sliding Window",
      examWeightage: "Medium",
      targetScore: 80,
      currentScore: 70,
      questionsAttempted: 10,
      questionsCorrect: 7,
      masteryLevel: "medium",
      subtopics: ["CRC Checksum", "Go-Back-N"],
    },
    {
      id: "t3",
      name: "Application Layer & DNS",
      unit: "Unit 5",
      description: "DNS, HTTP",
      examWeightage: "Low",
      targetScore: 80,
      currentScore: 90,
      questionsAttempted: 10,
      questionsCorrect: 9,
      masteryLevel: "strong",
      subtopics: ["DNS Resolution"],
    },
  ];

  it("calculates exact days remaining and study hours deterministically", () => {
    const startDate = "2026-11-01";
    const examDate = "2026-11-11"; // 10 days
    const dailyHours = 2.5;

    const plan = generateRevisionPlan({
      startDate,
      examDate,
      dailyHoursAvailable: dailyHours,
      topics: sampleTopics,
    });

    expect(plan.daysRemaining).toBe(10);
    expect(plan.totalStudyHoursAvailable).toBe(25);
  });

  it("allocates study hours in 50% weak, 35% medium, 15% strong ratios", () => {
    const startDate = "2026-11-01";
    const examDate = "2026-11-11"; // 10 days
    const dailyHours = 2.0; // 20 hours total

    const plan = generateRevisionPlan({
      startDate,
      examDate,
      dailyHoursAvailable: dailyHours,
      topics: sampleTopics,
    });

    // 20 hours total:
    // weak: 50% = 10h
    // medium: 35% = 7h
    // strong: 15% = 3h
    expect(plan.weakTopicHours).toBe(10);
    expect(plan.mediumTopicHours).toBe(7);
    expect(plan.strongTopicHours).toBe(3);
  });

  it("generates daily schedules with concrete actionable study tasks", () => {
    const plan = generateRevisionPlan({
      startDate: "2026-11-01",
      examDate: "2026-11-08",
      dailyHoursAvailable: 2,
      topics: sampleTopics,
    });

    expect(plan.dailySchedules.length).toBe(7);
    const day1 = plan.dailySchedules[0];
    expect(day1.dayNumber).toBe(1);
    expect(day1.totalAllocatedMinutes).toBe(120);
    expect(day1.tasks.length).toBeGreaterThan(0);
    expect(day1.tasks[0].completed).toBe(false);
  });
});

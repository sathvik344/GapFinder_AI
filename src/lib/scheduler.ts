import { DailySchedule, RevisionPlan, RevisionTask, Topic } from "./types";

interface SchedulerOptions {
  examDate: string; // YYYY-MM-DD
  dailyHoursAvailable: number; // e.g. 2
  topics: Topic[];
  startDate?: string;
}

/**
 * Deterministic baseline revision schedule algorithm.
 * Uses spaced repetition intervals and mastery-weighted time allocation.
 */
export function generateRevisionPlan({
  examDate,
  dailyHoursAvailable,
  topics,
  startDate,
}: SchedulerOptions): RevisionPlan {
  const start = startDate ? new Date(startDate) : new Date();
  const target = new Date(examDate);

  // Calculate days remaining (at least 1 day)
  const diffTime = target.getTime() - start.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const dailyMinutesAvailable = Math.round(dailyHoursAvailable * 60);
  const totalStudyHoursAvailable = Math.round(daysRemaining * dailyHoursAvailable * 10) / 10;

  const weakTopics = topics.filter((t) => t.masteryLevel === "weak");
  const mediumTopics = topics.filter((t) => t.masteryLevel === "medium");
  const strongTopics = topics.filter((t) => t.masteryLevel === "strong");
  const untestedTopics = topics.filter((t) => t.masteryLevel === "untested");

  // Allocate time ratios based on mastery distribution
  let weakRatio = 0.5;
  let mediumRatio = 0.35;
  let strongRatio = 0.15;

  if (weakTopics.length === 0 && mediumTopics.length > 0) {
    weakRatio = 0;
    mediumRatio = 0.7;
    strongRatio = 0.3;
  } else if (weakTopics.length === 0 && mediumTopics.length === 0) {
    weakRatio = 0;
    mediumRatio = 0;
    strongRatio = 1.0;
  }

  const weakTopicHours = Math.round(totalStudyHoursAvailable * weakRatio * 10) / 10;
  const mediumTopicHours = Math.round(totalStudyHoursAvailable * mediumRatio * 10) / 10;
  const strongTopicHours = Math.round(totalStudyHoursAvailable * strongRatio * 10) / 10;

  // Generate day-by-day deterministic schedule
  const dailySchedules: DailySchedule[] = [];
  const allPrioritizedTopics = [
    ...weakTopics,
    ...untestedTopics,
    ...mediumTopics,
    ...strongTopics,
  ];

  // If no topics exist, create a generic schedule
  if (allPrioritizedTopics.length === 0) {
    for (let day = 1; day <= Math.min(daysRemaining, 30); day++) {
      const scheduleDate = new Date(start);
      scheduleDate.setDate(scheduleDate.getDate() + (day - 1));

      dailySchedules.push({
        dayNumber: day,
        date: scheduleDate.toISOString().split("T")[0],
        dayOfWeek: scheduleDate.toLocaleDateString("en-US", { weekday: "short" }),
        focusTopic: "General Revision",
        totalAllocatedMinutes: dailyMinutesAvailable,
        tasks: [
          {
            id: `task-${day}-1`,
            topicId: "general",
            topicName: "General Study Material",
            taskType: "concept_review",
            title: "Upload & Review Syllabus Topics",
            description: "Upload your syllabus and materials to generate customized topic revisions.",
            estimatedMinutes: dailyMinutesAvailable,
            priority: "High",
            completed: false,
          },
        ],
      });
    }
  } else {
    // Generate tasks across days using round-robin spaced repetition
    const scheduleLength = Math.min(daysRemaining, 30); // Cap view at 30 days for clarity

    for (let day = 1; day <= scheduleLength; day++) {
      const scheduleDate = new Date(start);
      scheduleDate.setDate(scheduleDate.getDate() + (day - 1));

      // Determine focus topic for today
      // Days 1 to 60% prioritize Weak topics; middle days Medium; final days Strong/Past Papers
      let currentTopic: Topic;
      let taskType: RevisionTask["taskType"];
      let taskTitle = "";
      let taskDesc = "";
      let priority: "High" | "Medium" | "Low" = "Medium";

      const progressRatio = day / scheduleLength;

      if (weakTopics.length > 0 && progressRatio <= 0.55) {
        // Weak topic focus
        const topicIdx = (day - 1) % weakTopics.length;
        currentTopic = weakTopics[topicIdx];
        priority = "High";

        if (day % 2 === 1) {
          taskType = "concept_review";
          taskTitle = `Deep Dive: ${currentTopic.name}`;
          taskDesc = `Review foundational textbook chapters and definitions for: ${currentTopic.subtopics.slice(0, 3).join(", ")}.`;
        } else {
          taskType = "active_recall";
          taskTitle = `Active Recall: ${currentTopic.name}`;
          taskDesc = `Answer practice conceptual questions without looking at notes. Focus on identified weak points.`;
        }
      } else if (mediumTopics.length > 0 && progressRatio <= 0.85) {
        // Medium topic focus
        const topicIdx = (day - 1) % mediumTopics.length;
        currentTopic = mediumTopics[topicIdx];
        priority = "Medium";

        if (day % 2 === 1) {
          taskType = "past_paper_drill";
          taskTitle = `Exam Drill: ${currentTopic.name}`;
          taskDesc = `Solve past university questions on ${currentTopic.subtopics[0] || currentTopic.name}. Time yourself.`;
        } else {
          taskType = "retest_quiz";
          taskTitle = `Mastery Retest: ${currentTopic.name}`;
          taskDesc = `Take a 5-question targeted quiz in GapFinder to elevate this topic to Strong mastery (>=80%).`;
        }
      } else {
        // Strong topic / Final review
        const topicList = strongTopics.length > 0 ? strongTopics : allPrioritizedTopics;
        const topicIdx = (day - 1) % topicList.length;
        currentTopic = topicList[topicIdx];
        priority = "Low";

        taskType = day === scheduleLength ? "retest_quiz" : "active_recall";
        taskTitle = `High-Yield Polish: ${currentTopic.name}`;
        taskDesc = `Spaced repetition flash review to maintain retention of key formulas and architectures.`;
      }

      // Create primary task (60% of daily time) and secondary task (40% of daily time)
      const primaryMins = Math.round(dailyMinutesAvailable * 0.6);
      const secondaryMins = dailyMinutesAvailable - primaryMins;

      const tasks: RevisionTask[] = [
        {
          id: `task-${day}-1`,
          topicId: currentTopic.id,
          topicName: currentTopic.name,
          taskType,
          title: taskTitle,
          description: taskDesc,
          estimatedMinutes: primaryMins,
          priority,
          completed: false,
          sourceReference: currentTopic.subtopics[0],
        },
        {
          id: `task-${day}-2`,
          topicId: currentTopic.id,
          topicName: currentTopic.name,
          taskType: "retest_quiz",
          title: `Diagnostic Check (${currentTopic.name})`,
          description: `Quick self-assessment: summarize 3 key mechanisms in writing or take a GapFinder practice quiz.`,
          estimatedMinutes: secondaryMins,
          priority: "Medium",
          completed: false,
        },
      ];

      dailySchedules.push({
        dayNumber: day,
        date: scheduleDate.toISOString().split("T")[0],
        dayOfWeek: scheduleDate.toLocaleDateString("en-US", { weekday: "short" }),
        focusTopic: currentTopic.name,
        totalAllocatedMinutes: dailyMinutesAvailable,
        tasks,
      });
    }
  }

  const strategySummary = `Based on your exam date (${examDate}) and ${dailyHoursAvailable}h daily capacity, you have ${daysRemaining} days (${totalStudyHoursAvailable} total study hours). ${weakTopics.length} weak topics receive 50% priority time (${weakTopicHours}h), ${mediumTopics.length} medium topics receive 35% (${mediumTopicHours}h), and ${strongTopics.length} strong topics receive 15% (${strongTopicHours}h) spaced repetition maintenance.`;

  return {
    id: `revplan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    examDate,
    daysRemaining,
    dailyHoursAvailable,
    totalStudyHoursAvailable,
    strategySummary,
    weakTopicHours,
    mediumTopicHours,
    strongTopicHours,
    dailySchedules,
  };
}

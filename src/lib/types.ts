import { z } from "zod";

// Document Types
export type DocumentCategory = "syllabus" | "textbook" | "notes" | "past_paper";

export interface DocumentMetadata {
  id: string;
  name: string;
  category: DocumentCategory;
  pageCount?: number;
  uploadedAt: string;
  fileSize: number;
  chunkCount: number;
  isSample?: boolean;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  category: DocumentCategory;
  pageNumber: number;
  sectionTitle: string;
  content: string;
  tokenEstimate: number;
  embedding?: number[];
}

// Topic Types
export type MasteryLevel = "weak" | "medium" | "strong" | "untested";

export interface Topic {
  id: string;
  name: string;
  unit: string;
  description: string;
  examWeightage: "High" | "Medium" | "Low";
  targetScore: number; // e.g. 80
  currentScore: number; // 0-100
  questionsAttempted: number;
  questionsCorrect: number;
  masteryLevel: MasteryLevel;
  subtopics: string[];
  lastAssessedAt?: string;
}

// Quiz & Question Types
export type QuestionType = "multiple_choice" | "short_answer";

export interface SourceCitation {
  chunkId: string;
  documentName: string;
  category: DocumentCategory;
  pageNumber: number;
  sectionTitle: string;
  snippet: string;
  relevanceScore?: number;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  topicName: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation: string;
  sourceCitations: SourceCitation[];
}

export interface QuizSubmissionAnswer {
  questionId: string;
  userAnswer: string;
}

export interface QuestionEvaluation {
  questionId: string;
  isCorrect: boolean;
  score: number; // 0 to 1 (can be partial for short answer)
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  gapIdentified?: string;
  sourceCitations: SourceCitation[];
}

export interface QuizResult {
  quizId: string;
  submittedAt: string;
  totalQuestions: number;
  correctCount: number;
  overallScore: number; // 0-100%
  topicBreakdown: {
    topicId: string;
    topicName: string;
    score: number;
    totalQuestions: number;
    correctQuestions: number;
    masteryLevel: MasteryLevel;
  }[];
  evaluations: QuestionEvaluation[];
}

// Gap Report Types
export interface GapAnalysisReport {
  overallReadiness: number; // 0-100%
  totalTopics: number;
  weakTopics: Topic[];
  mediumTopics: Topic[];
  strongTopics: Topic[];
  untestedTopics: Topic[];
  identifiedGaps: {
    topicId: string;
    topicName: string;
    concept: string;
    description: string;
    severity: "critical" | "moderate" | "minor";
    recommendation: string;
    citation?: SourceCitation;
  }[];
  lastUpdated: string;
}

// Revision Planner Types
export interface RevisionTask {
  id: string;
  topicId: string;
  topicName: string;
  taskType: "concept_review" | "active_recall" | "past_paper_drill" | "retest_quiz";
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  sourceReference?: string;
}

export interface DailySchedule {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  focusTopic: string;
  totalAllocatedMinutes: number;
  tasks: RevisionTask[];
}

export interface RevisionPlan {
  id: string;
  createdAt: string;
  examDate: string;
  daysRemaining: number;
  dailyHoursAvailable: number;
  totalStudyHoursAvailable: number;
  strategySummary: string;
  weakTopicHours: number;
  mediumTopicHours: number;
  strongTopicHours: number;
  dailySchedules: DailySchedule[];
}

// Grounded Chat Types
export interface GroundedChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  citations?: SourceCitation[];
  groundedInUploadedCorpus?: boolean;
}

// Zod Schemas for LLM Output Validation
export const GeneratedQuestionSchema = z.object({
  topicName: z.string(),
  type: z.enum(["multiple_choice", "short_answer"]),
  question: z.string().min(10),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(10),
  sourceChunkIndex: z.number().nonnegative(),
});

export const GeneratedQuizSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).min(1),
});

export const ShortAnswerEvaluationSchema = z.object({
  score: z.number().min(0).max(1),
  isCorrect: z.boolean(),
  feedback: z.string(),
  gapIdentified: z.string().optional(),
});

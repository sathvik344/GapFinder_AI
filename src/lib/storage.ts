import { createClient } from "@supabase/supabase-js";
import { DocumentChunk, DocumentMetadata, QuizResult, RevisionPlan, Topic } from "./types";
import { INITIAL_SAMPLE_TOPICS, SAMPLE_CHUNKS, SAMPLE_DOCUMENTS } from "./sampleData";
import { getSupabaseConfig } from "./supabaseConfig";

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

function getSupabaseClient() {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured || !cfg.url) return null;
  const key = cfg.serviceKey || cfg.anonKey;
  if (!key) return null;
  return createClient(cfg.url, key);
}

// In-memory persistent state for Demo Mode & Local testing
interface InMemoryStore {
  documents: DocumentMetadata[];
  chunks: DocumentChunk[];
  topics: Topic[];
  quizAttempts: QuizResult[];
  activeRevisionPlan: RevisionPlan | null;
}

// Global singleton in development/production node process
const globalForStore = global as unknown as { __gapfinderStore?: InMemoryStore };

function initDefaultStore(): InMemoryStore {
  return {
    documents: [...SAMPLE_DOCUMENTS],
    chunks: [...SAMPLE_CHUNKS],
    topics: [...INITIAL_SAMPLE_TOPICS],
    quizAttempts: [
      {
        quizId: "quiz-sample-1",
        submittedAt: "2026-10-25T15:10:00Z",
        totalQuestions: 5,
        correctCount: 3,
        overallScore: 60,
        topicBreakdown: [
          {
            topicId: "topic-4",
            topicName: "TCP Congestion Control & Flow Control",
            score: 54,
            totalQuestions: 3,
            correctQuestions: 1.6,
            masteryLevel: "weak",
          },
          {
            topicId: "topic-3",
            topicName: "IP Addressing & Routing Algorithms",
            score: 48,
            totalQuestions: 2,
            correctQuestions: 1.0,
            masteryLevel: "weak",
          },
        ],
        evaluations: [
          {
            questionId: "q-init-1",
            isCorrect: false,
            score: 0,
            userAnswer: "Reset cwnd to 1 MSS on 3 dup ACKs",
            correctAnswer: "Set ssthresh = cwnd / 2 and enter Fast Recovery",
            explanation: "In TCP Reno, 3 duplicate ACKs trigger Fast Retransmit and Fast Recovery, cutting cwnd in half rather than resetting to 1 MSS.",
            gapIdentified: "Confused TCP Tahoe behavior with TCP Reno Fast Recovery.",
            sourceCitations: [
              {
                chunkId: "chk-tcp-congestion",
                documentName: "Unit_4_Transport_Layer_DeepDive.pdf",
                category: "textbook",
                pageNumber: 9,
                sectionTitle: "Section 4.5: TCP Congestion Control Mechanisms",
                snippet: "When a packet loss occurs via 3 duplicate ACKs... TCP Reno enters Fast Recovery without dropping cwnd back to 1 MSS.",
              },
            ],
          },
        ],
      },
    ],
    activeRevisionPlan: null,
  };
}

if (!globalForStore.__gapfinderStore) {
  globalForStore.__gapfinderStore = initDefaultStore();
}

const localStore = globalForStore.__gapfinderStore;

export const StorageRepository = {
  async getDocuments(): Promise<DocumentMetadata[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            category: d.category,
            pageCount: d.page_count,
            uploadedAt: d.created_at,
            fileSize: d.file_size,
            chunkCount: d.chunk_count,
            isSample: d.is_sample,
          }));
        }
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local store:", err);
      }
    }
    return localStore.documents;
  },

  async addDocument(metadata: DocumentMetadata, chunks: DocumentChunk[]): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("documents").insert({
          id: metadata.id,
          name: metadata.name,
          category: metadata.category,
          page_count: metadata.pageCount,
          file_size: metadata.fileSize,
          chunk_count: chunks.length,
          is_sample: metadata.isSample || false,
        });

        if (chunks.length > 0) {
          await supabase.from("document_chunks").insert(
            chunks.map((c) => ({
              id: c.id,
              document_id: metadata.id,
              document_name: metadata.name,
              category: metadata.category,
              page_number: c.pageNumber,
              section_title: c.sectionTitle,
              content: c.content,
              token_estimate: c.tokenEstimate,
            }))
          );
        }
      } catch (err) {
        console.warn("Supabase insert failed, adding to local store:", err);
      }
    }

    localStore.documents.unshift(metadata);
    localStore.chunks.push(...chunks);
  },

  async deleteDocument(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("documents").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete failed:", err);
      }
    }

    localStore.documents = localStore.documents.filter((d) => d.id !== id);
    localStore.chunks = localStore.chunks.filter((c) => c.documentId !== id);
  },

  async getChunks(documentId?: string): Promise<DocumentChunk[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from("document_chunks").select("*");
        if (documentId) {
          query = query.eq("document_id", documentId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((c: any) => ({
            id: c.id,
            documentId: c.document_id,
            documentName: c.document_name,
            category: c.category,
            pageNumber: c.page_number,
            sectionTitle: c.section_title,
            content: c.content,
            tokenEstimate: c.token_estimate,
          }));
        }
      } catch (err) {
        console.warn("Supabase fetch chunks failed, falling back to local store:", err);
      }
    }

    if (documentId) {
      return localStore.chunks.filter((c) => c.documentId === documentId);
    }
    return localStore.chunks;
  },

  async getTopics(): Promise<Topic[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("topics").select("*").order("unit");
        if (!error && data && data.length > 0) {
          return data.map((t: any) => ({
            id: t.id,
            name: t.name,
            unit: t.unit,
            description: t.description,
            examWeightage: t.exam_weightage,
            targetScore: t.target_score,
            currentScore: Number(t.current_score),
            questionsAttempted: t.questions_attempted,
            questionsCorrect: Number(t.questions_correct),
            masteryLevel: t.mastery_level,
            subtopics: t.subtopics || [],
            lastAssessedAt: t.last_assessed_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase get topics failed, falling back to local store:", err);
      }
    }
    return localStore.topics;
  },

  async updateTopics(updatedTopics: Topic[]): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        for (const t of updatedTopics) {
          await supabase.from("topics").upsert({
            id: t.id,
            name: t.name,
            unit: t.unit,
            description: t.description,
            exam_weightage: t.examWeightage,
            target_score: t.targetScore,
            current_score: t.currentScore,
            questions_attempted: t.questionsAttempted,
            questions_correct: t.questionsCorrect,
            mastery_level: t.masteryLevel,
            subtopics: t.subtopics,
            last_assessed_at: t.lastAssessedAt,
          });
        }
      } catch (err) {
        console.warn("Supabase topic update failed:", err);
      }
    }

    localStore.topics = updatedTopics;
  },

  async saveQuizAttempt(result: QuizResult): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("quiz_attempts").insert({
          id: result.quizId,
          submitted_at: result.submittedAt,
          total_questions: result.totalQuestions,
          correct_count: result.correctCount,
          overall_score: result.overallScore,
          topic_breakdown: result.topicBreakdown,
          evaluations: result.evaluations,
        });
      } catch (err) {
        console.warn("Supabase save quiz attempt failed:", err);
      }
    }

    localStore.quizAttempts.unshift(result);
  },

  async getRecentQuizAttempts(): Promise<QuizResult[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("quiz_attempts").select("*").order("submitted_at", { ascending: false }).limit(10);
        if (!error && data && data.length > 0) {
          return data.map((q: any) => ({
            quizId: q.id,
            submittedAt: q.submitted_at,
            totalQuestions: q.total_questions,
            correctCount: q.correct_count,
            overallScore: Number(q.overall_score),
            topicBreakdown: q.topic_breakdown,
            evaluations: q.evaluations,
          }));
        }
      } catch (err) {
        console.warn("Supabase get quiz attempts failed:", err);
      }
    }

    return localStore.quizAttempts;
  },

  async getRevisionPlan(): Promise<RevisionPlan | null> {
    return localStore.activeRevisionPlan;
  },

  async saveRevisionPlan(plan: RevisionPlan): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from("revision_plans").upsert({
          id: plan.id,
          exam_date: plan.examDate,
          days_remaining: plan.daysRemaining,
          daily_hours_available: plan.dailyHoursAvailable,
          total_study_hours_available: plan.totalStudyHoursAvailable,
          strategy_summary: plan.strategySummary,
          weak_topic_hours: plan.weakTopicHours,
          medium_topic_hours: plan.mediumTopicHours,
          strong_topic_hours: plan.strongTopicHours,
          daily_schedules: plan.dailySchedules,
        });
      } catch (err) {
        console.warn("Supabase save revision plan failed:", err);
      }
    }

    localStore.activeRevisionPlan = plan;
  },

  async toggleTaskCompleted(taskId: string): Promise<boolean> {
    if (!localStore.activeRevisionPlan) return false;
    for (const schedule of localStore.activeRevisionPlan.dailySchedules) {
      const task = schedule.tasks.find((t) => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        return task.completed;
      }
    }
    return false;
  },

  resetToSampleData(): void {
    const fresh = initDefaultStore();
    localStore.documents = fresh.documents;
    localStore.chunks = fresh.chunks;
    localStore.topics = fresh.topics;
    localStore.quizAttempts = fresh.quizAttempts;
    localStore.activeRevisionPlan = null;
  },
};

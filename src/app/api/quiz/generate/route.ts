import { NextRequest, NextResponse } from "next/server";
import { generateQuizQuestions } from "@/lib/gemini";
import { retrieveRelevantChunks } from "@/lib/rag";
import { StorageRepository } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicId, questionCount = 3, questionType = "multiple_choice" } = body;

    const topics = await StorageRepository.getTopics();
    const corpus = await StorageRepository.getChunks();

    if (corpus.length === 0) {
      return NextResponse.json(
        { error: "No study materials uploaded. Please upload syllabus or textbook materials first." },
        { status: 400 }
      );
    }

    let targetTopic = topics.find((t) => t.id === topicId);
    let topicName = targetTopic ? targetTopic.name : "Computer Networks Core Topics";

    // Build search query from topic name and subtopics
    const searchQuery = targetTopic
      ? `${targetTopic.name} ${targetTopic.subtopics.join(" ")} ${targetTopic.description}`
      : "Computer Networks routing transport protocols";

    // Retrieve relevant chunks via cosine vector similarity
    const retrieved = retrieveRelevantChunks({
      query: searchQuery,
      corpus,
      topK: Math.max(questionCount * 2, 4),
      minRelevance: 0.05,
    });

    const relevantChunks = retrieved.map((r) => r.chunk);

    if (relevantChunks.length === 0) {
      return NextResponse.json(
        {
          error: `Could not retrieve sufficient material grounded in topic "${topicName}". Upload additional study notes for this section.`,
        },
        { status: 400 }
      );
    }

    // Generate grounded quiz questions
    const questions = await generateQuizQuestions({
      topicId: targetTopic ? targetTopic.id : "topic-general",
      topicName,
      chunks: relevantChunks,
      count: Number(questionCount) || 3,
      type: questionType,
    });

    return NextResponse.json({
      success: true,
      topicId: targetTopic ? targetTopic.id : "topic-general",
      topicName,
      questions,
      retrievedChunksCount: relevantChunks.length,
    });
  } catch (err: any) {
    console.error("Quiz generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate quiz" }, { status: 500 });
  }
}

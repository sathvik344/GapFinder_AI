import { NextRequest, NextResponse } from "next/server";
import { evaluateQuizSubmission } from "@/lib/scoring";
import { updateTopicScoresWithQuiz } from "@/lib/gapAnalysis";
import { StorageRepository } from "@/lib/storage";
import { QuizQuestion, QuizSubmissionAnswer } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questions, submissions } = body as {
      questions: QuizQuestion[];
      submissions: QuizSubmissionAnswer[];
    };

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Questions array is required." }, { status: 400 });
    }

    if (!submissions || !Array.isArray(submissions)) {
      return NextResponse.json({ error: "Submissions array is required." }, { status: 400 });
    }

    // Real mathematical scoring
    const quizResult = evaluateQuizSubmission(questions, submissions);

    // Save quiz attempt
    await StorageRepository.saveQuizAttempt(quizResult);

    // Update topic scores dynamically with quiz results
    const currentTopics = await StorageRepository.getTopics();
    const updatedTopics = updateTopicScoresWithQuiz(currentTopics, quizResult);
    await StorageRepository.updateTopics(updatedTopics);

    return NextResponse.json({
      success: true,
      quizResult,
      updatedTopics,
    });
  } catch (err: any) {
    console.error("Quiz evaluation error:", err);
    return NextResponse.json({ error: err.message || "Evaluation failed" }, { status: 500 });
  }
}

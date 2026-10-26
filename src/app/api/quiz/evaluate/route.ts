import { NextRequest, NextResponse } from "next/server";
import { evaluateQuizSubmission } from "@/lib/scoring";
import { updateTopicScoresWithQuiz } from "@/lib/gapAnalysis";
import { generateRevisionPlan } from "@/lib/scheduler";
import { StorageRepository } from "@/lib/storage";
import { QuizQuestion, QuizSubmissionAnswer } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const attempts = await StorageRepository.getRecentQuizAttempts();
    return NextResponse.json({ attempts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    // 1. Calculate actual marks & evaluate answers
    const quizResult = evaluateQuizSubmission(questions, submissions);

    // 2. Persist quiz attempt (Supabase or local store)
    await StorageRepository.saveQuizAttempt(quizResult);

    // 3. Dynamically update topic scores & compile evidence
    const currentTopics = await StorageRepository.getTopics();
    const updatedTopics = updateTopicScoresWithQuiz(currentTopics, quizResult);
    await StorageRepository.updateTopics(updatedTopics);

    // 4. Update the active revision plan dynamically to reflect new topic priorities
    let updatedPlan = await StorageRepository.getRevisionPlan();
    if (updatedPlan) {
      updatedPlan = generateRevisionPlan({
        examDate: updatedPlan.examDate,
        dailyHoursAvailable: updatedPlan.dailyHoursAvailable,
        topics: updatedTopics,
      });
      await StorageRepository.saveRevisionPlan(updatedPlan);
    }

    return NextResponse.json({
      success: true,
      quizResult,
      updatedTopics,
      updatedPlan,
    });
  } catch (err: any) {
    console.error("Quiz evaluation error:", err);
    return NextResponse.json({ error: err.message || "Evaluation failed" }, { status: 500 });
  }
}

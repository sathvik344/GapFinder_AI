import { NextRequest, NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage";
import { calculateMasteryLevel } from "@/lib/scoring";
import { Topic } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topics = await StorageRepository.getTopics();
    return NextResponse.json({ topics });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, unit, description, examWeightage, subtopics } = body;

    if (!name || !unit) {
      return NextResponse.json(
        { error: "Topic name and unit are required." },
        { status: 400 }
      );
    }

    const topics = await StorageRepository.getTopics();
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      name,
      unit,
      description: description || "",
      examWeightage: examWeightage || "Medium",
      targetScore: 80,
      currentScore: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      masteryLevel: "untested",
      subtopics: Array.isArray(subtopics) ? subtopics : [],
    };

    topics.push(newTopic);
    await StorageRepository.updateTopics(topics);

    return NextResponse.json({ success: true, topic: newTopic });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

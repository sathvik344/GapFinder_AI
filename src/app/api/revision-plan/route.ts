import { NextRequest, NextResponse } from "next/server";
import { generateRevisionPlan } from "@/lib/scheduler";
import { StorageRepository } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let plan = await StorageRepository.getRevisionPlan();
    if (!plan) {
      // Create initial plan for 14 days out at 2.0 hours/day
      const topics = await StorageRepository.getTopics();
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      const dateStr = defaultDate.toISOString().split("T")[0];

      plan = generateRevisionPlan({
        examDate: dateStr,
        dailyHoursAvailable: 2,
        topics,
      });
      await StorageRepository.saveRevisionPlan(plan);
    }

    return NextResponse.json({ plan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { examDate, dailyHoursAvailable = 2 } = body;

    if (!examDate) {
      return NextResponse.json({ error: "Exam date is required." }, { status: 400 });
    }

    const topics = await StorageRepository.getTopics();
    const plan = generateRevisionPlan({
      examDate,
      dailyHoursAvailable: Number(dailyHoursAvailable) || 2,
      topics,
    });

    await StorageRepository.saveRevisionPlan(plan);
    return NextResponse.json({ success: true, plan });
  } catch (err: any) {
    console.error("Revision planner error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate plan" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const completed = await StorageRepository.toggleTaskCompleted(taskId);
    return NextResponse.json({ success: true, taskId, completed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

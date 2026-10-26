import { NextResponse } from "next/server";
import { generateGapAnalysisReport } from "@/lib/gapAnalysis";
import { StorageRepository } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topics = await StorageRepository.getTopics();
    const report = generateGapAnalysisReport(topics);
    return NextResponse.json({ report });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateGroundedChatResponse } from "@/lib/gemini";
import { retrieveRelevantChunks } from "@/lib/rag";
import { StorageRepository } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const corpus = await StorageRepository.getChunks();
    const retrieved = retrieveRelevantChunks({
      query: message,
      corpus,
      topK: 3,
      minRelevance: 0.08,
    });

    const retrievedChunks = retrieved.map((r) => r.chunk);
    const response = await generateGroundedChatResponse({
      userMessage: message,
      retrievedChunks,
    });

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (err: any) {
    console.error("Chat assistant error:", err);
    return NextResponse.json({ error: err.message || "Failed to process chat" }, { status: 500 });
  }
}

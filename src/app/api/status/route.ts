import { NextResponse } from "next/server";
import { isGeminiConfigured } from "@/lib/gemini";
import { isSupabaseConfigured } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const geminiActive = isGeminiConfigured();
  const supabaseActive = isSupabaseConfigured();

  return NextResponse.json({
    geminiConfigured: geminiActive,
    supabaseConfigured: supabaseActive,
    mode: geminiActive && supabaseActive ? "live" : "demo",
    statusMessage:
      geminiActive && supabaseActive
        ? "Connected to Live Gemini API & Supabase PostgreSQL"
        : "Running in Demo Mode with bundled sample material & local persistence",
  });
}

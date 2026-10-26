import { NextResponse } from "next/server";
import { StorageRepository } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    StorageRepository.resetToSampleData();
    return NextResponse.json({
      success: true,
      message: "Successfully reset to bundled Computer Networks sample dataset.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { memoryClient } from "@/services/cognee/client";

export async function GET() {
  try {
    const timeline = await memoryClient.getTimeline();
    return NextResponse.json({ groups: timeline });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load the timeline." },
      { status: 500 }
    );
  }
}

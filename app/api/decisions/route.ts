import { NextResponse } from "next/server";
import { memoryClient } from "@/services/cognee/client";

export async function GET() {
  try {
    const decisions = await memoryClient.getDecisions();
    return NextResponse.json({ decisions });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load decisions." },
      { status: 500 }
    );
  }
}

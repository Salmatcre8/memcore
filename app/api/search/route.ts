import { NextRequest, NextResponse } from "next/server";
import { memoryClient } from "@/services/cognee/client";
import { searchSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }
    const { query, limit } = parsed.data;
    const results = await memoryClient.search(query, limit);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to search memory." },
      { status: 500 }
    );
  }
}

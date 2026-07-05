import { NextRequest, NextResponse } from "next/server";
import { memoryClient } from "@/services/cognee/client";
import { explainSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = explainSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }
    const explanation = await memoryClient.explain(parsed.data.question);
    return NextResponse.json(explanation);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to explain this memory." },
      { status: 500 }
    );
  }
}

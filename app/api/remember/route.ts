import { NextRequest, NextResponse } from "next/server";
import { memoryClient } from "@/services/cognee/client";
import { rememberSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = rememberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }
    const { title, content, source } = parsed.data;

    const result = await memoryClient.remember({
      title,
      content,
      source: source ?? "manual-upload",
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to store this memory." },
      { status: 500 }
    );
  }
}

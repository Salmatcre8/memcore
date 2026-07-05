import { NextRequest, NextResponse } from "next/server";
import { memoryClient } from "@/services/cognee/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memory = await memoryClient.getMemory(params.id);
    if (!memory) {
      return NextResponse.json({ error: "Memory not found." }, { status: 404 });
    }
    return NextResponse.json(memory);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load this memory." },
      { status: 500 }
    );
  }
}

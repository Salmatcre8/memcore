import { NextResponse } from "next/server";
import { memoryClient } from "@/services/cognee/client";

export async function GET() {
  try {
    const graph = await memoryClient.getGraph();
    return NextResponse.json(graph);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load the knowledge graph." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { memoryClient } from "@/services/cognee/client";

export async function POST() {
  try {
    const result = await memoryClient.forget();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reset memory." },
      { status: 500 }
    );
  }
}

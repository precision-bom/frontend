import { NextRequest, NextResponse } from "next/server";
import { parseBomCsv } from "@/lib/bom-parser";
import { suggestBomsWithAgent } from "@/lib/bom-agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csvContent, items } = body;

    // Either parse CSV or use provided items
    let bomItems;
    if (csvContent) {
      bomItems = parseBomCsv(csvContent);
    } else if (items && Array.isArray(items)) {
      bomItems = items;
    } else {
      return NextResponse.json(
        { error: "Either csvContent or items array is required" },
        { status: 400 }
      );
    }

    if (bomItems.length === 0) {
      return NextResponse.json(
        { error: "No valid BOM items found" },
        { status: 400 }
      );
    }

    // Use the BOM agent for intelligent suggestion
    const result = await suggestBomsWithAgent(bomItems);

    return NextResponse.json(result);
  } catch (error) {
    console.error("BOM suggestion error:", error);
    const message = error instanceof Error ? error.message : "Failed to suggest BOMs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

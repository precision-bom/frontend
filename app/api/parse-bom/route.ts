import { NextRequest, NextResponse } from "next/server";
import { parseBomCsv, detectColumnMapping } from "@/lib/bom-parser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csvContent } = body;

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json(
        { error: "CSV content is required" },
        { status: 400 }
      );
    }

    const items = parseBomCsv(csvContent);
    const columnMapping = detectColumnMapping(csvContent);

    return NextResponse.json({
      items,
      columnMapping,
      count: items.length,
    });
  } catch (error) {
    console.error("BOM parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse BOM" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { parseBomCsv, detectColumnMapping } from "@/lib/bom-parser";
import { verifySovereignAccess } from "@/lib/forensic-gate";

interface ForensicGateError extends Error {
  status?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Sovereign Gating Strike
    try {
      await verifySovereignAccess(request);
    } catch (gateError: unknown) {
      const err = gateError as ForensicGateError;
      if (err.status === 402) {
        return NextResponse.json({ error: err.message }, { status: 402 });
      }
      return NextResponse.json({ error: err.message }, { status: 401 });
    }

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

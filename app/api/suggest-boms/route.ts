import { NextRequest, NextResponse } from "next/server";
import { parseBomCsv } from "@/lib/bom-parser";
import { suggestBomsWithAgent } from "@/lib/bom-agent";
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

import { NextRequest, NextResponse } from "next/server";
import { getPartSuggestions, identifyPart } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item, message, action } = body;

    if (action === "identify") {
      // Auto-identify a part based on partial information
      const partInfo = `Part Number: ${item.partNumber || "unknown"}, Description: ${item.description || "unknown"}, Manufacturer: ${item.manufacturer || "unknown"}`;
      const result = await identifyPart(partInfo);

      return NextResponse.json({
        success: true,
        identification: result,
      });
    }

    // Chat-based suggestion
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!item) {
      return NextResponse.json(
        { error: "BOM item context is required" },
        { status: 400 }
      );
    }

    const response = await getPartSuggestions(item, message);

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Suggestion error:", error);

    // Check if it's an API key error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          response: "AI suggestions are not available. Please configure OPENAI_API_KEY in your environment."
        },
        { status: 200 } // Return 200 so the UI can handle it gracefully
      );
    }

    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}

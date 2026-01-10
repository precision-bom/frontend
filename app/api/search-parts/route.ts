import { NextRequest, NextResponse } from "next/server";
import { getDefaultProvider, getProvider, ProviderName } from "@/lib/providers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, manufacturer, provider: providerName } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Get the specified provider or default
    const provider = providerName
      ? getProvider(providerName as ProviderName)
      : getDefaultProvider();

    // Search by MPN if manufacturer is provided, otherwise general search
    const results = manufacturer
      ? await provider.searchByMPN(query, manufacturer)
      : await provider.search(query);

    return NextResponse.json({
      results,
      provider: provider.name,
      query,
    });
  } catch (error) {
    console.error("Part search error:", error);
    return NextResponse.json(
      { error: "Failed to search for parts" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { pythonClient } from "@/lib/python-client";

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

    // Call Python API for search
    const response = await pythonClient.searchParts({
      query,
      manufacturer,
      providers: providerName ? [providerName] : undefined,
    });

    // Convert snake_case results to camelCase for frontend compatibility
    const results = response.results.map((r) => ({
      mpn: r.mpn,
      manufacturer: r.manufacturer,
      description: r.description,
      price: r.price,
      currency: r.currency,
      stock: r.stock,
      minQuantity: r.min_quantity,
      provider: r.provider,
      distributor: r.distributor,
      url: r.url,
    }));

    return NextResponse.json({
      results,
      providers: response.providers_searched,
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

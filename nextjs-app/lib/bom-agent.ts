import OpenAI from "openai";
import {
  BomItem,
  PartOffer,
  RealizedBom,
  RealizedLineItem,
  BomSuggestionResult,
} from "@/types/bom";
import {
  pythonClient,
  ProviderResult,
  getConfiguredProviders,
} from "./python-client";

interface AgentState {
  bomItems: BomItem[];
  offersMap: { [bomItemId: string]: PartOffer[] };
  reasoning: string[];
  suggestions: RealizedBom[];
  unmatchedItems: BomItem[];
}

interface PartAnalysis {
  bomItemId: string;
  query: string;
  isAmbiguous: boolean;
  suggestedSearchTerms: string[];
  notes: string;
}

interface OptimizationStrategy {
  name: string;
  description: string;
  selections: { [bomItemId: string]: number }; // index into offers array
  reasoning: string;
}

/**
 * BOM Optimization Agent - uses LLM for multi-round reasoning
 */
export class BomAgent {
  private openai: OpenAI | null = null;
  private state: AgentState;

  constructor() {
    this.state = {
      bomItems: [],
      offersMap: {},
      reasoning: [],
      suggestions: [],
      unmatchedItems: [],
    };
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY not configured");
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  private log(message: string) {
    console.log(`[BomAgent] ${message}`);
    this.state.reasoning.push(message);
  }

  /**
   * Main entry point - run the agent to suggest BOMs
   */
  async suggestBoms(items: BomItem[]): Promise<BomSuggestionResult & { reasoning: string[] }> {
    this.state.bomItems = items;
    this.log(`Starting BOM analysis for ${items.length} items`);

    // Step 1: Analyze BOM items for ambiguity
    const analysis = await this.analyzeBomItems(items);

    // Step 2: Search for parts across all providers
    await this.searchAllParts(items, analysis);

    // Step 3: Use LLM to reason about joint optimization
    const strategies = await this.generateOptimizationStrategies();

    // Step 4: Realize BOMs from strategies
    this.state.suggestions = this.realizeStrategies(strategies);

    // Step 5: Find unmatched items
    this.state.unmatchedItems = items.filter(
      (item) => !this.state.offersMap[item.id] || this.state.offersMap[item.id].length === 0
    );

    this.log(`Generated ${this.state.suggestions.length} BOM configurations`);

    return {
      originalItems: items,
      suggestions: this.state.suggestions,
      unmatchedItems: this.state.unmatchedItems,
      reasoning: this.state.reasoning,
    };
  }

  /**
   * Step 1: Analyze BOM items using LLM
   */
  private async analyzeBomItems(items: BomItem[]): Promise<PartAnalysis[]> {
    this.log("Analyzing BOM items for ambiguity and search optimization...");

    const openai = this.getOpenAI();

    const bomSummary = items.map((item) => ({
      id: item.id,
      partNumber: item.partNumber,
      description: item.description,
      manufacturer: item.manufacturer,
      mpn: item.mpn,
      quantity: item.quantity,
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an electronics parts sourcing expert. Analyze this BOM and for each item:
1. Determine if the part specification is ambiguous or needs clarification
2. Suggest optimal search terms for distributor APIs
3. Note any concerns (obsolete parts, unclear specs, etc.)

Respond in JSON format:
{
  "analysis": [
    {
      "bomItemId": "id",
      "query": "best search query for this part",
      "isAmbiguous": true/false,
      "suggestedSearchTerms": ["term1", "term2"],
      "notes": "any concerns or suggestions"
    }
  ],
  "overallNotes": "any BOM-level observations"
}`,
        },
        {
          role: "user",
          content: JSON.stringify(bomSummary, null, 2),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");

    if (result.overallNotes) {
      this.log(`BOM Analysis: ${result.overallNotes}`);
    }

    const ambiguousCount = (result.analysis || []).filter((a: PartAnalysis) => a.isAmbiguous).length;
    if (ambiguousCount > 0) {
      this.log(`Found ${ambiguousCount} ambiguous items that may need clarification`);
    }

    return result.analysis || items.map((item) => ({
      bomItemId: item.id,
      query: item.mpn || item.partNumber || item.description,
      isAmbiguous: false,
      suggestedSearchTerms: [],
      notes: "",
    }));
  }

  /**
   * Convert Python ProviderResult (snake_case) to PartOffer (camelCase)
   */
  private toPartOffer(result: ProviderResult): PartOffer {
    return {
      mpn: result.mpn,
      manufacturer: result.manufacturer,
      description: result.description,
      price: result.price,
      currency: result.currency,
      stock: result.stock,
      minQuantity: result.min_quantity,
      provider: result.provider,
      distributor: result.distributor,
      url: result.url,
    };
  }

  /**
   * Step 2: Search for parts across all providers via Python API
   */
  private async searchAllParts(items: BomItem[], analysis: PartAnalysis[]): Promise<void> {
    const providerNames = await getConfiguredProviders();
    this.log(`Searching via Python API across ${providerNames.length} providers: ${providerNames.join(", ")}`);

    // Initialize offers map
    for (const item of items) {
      this.state.offersMap[item.id] = [];
    }

    // Create a map of item ID to best search query
    const searchQueries: { [id: string]: string } = {};
    for (const item of items) {
      const itemAnalysis = analysis.find((a) => a.bomItemId === item.id);
      searchQueries[item.id] = itemAnalysis?.query || item.mpn || item.partNumber || item.description;
    }

    // Search all items in parallel via Python API
    const itemSearches = items.map(async (item) => {
      const query = searchQueries[item.id];
      try {
        const response = await pythonClient.searchParts({ query });
        // Convert snake_case to camelCase
        const offers = response.results.map((r) => this.toPartOffer(r));
        return { itemId: item.id, offers };
      } catch (error) {
        console.error(`Search failed for ${query}:`, error);
        return { itemId: item.id, offers: [] };
      }
    });

    const results = await Promise.all(itemSearches);

    // Aggregate results
    for (const { itemId, offers } of results) {
      this.state.offersMap[itemId].push(...offers);
    }

    // Log summary
    let totalOffers = 0;
    for (const item of items) {
      const count = this.state.offersMap[item.id].length;
      totalOffers += count;
      this.log(`  ${searchQueries[item.id]}: ${count} offers found`);
    }
    this.log(`Total: ${totalOffers} offers across all items`);
  }

  /**
   * Step 3: Use LLM to reason about joint optimization strategies
   */
  private async generateOptimizationStrategies(): Promise<OptimizationStrategy[]> {
    this.log("Generating optimization strategies with joint consideration...");

    const openai = this.getOpenAI();

    // Prepare data for LLM
    const bomWithOffers = this.state.bomItems
      .filter((item) => this.state.offersMap[item.id].length > 0)
      .map((item) => {
        const offers = this.state.offersMap[item.id].slice(0, 5); // Top 5 offers per item
        return {
          bomItemId: item.id,
          partNumber: item.partNumber,
          description: item.description,
          quantity: item.quantity,
          offers: offers.map((o, i) => ({
            index: i,
            mpn: o.mpn,
            manufacturer: o.manufacturer,
            distributor: o.distributor,
            price: o.price,
            stock: o.stock,
            minQty: o.minQuantity,
          })),
        };
      });

    if (bomWithOffers.length === 0) {
      this.log("No offers found for any items - cannot generate strategies");
      return [];
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a BOM optimization expert. Given a BOM with offers from multiple distributors, generate 2-4 optimal sourcing strategies.

Consider these factors for JOINT optimization:
1. **Distributor Consolidation**: Fewer distributors = lower shipping costs
2. **Volume Pricing**: Some distributors offer better prices at higher quantities
3. **Stock Availability**: Prefer in-stock items for faster delivery
4. **Total Cost**: Balance individual part prices with shipping consolidation
5. **Minimum Order Quantities**: Some offers require minimum quantities

Generate strategies that represent different trade-offs (e.g., lowest cost vs fastest delivery vs single distributor).

Respond in JSON format:
{
  "strategies": [
    {
      "name": "Strategy Name",
      "description": "Brief description of this strategy's trade-offs",
      "selections": {"bomItemId1": 0, "bomItemId2": 1},
      "reasoning": "Detailed explanation of why these selections optimize for this strategy"
    }
  ],
  "jointConsiderations": "Explanation of cross-item dependencies and trade-offs considered"
}

The "selections" object maps bomItemId to the index of the selected offer (0-indexed).`,
        },
        {
          role: "user",
          content: JSON.stringify(bomWithOffers, null, 2),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");

    if (result.jointConsiderations) {
      this.log(`Joint Optimization Analysis: ${result.jointConsiderations}`);
    }

    const strategies: OptimizationStrategy[] = result.strategies || [];
    this.log(`Generated ${strategies.length} optimization strategies`);

    for (const strategy of strategies) {
      this.log(`  - ${strategy.name}: ${strategy.description}`);
    }

    return strategies;
  }

  /**
   * Step 4: Convert strategies into realized BOMs
   */
  private realizeStrategies(strategies: OptimizationStrategy[]): RealizedBom[] {
    const realizedBoms: RealizedBom[] = [];

    for (const strategy of strategies) {
      const lineItems: RealizedLineItem[] = [];

      for (const item of this.state.bomItems) {
        const offers = this.state.offersMap[item.id];
        if (!offers || offers.length === 0) continue;

        const selectedIndex = strategy.selections[item.id] ?? 0;
        const offer = offers[Math.min(selectedIndex, offers.length - 1)];

        lineItems.push({
          bomItemId: item.id,
          bomItem: item,
          offer,
          unitPrice: offer.price,
          lineTotal: item.quantity * offer.price,
          inStock: offer.stock >= item.quantity,
        });
      }

      if (lineItems.length === 0) continue;

      const totalCost = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const allInStock = lineItems.every((item) => item.inStock);
      const distributors = Array.from(new Set(lineItems.map((item) => item.offer.distributor)));

      // Calculate score
      let score = 0;
      const coverage = lineItems.length / this.state.bomItems.length;
      score += coverage * 50;
      if (allInStock) score += 20;
      if (distributors.length === 1) score += 15;
      else if (distributors.length === 2) score += 10;
      else if (distributors.length <= 3) score += 5;
      if (coverage === 1) score += 15;

      realizedBoms.push({
        id: `bom-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        name: strategy.name,
        description: strategy.reasoning || strategy.description,
        lineItems,
        totalCost,
        currency: "USD",
        allInStock,
        distributors,
        score: Math.round(Math.min(100, Math.max(0, score))),
      });
    }

    // Sort by score
    return realizedBoms.sort((a, b) => b.score - a.score);
  }
}

/**
 * Main function to run the BOM agent
 */
export async function suggestBomsWithAgent(
  items: BomItem[]
): Promise<BomSuggestionResult & { reasoning: string[] }> {
  const agent = new BomAgent();
  return agent.suggestBoms(items);
}

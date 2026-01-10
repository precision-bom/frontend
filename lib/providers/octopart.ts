import { ProviderResult } from "@/types/bom";
import {
  PartProvider,
  OctopartSearchResponse,
  OctopartPart,
} from "./types";

const OCTOPART_API_URL = "https://octopart.com/api/v4/endpoint";

export class OctopartProvider implements PartProvider {
  name = "octopart";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OCTOPART_API_KEY || "";
  }

  async search(query: string): Promise<ProviderResult[]> {
    return this.executeSearch(query);
  }

  async searchByMPN(mpn: string, manufacturer?: string): Promise<ProviderResult[]> {
    const query = manufacturer ? `${manufacturer} ${mpn}` : mpn;
    return this.executeSearch(query);
  }

  private async executeSearch(query: string): Promise<ProviderResult[]> {
    if (!this.apiKey) {
      console.warn("No Octopart API key configured, returning mock data");
      return this.getMockResults(query);
    }

    const graphqlQuery = `
      query Search($q: String!) {
        search(q: $q, limit: 10) {
          results {
            part {
              mpn
              manufacturer {
                name
              }
              short_description
              sellers {
                company {
                  name
                }
                offers {
                  click_url
                  inventory_level
                  moq
                  prices {
                    price
                    currency
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(OCTOPART_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { q: query },
        }),
      });

      if (!response.ok) {
        throw new Error(`Octopart API error: ${response.status}`);
      }

      const data: OctopartSearchResponse = await response.json();
      return this.transformResults(data);
    } catch (error) {
      console.error("Octopart search failed:", error);
      return this.getMockResults(query);
    }
  }

  private transformResults(data: OctopartSearchResponse): ProviderResult[] {
    const results: ProviderResult[] = [];

    for (const result of data.data.search.results) {
      const part = result.part;

      for (const seller of part.sellers) {
        for (const offer of seller.offers) {
          if (offer.prices.length === 0) continue;

          // Get the lowest price tier
          const lowestPrice = offer.prices.reduce((min, p) =>
            p.price < min.price ? p : min
          );

          results.push({
            partNumber: part.mpn,
            manufacturer: part.manufacturer.name,
            description: part.short_description,
            price: lowestPrice.price,
            currency: lowestPrice.currency,
            stock: offer.inventory_level,
            minQuantity: offer.moq || 1,
            provider: this.name,
            distributor: seller.company.name,
            url: offer.click_url,
          });
        }
      }
    }

    // Sort by price
    return results.sort((a, b) => a.price - b.price);
  }

  private getMockResults(query: string): ProviderResult[] {
    // Return mock data when API key is not configured
    return [
      {
        partNumber: query.toUpperCase(),
        manufacturer: "Example Mfg",
        description: `Mock result for "${query}"`,
        price: 1.25,
        currency: "USD",
        stock: 1000,
        minQuantity: 1,
        provider: this.name,
        distributor: "DigiKey",
        url: "https://www.digikey.com",
      },
      {
        partNumber: query.toUpperCase(),
        manufacturer: "Example Mfg",
        description: `Mock result for "${query}"`,
        price: 1.15,
        currency: "USD",
        stock: 500,
        minQuantity: 10,
        provider: this.name,
        distributor: "Mouser",
        url: "https://www.mouser.com",
      },
      {
        partNumber: query.toUpperCase(),
        manufacturer: "Example Mfg",
        description: `Mock result for "${query}"`,
        price: 0.95,
        currency: "USD",
        stock: 2500,
        minQuantity: 100,
        provider: this.name,
        distributor: "Arrow",
        url: "https://www.arrow.com",
      },
    ];
  }
}

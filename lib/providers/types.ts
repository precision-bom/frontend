import { ProviderResult } from "@/types/bom";

export interface PartProvider {
  name: string;

  /**
   * Search for parts by a general query string
   */
  search(query: string): Promise<ProviderResult[]>;

  /**
   * Search for parts by manufacturer part number (more precise)
   */
  searchByMPN(mpn: string, manufacturer?: string): Promise<ProviderResult[]>;
}

export interface OctopartSearchResponse {
  data: {
    search: {
      results: OctopartPart[];
    };
  };
}

export interface OctopartPart {
  part: {
    mpn: string;
    manufacturer: {
      name: string;
    };
    short_description: string;
    sellers: OctopartSeller[];
  };
}

export interface OctopartSeller {
  company: {
    name: string;
  };
  offers: OctopartOffer[];
}

export interface OctopartOffer {
  click_url: string;
  inventory_level: number;
  moq: number | null;
  prices: OctopartPrice[];
}

export interface OctopartPrice {
  price: number;
  currency: string;
  quantity: number;
}

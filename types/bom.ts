export interface BomItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  manufacturer?: string;
  mpn?: string; // Manufacturer Part Number
  status: "pending" | "matched" | "needs_review";
  selectedOffer?: ProviderResult;
}

export interface ProviderResult {
  partNumber: string;
  manufacturer: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  minQuantity: number;
  provider: string;
  distributor: string;
  url: string;
}

export interface ParsedBomRow {
  [key: string]: string | number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

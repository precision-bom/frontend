/**
 * A single item in a Bill of Materials (input from user)
 */
export interface BomItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  manufacturer?: string;
  mpn?: string;
}

/**
 * A part offer from a distributor
 */
export interface PartOffer {
  mpn: string;
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

/**
 * A realized line item - a BOM item matched to a specific offer
 */
export interface RealizedLineItem {
  bomItemId: string;
  bomItem: BomItem;
  offer: PartOffer;
  unitPrice: number;
  lineTotal: number; // quantity * unitPrice
  inStock: boolean;
}

/**
 * A complete realized BOM - all items sourced with specific offers
 */
export interface RealizedBom {
  id: string;
  name: string;
  description: string;
  lineItems: RealizedLineItem[];
  totalCost: number;
  currency: string;
  allInStock: boolean;
  distributors: string[]; // unique distributors in this BOM
  score: number; // 0-100, higher is better (considers price, stock, distributor consolidation)
}

/**
 * Result of BOM suggestion - multiple possible realizations
 */
export interface BomSuggestionResult {
  originalItems: BomItem[];
  suggestions: RealizedBom[];
  unmatchedItems: BomItem[]; // items with no offers found
  reasoning?: string[]; // agent reasoning steps
}

/**
 * Parsed row from CSV (raw)
 */
export interface ParsedBomRow {
  [key: string]: string | number;
}

/**
 * Chat message for AI assistant
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Legacy alias for backward compatibility
export type ProviderResult = PartOffer;

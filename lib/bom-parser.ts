import Papa from "papaparse";
import { BomItem, ParsedBomRow } from "@/types/bom";

// Common column name variations for each field
const COLUMN_MAPPINGS: Record<keyof Omit<BomItem, "id" | "status" | "selectedOffer">, string[]> = {
  partNumber: [
    "part number",
    "partnumber",
    "part_number",
    "part#",
    "part no",
    "partno",
    "pn",
    "item",
    "item number",
    "designator",
    "reference",
    "ref",
  ],
  description: [
    "description",
    "desc",
    "part description",
    "component",
    "value",
    "comment",
    "notes",
  ],
  quantity: [
    "quantity",
    "qty",
    "count",
    "amount",
    "qty.",
    "quantity needed",
  ],
  manufacturer: [
    "manufacturer",
    "mfr",
    "mfg",
    "make",
    "brand",
    "vendor",
    "manufacturer name",
  ],
  mpn: [
    "mpn",
    "mfr part number",
    "mfr pn",
    "manufacturer part number",
    "mfg part",
    "mfg pn",
    "manufacturer pn",
  ],
};

/**
 * Find the best matching column name from the CSV headers
 */
function findColumn(
  headers: string[],
  fieldMappings: string[]
): string | null {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());

  for (const mapping of fieldMappings) {
    const index = normalizedHeaders.findIndex(
      (h) => h === mapping || h.includes(mapping)
    );
    if (index !== -1) {
      return headers[index];
    }
  }

  return null;
}

/**
 * Generate a unique ID for a BOM item
 */
function generateId(): string {
  return `bom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse CSV content and extract BOM items
 */
export function parseBomCsv(csvContent: string): BomItem[] {
  const result = Papa.parse<ParsedBomRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    console.warn("CSV parsing warnings:", result.errors);
  }

  const headers = result.meta.fields || [];

  // Map CSV columns to BOM fields
  const columnMap: Record<string, string | null> = {
    partNumber: findColumn(headers, COLUMN_MAPPINGS.partNumber),
    description: findColumn(headers, COLUMN_MAPPINGS.description),
    quantity: findColumn(headers, COLUMN_MAPPINGS.quantity),
    manufacturer: findColumn(headers, COLUMN_MAPPINGS.manufacturer),
    mpn: findColumn(headers, COLUMN_MAPPINGS.mpn),
  };

  // Convert rows to BomItems
  const items: BomItem[] = result.data.map((row) => {
    const getValue = (field: string): string => {
      const column = columnMap[field];
      if (!column) return "";
      const value = row[column];
      return typeof value === "string" ? value.trim() : String(value || "");
    };

    const getNumber = (field: string): number => {
      const value = getValue(field);
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 1 : parsed;
    };

    return {
      id: generateId(),
      partNumber: getValue("partNumber"),
      description: getValue("description"),
      quantity: getNumber("quantity"),
      manufacturer: getValue("manufacturer") || undefined,
      mpn: getValue("mpn") || undefined,
      status: "pending" as const,
    };
  });

  // Filter out empty rows
  return items.filter(
    (item) => item.partNumber || item.description || item.mpn
  );
}

/**
 * Detect the column mapping for a CSV
 */
export function detectColumnMapping(csvContent: string): Record<string, string | null> {
  const result = Papa.parse<ParsedBomRow>(csvContent, {
    header: true,
    preview: 1,
  });

  const headers = result.meta.fields || [];

  return {
    partNumber: findColumn(headers, COLUMN_MAPPINGS.partNumber),
    description: findColumn(headers, COLUMN_MAPPINGS.description),
    quantity: findColumn(headers, COLUMN_MAPPINGS.quantity),
    manufacturer: findColumn(headers, COLUMN_MAPPINGS.manufacturer),
    mpn: findColumn(headers, COLUMN_MAPPINGS.mpn),
  };
}

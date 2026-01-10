"use client";

import { BomItem, ProviderResult } from "@/types/bom";

interface PartSearchProps {
  item: BomItem;
  results: ProviderResult[];
  isLoading: boolean;
}

export default function PartSearch({ item, results, isLoading }: PartSearchProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
        <p className="text-sm text-gray-500 mt-1">
          Searching for: {item.mpn || item.partNumber || item.description}
        </p>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No results found. Try refining the search or check the MPN.
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={`${result.distributor}-${index}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {result.partNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.manufacturer}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {result.description}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600">
                      ${result.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.currency}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      <span className="font-medium">{result.stock.toLocaleString()}</span>{" "}
                      in stock
                    </span>
                    {result.minQuantity > 1 && (
                      <span className="text-gray-500">
                        Min: {result.minQuantity}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{result.distributor}</span>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

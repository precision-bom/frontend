"use client";

import { useState } from "react";
import { BomSuggestionResult, RealizedBom, RealizedLineItem } from "@/types/bom";

interface BomSuggestionsProps {
  result: BomSuggestionResult;
}

export default function BomSuggestions({ result }: BomSuggestionsProps) {
  const [expandedBom, setExpandedBom] = useState<string | null>(
    result.suggestions[0]?.id || null
  );
  const [showReasoning, setShowReasoning] = useState(false);

  const toggleExpand = (bomId: string) => {
    setExpandedBom(expandedBom === bomId ? null : bomId);
  };

  return (
    <div className="space-y-6">
      {/* Agent Reasoning */}
      {result.reasoning && result.reasoning.length > 0 && (
        <div className="bg-purple-50 rounded-lg shadow border border-purple-200">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-purple-600 text-lg">🤖</span>
              <span className="font-semibold text-purple-900">
                Agent Reasoning
              </span>
              <span className="text-purple-600 text-sm">
                ({result.reasoning.length} steps)
              </span>
            </div>
            <span className="text-purple-600">
              {showReasoning ? "▼" : "▶"}
            </span>
          </button>

          {showReasoning && (
            <div className="px-4 pb-4">
              <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                <ol className="space-y-2 text-sm">
                  {result.reasoning.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-purple-400 font-mono text-xs mt-0.5">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          BOM Analysis
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {result.originalItems.length}
            </div>
            <div className="text-sm text-gray-500">Total Items</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {result.originalItems.length - result.unmatchedItems.length}
            </div>
            <div className="text-sm text-gray-500">Matched</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {result.unmatchedItems.length}
            </div>
            <div className="text-sm text-gray-500">Unmatched</div>
          </div>
        </div>

        {result.unmatchedItems.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm font-medium text-yellow-800 mb-1">
              Unmatched items:
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {result.unmatchedItems.map((item) => (
                <li key={item.id}>
                  • {item.partNumber || item.mpn || item.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Suggested BOMs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Optimized Configurations ({result.suggestions.length})
        </h2>

        {result.suggestions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No BOM configurations could be generated. Check if the parts can be
            found in the distributor database.
          </div>
        ) : (
          result.suggestions.map((bom) => (
            <BomCard
              key={bom.id}
              bom={bom}
              isExpanded={expandedBom === bom.id}
              onToggle={() => toggleExpand(bom.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface BomCardProps {
  bom: RealizedBom;
  isExpanded: boolean;
  onToggle: () => void;
}

function BomCard({ bom, isExpanded, onToggle }: BomCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                bom.score >= 70
                  ? "bg-green-500"
                  : bom.score >= 50
                  ? "bg-yellow-500"
                  : "bg-gray-400"
              }`}
            >
              {bom.score}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{bom.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{bom.description}</p>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-xl font-bold text-gray-900">
              ${bom.totalCost.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {bom.allInStock ? (
                <span className="text-green-600">All in stock</span>
              ) : (
                <span className="text-yellow-600">Partial stock</span>
              )}
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">
                {bom.distributors.length} distributor
                {bom.distributors.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Distributors badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {bom.distributors.map((dist) => (
            <span
              key={dist}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {dist}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Part
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    MPN
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Distributor
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Unit
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bom.lineItems.map((item) => (
                  <LineItemRow key={item.bomItemId} item={item} />
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-right font-semibold">
                    Total:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-lg">
                    ${bom.totalCost.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function LineItemRow({ item }: { item: RealizedLineItem }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2 text-sm">
        <div className="font-medium text-gray-900">
          {item.bomItem.partNumber || item.bomItem.description}
        </div>
        <div className="text-xs text-gray-500 truncate max-w-[200px]">
          {item.offer.description}
        </div>
      </td>
      <td className="px-4 py-2 text-sm font-mono text-gray-600">
        {item.offer.mpn}
      </td>
      <td className="px-4 py-2 text-sm text-gray-900">
        {item.bomItem.quantity}
      </td>
      <td className="px-4 py-2 text-sm">
        <a
          href={item.offer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          {item.offer.distributor}
        </a>
      </td>
      <td className="px-4 py-2 text-sm">
        <span
          className={item.inStock ? "text-green-600" : "text-yellow-600"}
        >
          {item.offer.stock.toLocaleString()}
        </span>
      </td>
      <td className="px-4 py-2 text-sm text-right text-gray-900">
        ${item.unitPrice.toFixed(2)}
      </td>
      <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
        ${item.lineTotal.toFixed(2)}
      </td>
    </tr>
  );
}

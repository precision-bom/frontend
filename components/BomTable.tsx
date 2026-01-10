"use client";

import { BomItem } from "@/types/bom";

interface BomTableProps {
  items: BomItem[];
  selectedItem: BomItem | null;
  onSelectItem: (item: BomItem) => void;
  onUpdateItem: (item: BomItem) => void;
}

export default function BomTable({
  items,
  selectedItem,
  onSelectItem,
  onUpdateItem,
}: BomTableProps) {
  const getStatusBadge = (status: BomItem["status"]) => {
    const styles = {
      pending: "bg-gray-100 text-gray-700",
      matched: "bg-green-100 text-green-700",
      needs_review: "bg-yellow-100 text-yellow-700",
    };
    const labels = {
      pending: "Pending",
      matched: "Matched",
      needs_review: "Review",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleInlineEdit = (
    item: BomItem,
    field: keyof BomItem,
    value: string | number
  ) => {
    onUpdateItem({ ...item, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          BOM Items ({items.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Part #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Manufacturer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MPN
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                  selectedItem?.id === item.id ? "bg-blue-100" : ""
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.partNumber}
                    onChange={(e) =>
                      handleInlineEdit(item, "partNumber", e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-24 px-2 py-1 text-sm border border-transparent hover:border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleInlineEdit(item, "description", e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleInlineEdit(item, "quantity", parseInt(e.target.value) || 1)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 px-2 py-1 text-sm border border-transparent hover:border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min={1}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.manufacturer || ""}
                    onChange={(e) =>
                      handleInlineEdit(item, "manufacturer", e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    placeholder="—"
                    className="w-24 px-2 py-1 text-sm border border-transparent hover:border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.mpn || ""}
                    onChange={(e) =>
                      handleInlineEdit(item, "mpn", e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    placeholder="—"
                    className="w-32 px-2 py-1 text-sm font-mono border border-transparent hover:border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {item.selectedOffer ? (
                    <span className="font-medium text-green-600">
                      ${item.selectedOffer.price.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

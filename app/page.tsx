"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import BomTable from "@/components/BomTable";
import PartSearch from "@/components/PartSearch";
import ChatSuggestions from "@/components/ChatSuggestions";
import { BomItem, ProviderResult } from "@/types/bom";

export default function Home() {
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<BomItem | null>(null);
  const [searchResults, setSearchResults] = useState<ProviderResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleBomParsed = (items: BomItem[]) => {
    setBomItems(items);
    setSelectedItem(null);
    setSearchResults([]);
  };

  const handleSelectItem = async (item: BomItem) => {
    setSelectedItem(item);
    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch("/api/search-parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: item.mpn || item.partNumber || item.description,
          manufacturer: item.manufacturer,
        }),
      });
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateItem = (updatedItem: BomItem) => {
    setBomItems((items) =>
      items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    if (selectedItem?.id === updatedItem.id) {
      setSelectedItem(updatedItem);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        BOM Sourcing Tool
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Upload and BOM Table */}
        <div className="lg:col-span-2 space-y-6">
          <FileUpload onBomParsed={handleBomParsed} />

          {bomItems.length > 0 && (
            <BomTable
              items={bomItems}
              selectedItem={selectedItem}
              onSelectItem={handleSelectItem}
              onUpdateItem={handleUpdateItem}
            />
          )}
        </div>

        {/* Right column: Search Results and Chat */}
        <div className="space-y-6">
          {selectedItem && (
            <>
              <PartSearch
                item={selectedItem}
                results={searchResults}
                isLoading={isSearching}
              />
              <ChatSuggestions
                item={selectedItem}
                onUpdateItem={handleUpdateItem}
              />
            </>
          )}

          {!selectedItem && bomItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select a BOM item to search for parts and get suggestions
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

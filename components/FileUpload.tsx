"use client";

import { useState, useRef, DragEvent } from "react";
import { BomItem } from "@/types/bom";
import { EXAMPLE_BOMS, ExampleBom } from "@/lib/examples";

interface FileUploadProps {
  onBomParsed: (items: BomItem[]) => void;
}

export default function FileUpload({ onBomParsed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      await parseBom(content);
    } catch (err) {
      setError("Failed to read file");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      setError("Please enter CSV content");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await parseBom(textInput);
      setTextInput("");
    } catch (err) {
      setError("Failed to parse BOM");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const parseBom = async (csvContent: string) => {
    const response = await fetch("/api/parse-bom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvContent }),
    });

    if (!response.ok) {
      throw new Error("Parse failed");
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      onBomParsed(data.items);
    } else {
      setError("No valid BOM items found in the file");
    }
  };

  const loadExample = async (example: ExampleBom) => {
    setIsLoading(true);
    setError(null);
    try {
      await parseBom(example.csv);
    } catch (err) {
      setError("Failed to load example");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload BOM</h2>

      {/* Drag and drop area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-gray-500">
          {isLoading ? (
            <span>Processing...</span>
          ) : (
            <>
              <p className="text-lg mb-2">Drop CSV file here</p>
              <p className="text-sm">or click to select</p>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or paste CSV</span>
        </div>
      </div>

      {/* Text input */}
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Paste CSV content here...&#10;&#10;Example:&#10;Part Number,Description,Qty,Manufacturer,MPN&#10;R1,10k Resistor,10,Yageo,RC0603FR-0710KL"
        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={handleTextSubmit}
        disabled={isLoading || !textInput.trim()}
        className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Processing..." : "Parse BOM"}
      </button>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Example BOMs */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Try an example:
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {EXAMPLE_BOMS.map((example) => (
            <button
              key={example.name}
              onClick={() => loadExample(example)}
              disabled={isLoading}
              className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="font-medium text-gray-900 text-sm">
                {example.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {example.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

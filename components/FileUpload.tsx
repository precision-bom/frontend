"use client";

import { useState, useRef, DragEvent } from "react";
import { BomSuggestionResult } from "@/types/bom";
import { EXAMPLE_BOMS, ExampleBom } from "@/lib/examples";

interface FileUploadProps {
  onSuggestionsReady: (result: BomSuggestionResult) => void;
}

export default function FileUpload({ onSuggestionsReady }: FileUploadProps) {
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
      await suggestBoms(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
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
      await suggestBoms(textInput);
      setTextInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process BOM");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestBoms = async (csvContent: string) => {
    const identity = localStorage.getItem('forensic_identity');
    const signature = localStorage.getItem('forensic_signature');
    const nonce = localStorage.getItem('forensic_nonce');

    if (!identity || !signature || !nonce) {
      throw new Error("Identity required. Please connect wallet first.");
    }

    const response = await fetch("/api/suggest-boms", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-Forensic-Identity": identity,
        "X-Forensic-Signature": signature,
        "X-Forensic-Nonce": nonce
      },
      body: JSON.stringify({ csvContent }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate suggestions");
    }

    if (data.originalItems && data.originalItems.length > 0) {
      onSuggestionsReady(data);
    } else {
      setError("No valid BOM items found in the file");
    }
  };

  const loadExample = async (example: ExampleBom) => {
    setIsLoading(true);
    setError(null);
    try {
      await suggestBoms(example.csv);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load example");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-substrate-900 border border-substrate-700 rounded-lg p-6">
      <h2 className="text-lg font-mono font-semibold text-silkscreen mb-4 uppercase tracking-tighter">
        Execute Sourcing Strike
      </h2>

      {/* Drag and drop area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-trace-500 bg-trace-500/10 shadow-trace"
            : "border-substrate-600 hover:border-substrate-500 hover:bg-substrate-800/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-substrate-400">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-trace-500/30 rounded-full" />
                <div className="absolute inset-0 w-10 h-10 border-2 border-trace-500 rounded-full border-t-transparent animate-spin" />
              </div>
              <span className="font-mono text-sm text-trace-400">
                Searching distributors...
              </span>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <svg
                  className="w-10 h-10 mx-auto text-substrate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-base font-mono mb-1">Drop CSV file here</p>
              <p className="text-sm text-substrate-500">or click to select</p>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-substrate-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-substrate-900 text-substrate-500 font-mono text-xs uppercase tracking-widest">
            OR PASTE RAW DATA
          </span>
        </div>
      </div>

      {/* Text input */}
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Paste CSV content here...&#10;&#10;Example:&#10;Part Number,Description,Qty,Manufacturer,MPN&#10;R1,10k Resistor,10,Yageo,RC0603FR-0710KL"
        className="w-full h-32 px-3 py-2 bg-substrate-950 border border-substrate-700 rounded-lg text-sm font-mono text-silkscreen placeholder-substrate-600 focus:ring-2 focus:ring-trace-500 focus:border-transparent transition-all"
        disabled={isLoading}
      />
      <button
        onClick={handleTextSubmit}
        disabled={isLoading || !textInput.trim()}
        className="mt-3 w-full px-4 py-2.5 bg-trace-500 text-substrate-950 rounded-lg hover:bg-trace-400 disabled:bg-substrate-700 disabled:text-substrate-500 disabled:cursor-not-allowed transition-colors font-mono font-bold uppercase text-sm"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-substrate-950/30 rounded-full border-t-substrate-950 animate-spin" />
            Synchronizing...
          </span>
        ) : (
          "Authorize & Source BOM"
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono">
          <span className="font-bold">FORENSIC ALERT:</span> {error}
        </div>
      )}

      {/* Example BOMs */}
      <div className="mt-6 pt-6 border-t border-substrate-700">
        <h3 className="text-[10px] font-mono text-substrate-500 uppercase tracking-widest mb-3">
          Forensic Templates
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {EXAMPLE_BOMS.map((example) => (
            <button
              key={example.name}
              onClick={() => loadExample(example)}
              disabled={isLoading}
              className="text-left p-3 bg-substrate-800/50 border border-substrate-700 rounded-lg hover:border-trace-500/50 hover:bg-substrate-800 transition-all disabled:opacity-50 group"
            >
              <div className="font-mono text-sm text-silkscreen group-hover:text-trace-400 transition-colors">
                {example.name}
              </div>
              <div className="text-[10px] text-substrate-500 mt-1 uppercase">
                {example.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
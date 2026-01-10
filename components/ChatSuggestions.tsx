"use client";

import { useState } from "react";
import { BomItem, ChatMessage } from "@/types/bom";

interface ChatSuggestionsProps {
  item: BomItem;
  onUpdateItem: (item: BomItem) => void;
}

export default function ChatSuggestions({ item, onUpdateItem }: ChatSuggestionsProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: {
            partNumber: item.partNumber,
            description: item.description,
            manufacturer: item.manufacturer,
            mpn: item.mpn,
          },
          message: userMessage,
        }),
      });

      const data = await response.json();
      const assistantMessage = data.response || data.error || "No response";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get response. Please try again." },
      ]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoIdentify = async () => {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Auto-identify this part" },
    ]);

    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: {
            partNumber: item.partNumber,
            description: item.description,
            manufacturer: item.manufacturer,
            mpn: item.mpn,
          },
          action: "identify",
        }),
      });

      const data = await response.json();

      if (data.identification) {
        const { mpn, manufacturer, description } = data.identification;
        const updates: Partial<BomItem> = {};

        if (mpn && !item.mpn) updates.mpn = mpn;
        if (manufacturer && !item.manufacturer) updates.manufacturer = manufacturer;
        if (description && !item.description) updates.description = description;

        if (Object.keys(updates).length > 0) {
          onUpdateItem({ ...item, ...updates, status: "matched" });
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Identified part:\n• MPN: ${mpn || "N/A"}\n• Manufacturer: ${manufacturer || "N/A"}\n• Description: ${description || "N/A"}\n\nUpdated the BOM item with the identified information.`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Could not identify additional information for this part.",
            },
          ]);
        }
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to identify part. Please try again." },
      ]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow flex flex-col" style={{ height: "400px" }}>
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
        <button
          onClick={handleAutoIdentify}
          disabled={isLoading}
          className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 disabled:opacity-50 transition-colors"
        >
          Auto-Identify
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            Ask questions about this part, request alternatives, or click
            Auto-Identify to let AI help identify the component.
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this part..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { X, Trash2, Clock } from "lucide-react";
import { HistoryItem } from "./Calculator";

interface HistoryLogProps {
  isOpen: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onSelectItem: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function HistoryLog({
  isOpen,
  history,
  onClose,
  onSelectItem,
  onClear,
}: HistoryLogProps) {
  return (
    <div
      className={`absolute inset-0 z-20 rounded-24px transition-all duration-300 flex flex-col ${
        isOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      style={{
        background: "var(--calc-bg)",
        backdropFilter: "blur(25px)",
        WebkitBackdropFilter: "blur(25px)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-[var(--calc-border)]">
        <div className="flex items-center gap-2 text-[var(--text-main)] font-semibold">
          <Clock size={18} className="text-indigo-500" />
          <span>History Log</span>
        </div>
        <div className="flex gap-2">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="p-2 rounded-full hover:bg-[rgba(255,0,0,0.1)] text-red-500 transition-all duration-200 active:scale-90"
              title="Clear all history"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] transition-all duration-200 active:scale-90"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] gap-2 text-sm">
            <span>No calculation history yet.</span>
            <span className="text-xs opacity-75">Perform calculations to populate log.</span>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectItem(item);
                onClose();
              }}
              className="p-3.5 rounded-xl bg-[rgba(255,255,255,0.15)] dark:bg-[rgba(0,0,0,0.15)] border border-[var(--calc-border)] hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md flex flex-col gap-1.5 group"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-secondary)]">{item.timestamp}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 text-indigo-500 dark:text-indigo-400 transition-opacity font-medium">
                  Use Result
                </span>
              </div>
              <div className="text-sm font-medium text-[var(--text-secondary)] break-all text-right">
                {item.formula} =
              </div>
              <div className="text-lg font-semibold text-[var(--text-main)] text-right break-all">
                {item.result}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

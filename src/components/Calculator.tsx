"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, History, RotateCcw, Delete } from "lucide-react";
import HistoryLog from "./HistoryLog";

export interface HistoryItem {
  id: string;
  formula: string;
  result: string;
  timestamp: string;
}

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [formula, setFormula] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [shouldReset, setShouldReset] = useState(false); // Reset display on next number click

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    
    // Load history
    const savedHistory = localStorage.getItem("calc_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      
      const key = e.key;
      if (/[0-9]/.test(key)) {
        e.preventDefault();
        handleNumber(key);
      } else if (key === ".") {
        e.preventDefault();
        handleDecimal();
      } else if (key === "+") {
        e.preventDefault();
        handleOperator("+");
      } else if (key === "-") {
        e.preventDefault();
        handleOperator("-");
      } else if (key === "*") {
        e.preventDefault();
        handleOperator("×");
      } else if (key === "/") {
        e.preventDefault();
        handleOperator("÷");
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleEqual();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (key === "Escape") {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [display, formula, shouldReset, history]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleClear = () => {
    setDisplay("0");
    setFormula("");
    setShouldReset(false);
  };

  const handleBackspace = () => {
    if (shouldReset) {
      handleClear();
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const handleNumber = (num: string) => {
    if (display === "0" || shouldReset) {
      setDisplay(num);
      setShouldReset(false);
    } else {
      // Prevent excessively long numbers
      if (display.length < 16) {
        setDisplay(display + num);
      }
    }
  };

  const handleDecimal = () => {
    if (shouldReset) {
      setDisplay("0.");
      setShouldReset(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperator = (op: string) => {
    const cleanDisplay = display.endsWith(".") ? display.slice(0, -1) : display;
    
    if (formula && !shouldReset) {
      // Calculate intermediate result
      try {
        const expression = (formula + cleanDisplay).replace(/×/g, "*").replace(/÷/g, "/");
        const evaluated = eval(expression);
        const formattedResult = Number(evaluated.toFixed(8)).toString();
        setFormula(formattedResult + " " + op + " ");
        setDisplay(formattedResult);
      } catch {
        setFormula(cleanDisplay + " " + op + " ");
      }
    } else {
      setFormula(cleanDisplay + " " + op + " ");
    }
    setShouldReset(true);
  };

  const handleToggleSign = () => {
    if (display !== "0") {
      if (display.startsWith("-")) {
        setDisplay(display.slice(1));
      } else {
        setDisplay("-" + display);
      }
    }
  };

  const handleEqual = () => {
    if (!formula || shouldReset) return;
    
    const cleanDisplay = display.endsWith(".") ? display.slice(0, -1) : display;
    const fullFormulaText = formula + cleanDisplay;
    const expression = fullFormulaText.replace(/×/g, "*").replace(/÷/g, "/");
    
    try {
      const evaluated = eval(expression);
      // Format to avoid floating point issues like 0.1 + 0.2
      const formattedResult = Number(evaluated.toFixed(8)).toString();
      
      // Update history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        formula: fullFormulaText,
        result: formattedResult,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      const updatedHistory = [newItem, ...history].slice(0, 50); // limit to 50 items
      setHistory(updatedHistory);
      localStorage.setItem("calc_history", JSON.stringify(updatedHistory));
      
      setDisplay(formattedResult);
      setFormula("");
      setShouldReset(true);
    } catch {
      setDisplay("Error");
      setFormula("");
      setShouldReset(true);
    }
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setDisplay(item.result);
    setFormula("");
    setShouldReset(true);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("calc_history");
  };

  return (
    <div className="relative w-full max-w-md glass-panel p-6 overflow-hidden flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex justify-between items-center z-10">
        <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent dark:from-indigo-300 dark:to-purple-300">
          AuraCalc
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2.5 rounded-full bg-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.25)] transition-all duration-300 active:scale-90 text-[var(--text-main)]"
            title="Calculation History"
          >
            <History size={18} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.25)] transition-all duration-300 active:scale-90 text-[var(--text-main)]"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>

      {/* Calculator Display Screen */}
      <div className="glass-display p-6 flex flex-col justify-end items-end gap-2 h-32 overflow-hidden z-10">
        <span className="text-sm font-medium tracking-wide text-[var(--text-secondary)] min-h-[20px] select-none break-all">
          {formula}
        </span>
        <span className="text-4xl font-semibold text-[var(--text-main)] overflow-x-auto whitespace-nowrap scrollbar-none w-full text-right select-all">
          {display}
        </span>
      </div>

      {/* Calculator Buttons Grid */}
      <div className="grid grid-cols-4 gap-3.5 z-10">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="h-14 rounded-2xl flex items-center justify-center font-semibold text-lg transition-all duration-300 active:scale-95 bg-[var(--btn-fn-bg)] hover:bg-[var(--btn-fn-hover)] text-[var(--btn-fn-text)]"
        >
          AC
        </button>
        <button
          onClick={handleBackspace}
          className="h-14 rounded-2xl flex items-center justify-center font-semibold text-lg transition-all duration-300 active:scale-95 bg-[var(--btn-fn-bg)] hover:bg-[var(--btn-fn-hover)] text-[var(--btn-fn-text)]"
        >
          <Delete size={20} />
        </button>
        <button
          onClick={handleToggleSign}
          className="h-14 rounded-2xl flex items-center justify-center font-semibold text-lg transition-all duration-300 active:scale-95 bg-[var(--btn-fn-bg)] hover:bg-[var(--btn-fn-hover)] text-[var(--btn-fn-text)]"
        >
          ±
        </button>
        <button
          onClick={() => handleOperator("÷")}
          className="h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-300 active:scale-95 bg-[var(--btn-op-bg)] hover:bg-[var(--btn-op-hover)] text-[var(--btn-op-text)]"
        >
          ÷
        </button>

        {/* Row 2 */}
        {["7", "8", "9"].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className="h-14 rounded-2xl flex items-center justify-center font-medium text-lg transition-all duration-300 active:scale-95 bg-[var(--btn-num-bg)] hover:bg-[var(--btn-num-hover)] text-[var(--btn-num-text)]"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperator("×")}
          className="h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-300 active:scale-95 bg-[var(--btn-op-bg)] hover:bg-[var(--btn-op-hover)] text-[var(--btn-op-text)]"
        >
          ×
        </button>

        {/* Row 3 */}
        {["4", "5", "6"].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className="h-14 rounded-2xl flex items-center justify-center font-medium text-lg transition-all duration-300 active:scale-95 bg-[var(--btn-num-bg)] hover:bg-[var(--btn-num-hover)] text-[var(--btn-num-text)]"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperator("-")}
          className="h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-300 active:scale-95 bg-[var(--btn-op-bg)] hover:bg-[var(--btn-op-hover)] text-[var(--btn-op-text)]"
        >
          -
        </button>

        {/* Row 4 */}
        {["1", "2", "3"].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className="h-14 rounded-2xl flex items-center justify-center font-medium text-lg transition-all duration-300 active:scale-95 bg-[var(--btn-num-bg)] hover:bg-[var(--btn-num-hover)] text-[var(--btn-num-text)]"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperator("+")}
          className="h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-300 active:scale-95 bg-[var(--btn-op-bg)] hover:bg-[var(--btn-op-hover)] text-[var(--btn-op-text)]"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={handleDecimal}
          className="h-14 rounded-2xl flex items-center justify-center font-medium text-lg transition-all duration-300 active:scale-95 bg-[var(--btn-num-bg)] hover:bg-[var(--btn-num-hover)] text-[var(--btn-num-text)]"
        >
          .
        </button>
        <button
          onClick={() => handleNumber("0")}
          className="col-span-2 h-14 rounded-2xl flex items-center justify-center font-medium text-lg transition-all duration-300 active:scale-95 bg-[var(--btn-num-bg)] hover:bg-[var(--btn-num-hover)] text-[var(--btn-num-text)]"
        >
          0
        </button>
        <button
          onClick={handleEqual}
          className="h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-300 active:scale-95 bg-[var(--btn-eq-bg)] hover:bg-[var(--btn-eq-hover)] text-[var(--btn-eq-text)] shadow-lg shadow-indigo-500/25"
        >
          =
        </button>
      </div>

      {/* History Slide Panel */}
      <HistoryLog
        isOpen={showHistory}
        history={history}
        onClose={() => setShowHistory(false)}
        onSelectItem={selectHistoryItem}
        onClear={clearHistory}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Search, Sparkles, X, Clock, Trash2, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchDomain, SearchHistoryItem } from "../types";

interface SearchBarProps {
  query: string;
  domain: SearchDomain;
  activeView: "results" | "knowledge_graph";
  autocompleteSuggestions: string[];
  history: SearchHistoryItem[];
  isSearching: boolean;
  onQueryChange: (q: string) => void;
  onDomainChange: (domain: SearchDomain) => void;
  onExecuteSearch: (queryToSearch?: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
  onActiveViewChange: (view: "results" | "knowledge_graph") => void;
}

const DOMAIN_TABS: { id: SearchDomain; label: string }[] = [
  { id: "all", label: "Tất Cả" },
  { id: "vocabulary", label: "Từ Vựng" },
  { id: "grammar", label: "Ngữ Pháp" },
  { id: "documents", label: "Tài Liệu" },
  { id: "flashcards", label: "Flashcards" },
  { id: "conversation", label: "Hội Thoại" },
  { id: "quizzes", label: "Bài Quiz" },
  { id: "collections", label: "Bộ Thẻ" },
  { id: "knowledge_graph", label: "Sơ Đồ Tri Thức" },
  { id: "recommendation", label: "Gợi Ý AI" },
];

export function SearchBar({
  query,
  domain,
  activeView,
  autocompleteSuggestions,
  history,
  isSearching,
  onQueryChange,
  onDomainChange,
  onExecuteSearch,
  onClearHistory,
  onActiveViewChange,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onExecuteSearch(query);
    }
  };

  const handleSelectSuggestion = (s: string) => {
    onQueryChange(s);
    onExecuteSearch(s);
    setIsFocused(false);
  };

  return (
    <div className="space-y-4">
      {/* View Toggle Bar (Results vs Knowledge Graph) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface/80 p-1 backdrop-blur-md">
          <button
            onClick={() => onActiveViewChange("results")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeView === "results"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-3.5" /> Kết Quả Tìm Kiếm AI
          </button>

          <button
            onClick={() => onActiveViewChange("knowledge_graph")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeView === "knowledge_graph"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Network className="size-3.5" /> Sơ Đồ Tri Thức (Knowledge Graph)
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
          Bấm <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">Ctrl + K</kbd> để tìm kiếm từ bất kỳ trang nào
        </span>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center rounded-2xl border border-border/80 bg-surface/90 shadow-lg backdrop-blur-md focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20">
          <Search className="absolute left-4 size-5 text-emerald-600 dark:text-emerald-400" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Tìm kiếm thông minh ngữ nghĩa (Serendipity, ngữ pháp, bài đọc, quiz...)"
            className="h-14 border-none bg-transparent pl-12 pr-28 text-sm sm:text-base outline-none focus-visible:ring-0"
          />

          <div className="absolute right-3 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-4" />
              </button>
            )}
            <Button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm h-9 px-4 text-xs"
            >
              {isSearching ? "Đang Tìm..." : "Tìm Kiếm AI"}
            </Button>
          </div>
        </div>

        {/* Autocomplete Popup */}
        {isFocused && autocompleteSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-surface-raised p-2 shadow-2xl animate-in fade-in">
            {autocompleteSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => handleSelectSuggestion(s)}
                className="w-full text-left rounded-lg px-3 py-2 text-xs font-semibold hover:bg-emerald-500/10 hover:text-emerald-600 flex items-center gap-2"
              >
                <Sparkles className="size-3.5 text-amber-500" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Domain Filters Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {DOMAIN_TABS.map((tab) => {
          const isActive = domain === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onDomainChange(tab.id)}
              className={`rounded-full border px-3.5 py-1.5 font-semibold transition-all shrink-0 ${
                isActive
                  ? "border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "border-border/80 bg-surface/60 text-muted-foreground hover:border-emerald-500/40 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* History Chips */}
      {history.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground font-medium">
            <Clock className="size-3.5" /> Lịch sử:
          </span>

          {history.slice(0, 6).map((h) => (
            <button
              key={h.id}
              onClick={() => handleSelectSuggestion(h.query)}
              className="rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-muted-foreground hover:border-emerald-500 hover:text-foreground"
            >
              {h.query}
            </button>
          ))}

          <button
            onClick={onClearHistory}
            className="text-destructive hover:underline text-[11px] ml-1 flex items-center gap-1"
          >
            <Trash2 className="size-3" /> Xóa
          </button>
        </div>
      )}
    </div>
  );
}

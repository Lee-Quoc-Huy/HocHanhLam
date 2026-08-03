"use client";

import { Search, X, Star, LayoutGrid, Table, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VocabularyFilter, VocabularyLanguage, DifficultyLevel } from "../types";
import { ViewMode } from "../store/vocabulary-store";

interface VocabularyFiltersProps {
  filter: VocabularyFilter;
  availableCollections: string[];
  viewMode: ViewMode;
  onFilterChange: (updates: Partial<VocabularyFilter>) => void;
  onResetFilter: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export function VocabularyFilters({
  filter,
  availableCollections,
  viewMode,
  onFilterChange,
  onResetFilter,
  onViewModeChange,
}: VocabularyFiltersProps) {
  const isFiltered =
    filter.search !== "" ||
    filter.language !== "all" ||
    filter.collection !== "all" ||
    filter.difficulty !== "all" ||
    filter.part_of_speech !== "all" ||
    filter.onlyFavorites;

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-surface/80 p-4 shadow-xs backdrop-blur-xs">
      {/* Top Filter Bar: Search + View Mode Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Tìm từ, nghĩa tiếng Việt, IPA, ví dụ, bộ sưu tập…"
            className="pl-9 pr-9 bg-background/80"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* View Mode Switches */}
        <div className="flex items-center gap-2">
          <Button
            variant={filter.onlyFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ onlyFavorites: !filter.onlyFavorites })}
            className="gap-1.5"
          >
            <Star
              className={`size-4 ${
                filter.onlyFavorites ? "fill-amber-400 text-amber-400" : "text-amber-500"
              }`}
            />
            <span>Yêu thích</span>
          </Button>

          <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => onViewModeChange("grid")}
              title="Xem dạng lưới"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => onViewModeChange("table")}
              title="Xem dạng bảng"
            >
              <Table className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ngôn ngữ:
          </span>

          {(
            [
              { id: "all", label: "Tất cả ngôn ngữ", emoji: "🌐" },
              { id: "en", label: "Tiếng Anh", emoji: "🇬🇧" },
              { id: "ko", label: "Tiếng Hàn", emoji: "🇰🇷" },
              { id: "zh", label: "Tiếng Trung", emoji: "🇨🇳" },
            ] as const
          ).map((lang) => {
            const isActive = filter.language === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() =>
                  onFilterChange({
                    language: lang.id as VocabularyLanguage | "all",
                  })
                }
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{lang.emoji}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Collection Filter */}
          <select
            value={filter.collection}
            onChange={(e) => onFilterChange({ collection: e.target.value })}
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả bộ sưu tập</option>
            {availableCollections.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={filter.difficulty}
            onChange={(e) =>
              onFilterChange({
                difficulty: e.target.value as DifficultyLevel | "all",
              })
            }
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả cấp độ</option>
            <option value="beginner">Sơ cấp (A1-A2)</option>
            <option value="intermediate">Trung cấp (B1-B2)</option>
            <option value="advanced">Nâng cao (C1-C2)</option>
            <option value="master">Bậc thầy</option>
          </select>

          {/* Part of Speech Filter */}
          <select
            value={filter.part_of_speech}
            onChange={(e) => onFilterChange({ part_of_speech: e.target.value })}
            className="h-8 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả từ loại</option>
            <option value="noun">Noun (Danh từ)</option>
            <option value="verb">Verb (Động từ)</option>
            <option value="adjective">Adjective (Tính từ)</option>
            <option value="adverb">Adverb (Phó từ)</option>
            <option value="phrase">Phrase (Cụm từ)</option>
            <option value="idiom">Idiom (Thành ngữ)</option>
          </select>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilter}
              className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="size-3" /> Đặt lại
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

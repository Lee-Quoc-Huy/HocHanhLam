"use client";

import { Search, Star, RotateCcw, LayoutGrid, Table } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GrammarFilter } from "../types";

export type ViewMode = "grid" | "table";

interface GrammarFiltersProps {
  filter: GrammarFilter;
  availableCategories?: string[];
  viewMode?: ViewMode;
  onFilterChange: (updates: Partial<GrammarFilter>) => void;
  onResetFilter: () => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

export function GrammarFilters({
  filter,
  availableCategories = [],
  viewMode = "grid",
  onFilterChange,
  onResetFilter,
  onViewModeChange,
}: GrammarFiltersProps) {
  const isFiltered =
    filter.search.trim() !== "" ||
    filter.language !== "all" ||
    filter.difficulty !== "all" ||
    filter.category !== "all" ||
    filter.onlyFavorites;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-xl border border-border/80 bg-surface/80 p-4 shadow-xs backdrop-blur-md">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filter.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Tìm kiếm mẫu ngữ pháp, ý nghĩa, giải thích, ví dụ..."
          className="pl-9 bg-background/80 text-xs sm:text-sm"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Language Filter */}
        <select
          value={filter.language}
          onChange={(e) => onFilterChange({ language: e.target.value as any })}
          className="h-9 rounded-md border border-border bg-background px-3 font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Tất Cả Ngôn Ngữ</option>
          <option value="en">🇬🇧 Tiếng Anh</option>
          <option value="ko">🇰🇷 Tiếng Hàn</option>
          <option value="zh">🇨🇳 Tiếng Trung</option>
        </select>

        {/* Category Filter */}
        {availableCategories.length > 0 && (
          <select
            value={filter.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="h-9 rounded-md border border-border bg-background px-3 font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất Cả Phân Loại</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}

        {/* Difficulty Filter */}
        <select
          value={filter.difficulty}
          onChange={(e) => onFilterChange({ difficulty: e.target.value as any })}
          className="h-9 rounded-md border border-border bg-background px-3 font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Tất Cả Trình Độ</option>
          <option value="beginner">Sơ Cấp (Beginner)</option>
          <option value="intermediate">Trung Cấp (Intermediate)</option>
          <option value="advanced">Cao Cấp (Advanced)</option>
          <option value="master">Thành Thạo (Master)</option>
        </select>

        {/* Favorite Toggle */}
        <Button
          variant={filter.onlyFavorites ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange({ onlyFavorites: !filter.onlyFavorites })}
          className="h-9 gap-1.5"
        >
          <Star
            className={`size-3.5 ${
              filter.onlyFavorites ? "fill-amber-400 text-amber-400" : "text-amber-500"
            }`}
          />
          <span>Yêu Thích</span>
        </Button>

        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div className="hidden lg:flex items-center rounded-lg border border-border bg-background p-0.5">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Dạng Thẻ Grid"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "table" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Dạng Bảng Table"
            >
              <Table className="size-4" />
            </button>
          </div>
        )}

        {/* Reset Filter Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilter}
            className="h-9 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span>Đặt Lại</span>
          </Button>
        )}
      </div>
    </div>
  );
}

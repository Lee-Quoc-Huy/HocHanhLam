"use client";

import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VocabularyItem } from "../types";
import { VocabularyCard } from "./vocabulary-card";

interface VocabularyGridProps {
  items: VocabularyItem[];
  isLoading: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (item: VocabularyItem) => void;
  onOpenEdit: (item: VocabularyItem) => void;
  onOpenDelete: (item: VocabularyItem) => void;
  onOpenCreate: () => void;
}

export function VocabularyGrid({
  items,
  isLoading,
  onToggleFavorite,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete,
  onOpenCreate,
}: VocabularyGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-border bg-muted/40 p-5"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/40 p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
          <BookOpen className="size-7" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Không tìm thấy từ vựng nào
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Thử điều chỉnh bộ lọc tìm kiếm, tab ngôn ngữ, hoặc thêm một từ mới vào kho từ vựng của bạn.
        </p>
        <Button onClick={onOpenCreate} className="mt-4 gap-2">
          <Plus className="size-4" /> Thêm Từ Đầu Tiên
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <VocabularyCard
          key={item.id}
          item={item}
          onToggleFavorite={onToggleFavorite}
          onOpenDetail={onOpenDetail}
          onOpenEdit={onOpenEdit}
          onOpenDelete={onOpenDelete}
        />
      ))}
    </div>
  );
}

"use client";

import { BookMarked, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrammarItem } from "../types";
import { GrammarCard } from "./grammar-card";

interface GrammarGridProps {
  items: GrammarItem[];
  isLoading: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (item: GrammarItem) => void;
  onOpenEdit: (item: GrammarItem) => void;
  onOpenDelete: (item: GrammarItem) => void;
  onOpenAiModal: (item: GrammarItem) => void;
  onOpenCreate: () => void;
}

export function GrammarGrid({
  items,
  isLoading,
  onToggleFavorite,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete,
  onOpenAiModal,
  onOpenCreate,
}: GrammarGridProps) {
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
        <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3">
          <BookMarked className="size-7" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          No grammar structures found
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Try adjusting your search query, language tabs, or add a new grammar point to your collection.
        </p>
        <Button onClick={onOpenCreate} className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="size-4" /> Add Grammar Point
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <GrammarCard
          key={item.id}
          item={item}
          onToggleFavorite={onToggleFavorite}
          onOpenDetail={onOpenDetail}
          onOpenEdit={onOpenEdit}
          onOpenDelete={onOpenDelete}
          onOpenAiModal={onOpenAiModal}
        />
      ))}
    </div>
  );
}

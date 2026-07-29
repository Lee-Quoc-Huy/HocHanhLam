"use client";

import { BookOpenText, Plus, Layers, Star, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VocabularyStats } from "../types";

interface VocabularyHeaderProps {
  stats: VocabularyStats;
  onOpenCreateModal: () => void;
  onOpenFlashcards: () => void;
}

export function VocabularyHeader({
  stats,
  onOpenCreateModal,
  onOpenFlashcards,
}: VocabularyHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20">
            <BookOpenText className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Kho Từ Vựng Đa Ngôn Ngữ
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Tiếng Anh · Tiếng Hàn · Tiếng Trung · Tích hợp Phát âm & Thẻ ghi nhớ SRS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={onOpenFlashcards}
            className="gap-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <Sparkles className="size-4" />
            <span>Ôn Tập Flashcard</span>
          </Button>

          <Button
            onClick={onOpenCreateModal}
            size="default"
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 font-medium shadow-md transition-all hover:opacity-95 text-white"
          >
            <Plus className="size-4" />
            <span>Thêm Từ Mới</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
            <Layers className="size-3.5" /> Tổng Số Từ
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-blue-700 dark:text-blue-300">
            {stats.total}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" /> Tiếng Anh
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {stats.enCount}
          </div>
        </div>

        <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-pink-600 dark:text-pink-400">
            <Sparkles className="size-3.5" /> Tiếng Hàn
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-pink-700 dark:text-pink-300">
            {stats.koCount}
          </div>
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400">
            <Star className="size-3.5" /> Tiếng Trung & Yêu Thích
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-rose-700 dark:text-rose-300">
            {stats.zhCount}
          </div>
        </div>
      </div>
    </div>
  );
}

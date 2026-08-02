"use client";

import { BookMarked, Plus, Layers, CheckCircle2, Star, Sparkles, ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrammarStats } from "../types";

interface GrammarHeaderProps {
  stats: GrammarStats;
  onOpenCreateModal: () => void;
  onOpenImageExtract: () => void;
}

export function GrammarHeader({ stats, onOpenCreateModal, onOpenImageExtract }: GrammarHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-transparent text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/20">
            <BookMarked className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Kho Cấu Trúc Ngữ Pháp
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Tiếng Anh · Tiếng Hàn · Tiếng Trung · Tích hợp Trợ lý AI Phân Tích Chuyên Sâu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={onOpenImageExtract}
            className="gap-2 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
          >
            <ImageUp className="size-4" />
            <span>Đọc Từ Ảnh (AI)</span>
          </Button>

          <Button
            onClick={onOpenCreateModal}
            size="default"
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 font-medium shadow-md transition-all hover:opacity-95 text-white"
          >
            <Plus className="size-4" />
            <span>Thêm Ngữ Pháp Mới</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <Layers className="size-3.5" /> Tổng Cấu Trúc
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-indigo-700 dark:text-indigo-300">
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

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="size-3.5" /> Tiếng Hàn
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-700 dark:text-amber-300">
            {stats.koCount}
          </div>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400">
            <Star className="size-3.5" /> Tiếng Trung & Yêu Thích
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-purple-700 dark:text-purple-300">
            {stats.favoritesCount}
          </div>
        </div>
      </div>
    </div>
  );
}

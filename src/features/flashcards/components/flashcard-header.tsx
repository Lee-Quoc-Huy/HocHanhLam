"use client";

import { Layers, Plus, Sparkles, CheckCircle2, Clock, BookOpen, FolderPlus, Wand2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardStats } from "../types";
import { ActiveTab } from "../store/flashcard-store";

interface FlashcardHeaderProps {
  stats: FlashcardStats;
  activeTab: ActiveTab;
  onSetActiveTab: (tab: ActiveTab) => void;
  onOpenCreateCard: () => void;
  onOpenCreateDeck: () => void;
  onOpenCreateFolder: () => void;
  onOpenAutoGenerate: () => void;
}

export function FlashcardHeader({
  stats,
  activeTab,
  onSetActiveTab,
  onOpenCreateCard,
  onOpenCreateDeck,
  onOpenCreateFolder,
  onOpenAutoGenerate,
}: FlashcardHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20">
            <Layers className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Hệ Thống Thẻ Ghi Nhớ & Quiz VIP
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Thuật toán lặp lại ngắt quãng SM-2 · Trắc Nghiệm Quiz Thông Minh · Tiếng Anh · Hàn · Trung
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateFolder}
            className="gap-1.5 text-xs"
          >
            <FolderPlus className="size-3.5 text-amber-500" /> + Thư Mục
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateDeck}
            className="gap-1.5 text-xs"
          >
            <BookOpen className="size-3.5 text-blue-500" /> + Bộ Thẻ
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAutoGenerate}
            className="gap-1.5 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <Wand2 className="size-3.5" /> Tạo Tự Động
          </Button>

          <Button
            onClick={onOpenCreateCard}
            size="default"
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 font-medium shadow-md transition-all hover:opacity-95 text-white"
          >
            <Plus className="size-4" />
            <span>Thêm Thẻ Mới</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 backdrop-blur-xs transition-all hover:border-rose-500/40">
          <div className="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400">
            <Clock className="size-3.5" /> Cần Ôn Hôm Nay
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-rose-700 dark:text-rose-300">
            {stats.dueToday}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 backdrop-blur-xs transition-all hover:border-emerald-500/40">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" /> Đã Thuộc
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {stats.mastered}
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 backdrop-blur-xs transition-all hover:border-amber-500/40">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="size-3.5 text-amber-500" /> Đang Học
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-700 dark:text-amber-300">
            {stats.learning}
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 backdrop-blur-xs transition-all hover:border-blue-500/40">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
            <Layers className="size-3.5 text-blue-500" /> Tổng Số Thẻ
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-blue-700 dark:text-blue-300">
            {stats.totalCards}
          </div>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 backdrop-blur-xs transition-all hover:border-purple-500/40">
          <div className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400">
            <BookOpen className="size-3.5 text-purple-500" /> Bộ Thẻ
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-purple-700 dark:text-purple-300">
            {stats.totalDecks}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-1">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "review", label: `Lật Thẻ SRS (${stats.dueToday})`, icon: Clock },
              { id: "quiz", label: "Quiz Trắc Nghiệm VIP", icon: HelpCircle },
              { id: "browse", label: "Tất Cả Thẻ", icon: Layers },
              { id: "decks", label: "Bộ Thẻ & Thư Mục", icon: BookOpen },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSetActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 border-b-2 px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

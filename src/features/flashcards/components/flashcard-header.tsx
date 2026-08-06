"use client";

import {
  Layers,
  Clock,
  HelpCircle,
  PenTool,
  Zap,
  Puzzle,
  Headphones,
} from "lucide-react";
import { FlashcardStats } from "../types";
import { ActiveTab } from "../store/flashcard-store";

interface FlashcardHeaderProps {
  stats: FlashcardStats;
  activeTab: ActiveTab;
  onSetActiveTab: (tab: ActiveTab) => void;
  onOpenAiGameAgent: () => void;
}

export function FlashcardHeader({
  stats,
  activeTab,
  onSetActiveTab,
  onOpenAiGameAgent,
}: FlashcardHeaderProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20">
            <Layers className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Trung Tâm Ôn Tập & Trò Chơi
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Bộ thẻ ôn tập riêng biệt cho từng trò chơi · Tích hợp AI Thông Minh
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation: 6 DISTINCT GAME MODES */}
      <div className="relative border-b border-border/80 pb-1">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 scroll-smooth">
          {(
            [
              { id: "review", label: `Lật Thẻ SRS`, icon: Clock },
              { id: "quiz", label: "Quiz", icon: HelpCircle },
              { id: "spelling", label: "Chính Tả", icon: PenTool },
              { id: "reflex", label: "Phản Xạ Tốc Độ", icon: Zap },
              { id: "blank", label: "Điền Từ", icon: Puzzle },
              { id: "listening", label: "Luyện Nghe AI", icon: Headphones },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSetActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs sm:text-sm font-bold transition-all rounded-t-xl shrink-0 whitespace-nowrap active:scale-95 ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="size-3.5 sm:size-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

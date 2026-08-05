"use client";

import {
  Layers,
  Clock,
  HelpCircle,
  PenTool,
  Zap,
  Puzzle,
  Headphones,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20">
            <Layers className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Trung Tâm Ôn Tập & Trò Chơi VIP
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Mỗi trò chơi được lưu trữ bộ thẻ riêng biệt · AI Agent Tạo Game Thông Minh
            </p>
          </div>
        </div>

        {/* Action Buttons: ONLY AI AGENT GAME CREATOR (Req 1) */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={onOpenAiGameAgent}
            className="gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 font-bold shadow-md transition-all hover:opacity-95 text-white py-5 rounded-2xl"
          >
            <Bot className="size-5 animate-pulse" />
            <span>🤖 AI Agent Tạo Game</span>
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation: ONLY 6 DISTINCT GAME MODES (Req 2) */}
      <div className="flex items-center justify-between border-b border-border pb-1 overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5 min-w-max pb-1">
          {(
            [
              { id: "review", label: `Lật Thẻ SRS`, icon: Clock },
              { id: "quiz", label: "Quiz VIP", icon: HelpCircle },
              { id: "spelling", label: "Chính Tả / Viết", icon: PenTool },
              { id: "reflex", label: "Tốc Độ Phản Xạ", icon: Zap },
              { id: "blank", label: "Điền Từ Còn Thiếu", icon: Puzzle },
              { id: "listening", label: "Luyện Nghe AI", icon: Headphones },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSetActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold transition-all rounded-t-xl ${
                  isActive
                    ? "border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
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

"use client";

import { Trophy, Flame, Zap, Gamepad2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserGamification } from "../types";

interface LearningHeaderProps {
  gamification: UserGamification;
  onOpenLeaderboard: () => void;
}

export function LearningHeader({ gamification, onOpenLeaderboard }: LearningHeaderProps) {
  const nextLevelXp = gamification.level * 250;
  const currentLevelXp = (gamification.level - 1) * 250;
  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      ((gamification.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    )
  );

  return (
    <div className="space-y-6">
      {/* Title & Leaderboard Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent text-amber-600 dark:text-amber-400 shadow-sm border border-amber-500/20">
            <Gamepad2 className="size-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Trung Tâm Luyện Tập & Trò Chơi AI
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Luyện tập 8 chế độ game tương tác · Tích lũy điểm XP · Đua top Bảng Xếp Hạng 🏆
            </p>
          </div>
        </div>

        <Button
          onClick={onOpenLeaderboard}
          className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold shadow-md h-10 px-5 text-xs rounded-xl"
        >
          <Trophy className="size-4" /> Bảng Xếp Hạng Top
        </Button>
      </div>

      {/* Gamification Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Level Card */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Award className="size-4" /> Cấp Độ (Level)
            </span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
              Lv. {gamification.level}
            </span>
          </div>
          <div className="w-full bg-amber-500/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Total XP Card */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 backdrop-blur-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
            <Zap className="size-4" /> Tổng Điểm XP
          </div>
          <div className="font-display text-2xl font-bold text-purple-700 dark:text-purple-300">
            {gamification.totalXp} XP
          </div>
        </div>

        {/* Streak Days Card */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 backdrop-blur-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            <Flame className="size-4" /> Chuỗi Ngày Học 🔥
          </div>
          <div className="font-display text-2xl font-bold text-rose-700 dark:text-rose-300">
            {gamification.streakDays} Ngày
          </div>
        </div>

        {/* Games Played Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Gamepad2 className="size-4" /> Số Trận Đã Đấu
          </div>
          <div className="font-display text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {gamification.gamesPlayed} Trận
          </div>
        </div>
      </div>
    </div>
  );
}

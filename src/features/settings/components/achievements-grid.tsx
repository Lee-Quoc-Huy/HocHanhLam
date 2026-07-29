"use client";

import { Trophy, Flame, BookOpen, Bot, Award, CheckCircle2, Lock } from "lucide-react";
import { AchievementItem } from "../types";

interface AchievementsGridProps {
  achievements: AchievementItem[];
}

const ICON_MAP: Record<string, any> = {
  footprints: Trophy,
  flame: Flame,
  "book-open": BookOpen,
  bot: Bot,
  award: Award,
  trophy: Trophy,
};

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Trophy className="size-4 text-amber-500" />
          <span>Huy Chương & Danh Hiệu Thành Tích</span>
        </h3>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          Đã mở khóa: {unlockedCount} / {achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((item) => {
          const Icon = ICON_MAP[item.icon] || Trophy;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 shadow-xs backdrop-blur-md transition-all ${
                item.isUnlocked
                  ? "border-amber-500/40 bg-amber-500/5 shadow-md"
                  : "border-border/60 bg-surface/40 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl border ${
                    item.isUnlocked
                      ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  <Icon className="size-6" />
                </div>

                {item.isUnlocked ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" /> Đã Mở Khóa
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                    <Lock className="size-3.5" /> Chế Độ Khóa
                  </span>
                )}
              </div>

              <h4 className="mt-3.5 font-display text-base font-bold text-foreground">
                {item.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              {item.isUnlocked && item.unlocked_at && (
                <p className="mt-3 text-[10px] font-mono text-muted-foreground border-t border-border/40 pt-2">
                  Ngày mở khóa: {new Date(item.unlocked_at).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { Target, CheckCircle2, Zap, Calendar } from "lucide-react";
import { ChallengeItem } from "../types";

interface ChallengeBannerProps {
  challenges: ChallengeItem[];
}

export function ChallengeBanner({ challenges }: ChallengeBannerProps) {
  if (challenges.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Target className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Nhiệm Vụ Thử Thách Hàng Ngày & Tuần</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {challenges.map((c) => {
          const progressPercent = Math.min(100, Math.round((c.currentCount / c.targetCount) * 100));

          return (
            <div
              key={c.id}
              className={`rounded-2xl border p-4 shadow-xs backdrop-blur-md transition-all ${
                c.isCompleted
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-border/80 bg-surface/80 hover:border-emerald-500/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Calendar className="size-3" />
                  <span>{c.challengeType === "daily" ? "Hàng Ngày" : "Thách Thức Tuần"}</span>
                </span>

                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Zap className="size-3 text-amber-500" />
                  <span>+{c.rewardXp} XP</span>
                </span>
              </div>

              <h4 className="mt-2.5 font-display text-sm font-bold text-foreground line-clamp-1">
                {c.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.description}</p>

              {/* Progress Bar */}
              <div className="mt-3.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>Tiến độ: {c.currentCount} / {c.targetCount}</span>
                  {c.isCompleted && (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="size-3.5" /> Hoàn thành
                    </span>
                  )}
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

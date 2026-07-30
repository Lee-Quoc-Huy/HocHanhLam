"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Trophy, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeaderboardEntry } from "../types";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
}

export function LeaderboardModal({ isOpen, onClose, leaderboard }: LeaderboardModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Trophy className="size-5" />
              </div>
              <div>
                <Dialog.Title className="font-display text-lg font-bold text-foreground">
                  Bảng Xếp Hạng Top Học Viên 🏆
                </Dialog.Title>
                <p className="text-xs text-muted-foreground">Xếp hạng theo tổng điểm XP & chuỗi ngày học</p>
              </div>
            </div>

            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Leaderboard List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
            {leaderboard.map((item) => {
              let rankStyle = "border-border bg-background";
              let badgeColor = "bg-muted text-muted-foreground";

              if (item.rank === 1) {
                rankStyle = "border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 shadow-xs";
                badgeColor = "bg-amber-500 text-white font-bold";
              } else if (item.rank === 2) {
                rankStyle = "border-slate-400/40 bg-slate-500/5";
                badgeColor = "bg-slate-400 text-white font-bold";
              } else if (item.rank === 3) {
                rankStyle = "border-amber-700/40 bg-amber-700/5";
                badgeColor = "bg-amber-700 text-white font-bold";
              }

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border ${rankStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${badgeColor}`}>
                      #{item.rank}
                    </span>

                    <div>
                      <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.rank <= 3 && <Trophy className="size-3.5 text-amber-500" />}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                        <span className="flex items-center gap-0.5 text-rose-500">
                          <Flame className="size-3" /> {item.streakDays} ngày
                        </span>
                        <span>· Lv. {item.level}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-display text-sm font-bold text-purple-600 dark:text-purple-400">
                    {item.totalXp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

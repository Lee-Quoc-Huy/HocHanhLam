"use client";

import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import type { LearningStats } from "../types";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader({ userName, stats }: { userName: string; stats: LearningStats }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {getGreeting()}, {userName} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s your learning snapshot for today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="glass-panel flex items-center gap-2 px-4 py-2.5">
          <Flame className="h-4 w-4 text-warning" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">{stats.currentStreak} days</p>
            <p className="text-[11px] text-muted-foreground">Current streak</p>
          </div>
        </div>
        <div className="glass-panel flex items-center gap-2 px-4 py-2.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">{stats.accuracyPct}%</p>
            <p className="text-[11px] text-muted-foreground">Review accuracy</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

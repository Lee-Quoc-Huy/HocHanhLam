"use client";

import { motion } from "framer-motion";
import { BookMarked, Clock3, Flame, Target } from "lucide-react";
import type { LearningStats } from "../types";
import { Section, SectionHeading } from "./dashboard-shared";

function StatTile({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border/60 bg-surface-raised/60 p-4"
    >
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 font-display text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}

export function LearningStatsSection({ stats }: { stats: LearningStats }) {
  const maxMinutes = Math.max(...stats.weeklyMinutes.map((d) => d.minutes), 1);

  return (
    <Section delay={0.22}>
      <SectionHeading title="Learning Statistics" subtitle="This week at a glance" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Flame} label="Current streak" value={`${stats.currentStreak}d`} delay={0.05} />
        <StatTile icon={Target} label="Best streak" value={`${stats.bestStreak}d`} delay={0.1} />
        <StatTile icon={BookMarked} label="Total words" value={stats.totalWords.toLocaleString()} delay={0.15} />
        <StatTile icon={Clock3} label="Minutes this week" value={`${stats.totalMinutesThisWeek}`} delay={0.2} />
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-medium text-muted-foreground">Minutes studied per day</p>
        <div className="flex h-32 items-end justify-between gap-2">
          {stats.weeklyMinutes.map((d, i) => {
            const heightPct = Math.max(4, Math.round((d.minutes / maxMinutes) * 100));
            return (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end overflow-hidden rounded-md bg-muted">
                  <motion.div
                    className="w-full rounded-md bg-primary"
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

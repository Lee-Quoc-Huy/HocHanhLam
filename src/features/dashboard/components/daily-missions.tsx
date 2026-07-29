"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CheckCircle2, Circle, Headphones, Layers, PenLine, Target } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { DailyMission } from "../types";
import { Section, SectionHeading } from "./dashboard-shared";

const ICONS: Record<DailyMission["icon"], React.ComponentType<{ className?: string }>> = {
  flashcards: Layers,
  reading: BookOpen,
  listening: Headphones,
  writing: PenLine,
  review: Target,
};

export function DailyMissionSection({ missions }: { missions: DailyMission[] }) {
  const [items, setItems] = useState(missions);

  const { doneCount, totalXp, earnedXp } = useMemo(() => {
    const doneCount = items.filter((m) => m.done).length;
    const totalXp = items.reduce((sum, m) => sum + m.xp, 0);
    const earnedXp = items.filter((m) => m.done).reduce((sum, m) => sum + m.xp, 0);
    return { doneCount, totalXp, earnedXp };
  }, [items]);

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, done: !m.done, progress: !m.done ? m.target : m.progress }
          : m,
      ),
    );
  }

  return (
    <Section delay={0.1}>
      <SectionHeading
        title="Daily Mission"
        subtitle={`${doneCount}/${items.length} completed · ${earnedXp}/${totalXp} XP earned`}
      />
      <ul className="space-y-2">
        {items.map((mission, i) => {
          const Icon = ICONS[mission.icon];
          const pct = Math.min(100, Math.round((mission.progress / mission.target) * 100));
          return (
            <motion.li
              key={mission.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <button
                type="button"
                onClick={() => toggle(mission.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-all duration-200",
                  "hover:border-border/60 hover:bg-surface-raised/60",
                  mission.done && "bg-success/[0.06]",
                )}
              >
                <span className="shrink-0">
                  <AnimatePresence mode="wait" initial={false}>
                    {mission.done ? (
                      <motion.span
                        key="done"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="todo"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <Circle className="h-5 w-5 text-muted-foreground/50" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>

                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm font-medium", mission.done && "text-muted-foreground line-through")}>
                      {mission.title}
                    </p>
                    <span className="shrink-0 text-xs font-medium text-primary">+{mission.xp} XP</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{mission.description}</p>
                  {!mission.done && (
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-1 rounded-full bg-primary/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  )}
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </Section>
  );
}

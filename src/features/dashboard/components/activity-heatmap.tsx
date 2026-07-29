"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ActivityLevel, HeatmapDay } from "../types";
import { Section, SectionHeading } from "./dashboard-shared";

const LEVEL_OPACITY: Record<ActivityLevel, number> = {
  0: 0.06,
  1: 0.28,
  2: 0.5,
  3: 0.72,
  4: 1,
};

function groupByWeek(days: HeatmapDay[]) {
  // Pad start so the grid begins on a Sunday, matching GitHub-style layout.
  const first = new Date(days[0]?.date ?? Date.now());
  const padStart = first.getDay();
  const padded: (HeatmapDay | null)[] = [...Array(padStart).fill(null), ...days];

  const weeks: (HeatmapDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  return weeks;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ActivityHeatmapSection({ days }: { days: HeatmapDay[] }) {
  const weeks = useMemo(() => groupByWeek(days), [days]);
  const [hovered, setHovered] = useState<HeatmapDay | null>(null);

  const activeDays = days.filter((d) => d.level > 0).length;
  const totalMinutes = days.reduce((sum, d) => sum + d.minutes, 0);

  const monthMarkers = useMemo(() => {
    const markers: { weekIndex: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wIdx) => {
      const firstReal = week.find((d) => d !== null);
      if (!firstReal) return;
      const month = new Date(firstReal.date).getMonth();
      if (month !== lastMonth) {
        markers.push({ weekIndex: wIdx, label: MONTH_LABELS[month] ?? "" });
        lastMonth = month;
      }
    });
    return markers;
  }, [weeks]);

  return (
    <Section delay={0.15}>
      <SectionHeading
        title="Heatmap"
        subtitle={`${activeDays} active days · ${Math.round(totalMinutes / 60)}h studied in this period`}
      />

      <TooltipPrimitive.Provider delayDuration={100}>
        <div className="scrollbar-thin overflow-x-auto pb-2">
          <div className="relative min-w-[560px]">
            <div className="mb-1 flex gap-[3px] pl-6 text-[10px] text-muted-foreground">
              {weeks.map((_, wIdx) => {
                const marker = monthMarkers.find((m) => m.weekIndex === wIdx);
                return (
                  <div key={wIdx} className="w-[13px] shrink-0">
                    {marker?.label ?? ""}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[3px]">
              <div className="flex flex-col gap-[3px] pr-1 text-[10px] leading-[13px] text-muted-foreground">
                <span className="h-[13px]">Sun</span>
                <span className="h-[13px]" />
                <span className="h-[13px]">Tue</span>
                <span className="h-[13px]" />
                <span className="h-[13px]">Thu</span>
                <span className="h-[13px]" />
                <span className="h-[13px]">Sat</span>
              </div>
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) =>
                    day ? (
                      <TooltipPrimitive.Root key={day.date}>
                        <TooltipPrimitive.Trigger asChild>
                          <motion.button
                            type="button"
                            onMouseEnter={() => setHovered(day)}
                            onMouseLeave={() => setHovered(null)}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25, delay: (wIdx * 7 + dIdx) * 0.0015 }}
                            className="h-[13px] w-[13px] rounded-[3px]"
                            style={{
                              backgroundColor: `hsl(var(--primary) / ${LEVEL_OPACITY[day.level]})`,
                            }}
                            aria-label={`${day.date}: ${day.minutes} minutes`}
                          />
                        </TooltipPrimitive.Trigger>
                        <TooltipPrimitive.Portal>
                          <TooltipPrimitive.Content
                            sideOffset={6}
                            className="z-50 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs shadow-md"
                          >
                            <span className="font-medium">{day.minutes} min</span> on {day.date}
                          </TooltipPrimitive.Content>
                        </TooltipPrimitive.Portal>
                      </TooltipPrimitive.Root>
                    ) : (
                      <div key={`empty-${dIdx}`} className="h-[13px] w-[13px]" />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </TooltipPrimitive.Provider>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{hovered ? `${hovered.date} · ${hovered.minutes} min` : "Hover a cell for details"}</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {([0, 1, 2, 3, 4] as ActivityLevel[]).map((level) => (
            <span
              key={level}
              className="h-[10px] w-[10px] rounded-[2px]"
              style={{ backgroundColor: `hsl(var(--primary) / ${LEVEL_OPACITY[level]})` }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </Section>
  );
}

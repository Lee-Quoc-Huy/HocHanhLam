"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { LANGUAGES } from "@/config/languages";
import type { LanguageProgress } from "../types";
import { Section, SectionHeading, langAccentVar } from "./dashboard-shared";

export function LearningProgressSection({ languages }: { languages: LanguageProgress[] }) {
  return (
    <Section delay={0.05}>
      <SectionHeading
        title="Learning Progress"
        subtitle="Level, XP, and vocabulary coverage per language"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {languages.map((lang, i) => {
          const def = LANGUAGES[lang.code];
          const xpPct = Math.min(100, Math.round((lang.xp / lang.xpToNext) * 100));
          const wordsPct = Math.min(100, Math.round((lang.wordsLearned / lang.wordsGoal) * 100));
          const accent = langAccentVar(lang.code);

          return (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * i }}
              className="rounded-xl border border-border/60 bg-surface-raised/60 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>
                    {def.flagEmoji}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{def.label}</p>
                    <p className="text-xs text-muted-foreground">{lang.level}</p>
                  </div>
                </div>
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
                >
                  <TrendingUp className="h-3 w-3" />
                  {lang.weeklyDeltaPct}%
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>XP</span>
                    <span>
                      {lang.xp}/{lang.xpToNext}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-1.5 rounded-full"
                      style={{ backgroundColor: accent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPct}%` }}
                      transition={{ duration: 0.8, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Vocabulary</span>
                    <span>
                      {lang.wordsLearned}/{lang.wordsGoal}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-1.5 rounded-full opacity-60"
                      style={{ backgroundColor: accent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${wordsPct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Flashcard } from "../types";
import { LangBadge, Section, SectionHeading, langAccentVar } from "./dashboard-shared";

export function QuickFlashcardSection({ flashcards }: { flashcards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(1);

  const card = flashcards[index % flashcards.length]!;
  const accent = langAccentVar(card.language);

  function next(dir: 1 | -1) {
    setDirection(dir);
    setFlipped(false);
    setIndex((i) => (i + dir + flashcards.length) % flashcards.length);
  }

  return (
    <Section delay={0.18}>
      <SectionHeading
        title="Quick Flashcard"
        subtitle={`Card ${(index % flashcards.length) + 1} of ${flashcards.length}`}
        action={<LangBadge code={card.language} />}
      />

      <div className="[perspective:1200px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.button
            key={card.id}
            type="button"
            onClick={() => setFlipped((f) => !f)}
            custom={direction}
            initial={{ opacity: 0, x: 40 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 * direction }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-40 w-full items-center justify-center rounded-2xl border border-border/60 bg-surface-raised/60 p-6 text-center [transform-style:preserve-3d]"
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center rounded-2xl p-6 [backface-visibility:hidden]"
            >
              <div>
                <p className="font-display text-2xl font-semibold" style={{ color: accent }}>
                  {card.front}
                </p>
                {card.reading && <p className="mt-1 text-sm text-muted-foreground">{card.reading}</p>}
                <p className="mt-3 text-xs text-muted-foreground">Tap to reveal meaning</p>
              </div>
            </motion.div>
            <motion.div
              animate={{ rotateY: flipped ? 360 : 180 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center rounded-2xl p-6 [backface-visibility:hidden]"
            >
              <div>
                <p className="text-lg font-medium">{card.back}</p>
                <p className="mt-2 text-xs italic text-muted-foreground">{card.example}</p>
              </div>
            </motion.div>
          </motion.button>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => setFlipped((f) => !f)} className="gap-1.5">
          <RotateCw className="h-3.5 w-3.5" />
          Flip
        </Button>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className={cn("gap-1.5 hover:border-destructive/50 hover:text-destructive")}
            onClick={() => next(1)}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            Again
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => next(1)}>
            <ThumbsUp className="h-3.5 w-3.5" />
            Got it
          </Button>
        </div>
      </div>
    </Section>
  );
}

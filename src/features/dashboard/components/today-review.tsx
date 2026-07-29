"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CheckCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReviewItem } from "../types";
import { LangBadge, Section, SectionHeading } from "./dashboard-shared";

export function TodayReviewSection({ reviews }: { reviews: ReviewItem[] }) {
  const [items, setItems] = useState(reviews);
  const dueNow = items.filter((r) => r.dueLabel === "Due now").length;

  function dismiss(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <Section delay={0.12}>
      <SectionHeading
        title="Today's Review"
        subtitle={items.length === 0 ? "All caught up" : `${dueNow} due now · ${items.length} total`}
        action={
          <Button size="sm" disabled={items.length === 0}>
            Review all
          </Button>
        }
      />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
          <CheckCheck className="h-8 w-8 text-success" />
          <p className="text-sm">Nothing left to review. Nice work.</p>
        </div>
      ) : (
        <ul className="scrollbar-thin max-h-[280px] space-y-2 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-raised/50 p-3"
              >
                <LangBadge code={item.language} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {item.term}
                    {item.reading && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{item.reading}</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{item.translation}</p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.dueLabel}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">{item.interval}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => dismiss(item.id)}>
                  Done
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Section>
  );
}

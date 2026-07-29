"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiRecommendation } from "../types";
import { LangBadge, Section, SectionHeading } from "./dashboard-shared";

export function AiRecommendationSection({ recommendations }: { recommendations: AiRecommendation[] }) {
  return (
    <Section delay={0.08} className="bg-gradient-to-br from-primary/[0.04] to-transparent">
      <SectionHeading
        title="AI Recommendation"
        subtitle="Personalized next steps based on your recent activity"
        action={<Sparkles className="h-4 w-4 text-primary" />}
      />
      <div className="grid gap-3 md:grid-cols-3">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            className="flex flex-col justify-between rounded-xl border border-border/60 bg-surface-raised/60 p-4"
          >
            <div>
              <div className="mb-2 flex items-center justify-between">
                <LangBadge code={rec.language} className="px-1.5 py-0 text-[10px]" />
                <span className="text-[11px] font-medium text-primary">{rec.confidencePct}% match</span>
              </div>
              <p className="text-sm font-semibold leading-snug">{rec.title}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{rec.reason}</p>
            </div>
            <Button size="sm" variant="outline" className="mt-4 w-full justify-between">
              {rec.actionLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

"use client";

import { motion } from "framer-motion";
import { FileAudio, FileText, Newspaper, NotebookPen } from "lucide-react";
import type { RecentDocument } from "../types";
import { LangBadge, Section, SectionHeading, langAccentVar } from "./dashboard-shared";

const TYPE_ICON: Record<RecentDocument["type"], React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  article: Newspaper,
  note: NotebookPen,
  audio: FileAudio,
};

export function RecentDocumentsSection({ documents }: { documents: RecentDocument[] }) {
  return (
    <Section delay={0.2}>
      <SectionHeading title="Tài Liệu Gần Đây" subtitle="Tiếp tục từ nơi bạn đã dừng lại" />
      <ul className="space-y-2">
        {documents.map((doc, i) => {
          const Icon = TYPE_ICON[doc.type];
          const accent = langAccentVar(doc.language);
          return (
            <motion.li
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-colors hover:border-border/60 hover:bg-surface-raised/60"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <LangBadge code={doc.language} className="px-1.5 py-0 text-[10px]" />
                    <span className="text-[11px] text-muted-foreground">{doc.updatedLabel}</span>
                  </div>
                </div>
                <div className="w-16 shrink-0 text-right">
                  <span className="text-xs font-medium text-muted-foreground">{doc.progressPct}%</span>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${doc.progressPct}%`, backgroundColor: accent }}
                    />
                  </div>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </Section>
  );
}

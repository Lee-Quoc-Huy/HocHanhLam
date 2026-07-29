"use client";

import { motion } from "framer-motion";
import { LANGUAGES, type LanguageCode } from "@/config/languages";
import { cn } from "@/lib/utils/cn";

export function langAccentVar(code: LanguageCode) {
  return `hsl(var(--${LANGUAGES[code].accentToken}))`;
}

export function LangBadge({ code, className }: { code: LanguageCode; className?: string }) {
  const lang = LANGUAGES[code];
  return (
    <span
      className={cn("glass-chip", className)}
      style={{ color: langAccentVar(code) }}
    >
      <span aria-hidden>{lang.flagEmoji}</span>
      {lang.label}
    </span>
  );
}

export function Section({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("glass-panel glass-panel-hover p-5 sm:p-6", className)}
    >
      {children}
    </motion.section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-base font-semibold sm:text-lg">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

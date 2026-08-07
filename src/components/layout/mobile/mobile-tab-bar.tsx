"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, GraduationCap, BookCheck, Sparkles, Layers } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion } from "framer-motion";

interface TabItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isAi?: boolean;
}

const TAB_ITEMS: TabItem[] = [
  { title: "Từ Vựng", href: "/vocabulary", icon: BookOpenText },
  { title: "Ôn Thi", href: "/exam-prep", icon: GraduationCap },
  { title: "Ngữ Pháp", href: "/grammar", icon: BookCheck },
  { title: "AI Tutor", href: "/ai-tutor", icon: Sparkles, isAi: true },
  { title: "Ôn Tập", href: "/flashcards", icon: Layers },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] px-3 lg:hidden pointer-events-none">
      <div className="pointer-events-auto mx-auto flex h-[4.25rem] max-w-md items-center justify-between rounded-[2.25rem] border border-white/20 bg-background/85 px-2 py-1.5 shadow-[0_16px_50px_-8px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 ring-1 ring-white/10 dark:border-white/15 dark:bg-zinc-950/85">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center py-1 rounded-2xl text-[10px] sm:text-[11px] font-semibold transition-all duration-300 active:scale-95 group"
            >
              {/* Active Glass Pill Highlight */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={cn(
                    "absolute inset-0 rounded-2xl border shadow-md",
                    item.isAi
                      ? "bg-gradient-to-b from-purple-500/30 via-indigo-500/15 to-transparent border-purple-500/40 shadow-[0_0_20px_-2px_rgba(168,85,247,0.5)]"
                      : "bg-gradient-to-b from-emerald-500/30 via-teal-500/15 to-transparent border-emerald-500/40 shadow-[0_0_20px_-2px_rgba(16,185,129,0.5)]"
                  )}
                />
              )}

              {/* Active Indicator Top Dot */}
              {isActive && (
                <motion.span
                  layoutId="activeTabDot"
                  className={cn(
                    "absolute -top-0.5 size-1 rounded-full shadow-xs",
                    item.isAi ? "bg-purple-400" : "bg-emerald-400"
                  )}
                />
              )}

              {/* Icon with glow */}
              <div className="relative">
                <Icon
                  className={cn(
                    "size-5 transition-all duration-300 group-hover:scale-110",
                    isActive
                      ? item.isAi
                        ? "scale-110 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                        : "scale-110 text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                      : "text-muted-foreground/75 group-hover:text-foreground"
                  )}
                />
                {item.isAi && !isActive && (
                  <span className="absolute -top-1 -right-1 flex size-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2 bg-purple-500"></span>
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "relative mt-1 tracking-tight transition-colors duration-300 truncate max-w-full px-0.5 text-[10px] leading-none",
                  isActive
                    ? item.isAi
                      ? "text-purple-400 font-extrabold"
                      : "text-emerald-500 dark:text-emerald-400 font-extrabold"
                    : "text-muted-foreground/75 font-semibold group-hover:text-foreground"
                )}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, BookMarked, Layers, Sparkles, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TAB_ITEMS = [
  { title: "Từ Vựng", href: "/vocabulary", icon: BookOpenText },
  { title: "Ngữ Pháp", href: "/grammar", icon: BookMarked },
  { title: "Ôn Tập", href: "/flashcards", icon: Layers },
  { title: "AI Tutor", href: "/ai-tutor", icon: Sparkles },
  { title: "Thư Viện", href: "/library", icon: FolderKanban },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] px-3 lg:hidden pointer-events-none">
      <div className="pointer-events-auto mx-auto flex h-16 max-w-md items-center justify-around rounded-[1.75rem] border border-white/10 bg-surface/75 p-1 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center py-1 rounded-2xl text-[10px] sm:text-[11px] font-semibold transition-all duration-300 active:scale-90"
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-transparent shadow-[0_0_16px_-2px_rgba(16,185,129,0.55)] ring-1 ring-emerald-400/30 animate-in fade-in zoom-in-95 duration-300"
                />
              )}
              <Icon
                className={cn(
                  "relative size-4.5 sm:size-5 transition-all duration-300",
                  isActive
                    ? "scale-110 text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                    : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "relative mt-0.5 tracking-tight transition-colors duration-300 truncate max-w-full px-0.5",
                  isActive ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground"
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

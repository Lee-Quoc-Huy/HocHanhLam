"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, GraduationCap, Sparkles, FolderKanban, Layers } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TAB_ITEMS = [
  { title: "Từ Vựng", href: "/vocabulary", icon: BookOpenText },
  { title: "Ôn Thi", href: "/exam-prep", icon: GraduationCap },
  { title: "AI Tutor", href: "/ai-tutor", icon: Sparkles },
  { title: "Flashcards", href: "/flashcards", icon: Layers },
  { title: "Thư Viện", href: "/library", icon: FolderKanban },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] px-3 lg:hidden pointer-events-none">
      <div className="pointer-events-auto mx-auto flex h-16 max-w-md items-center justify-around rounded-[1.75rem] border border-white/15 bg-background/85 p-1.5 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 ring-1 ring-white/10">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center py-1 rounded-2xl text-[10px] sm:text-[11px] font-semibold transition-all duration-300 active:scale-95"
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/25 via-primary/10 to-transparent shadow-[0_0_20px_-2px_rgba(16,185,129,0.6)] ring-1 ring-primary/40 animate-in fade-in zoom-in-95 duration-300"
                />
              )}
              <Icon
                className={cn(
                  "relative size-5 transition-all duration-300",
                  isActive
                    ? "scale-110 text-primary drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    : "text-muted-foreground/80 hover:text-foreground"
                )}
              />
              <span
                className={cn(
                  "relative mt-0.5 tracking-tight transition-colors duration-300 truncate max-w-full px-0.5 font-medium",
                  isActive ? "text-primary font-bold" : "text-muted-foreground/80"
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

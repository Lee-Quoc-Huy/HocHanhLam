"use client";

import { Search, Cpu, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/layout/shared/theme-toggle";
import { UserMenu } from "@/components/layout/shared/user-menu";
import { CommandKModal } from "@/features/search/components/command-k-modal";
import { useSearchStore } from "@/features/search/store/search-store";

export function DesktopTopbar() {
  const toggleCommandK = useSearchStore((s) => s.toggleCommandK);

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-border/60 bg-background/80 px-6 backdrop-blur-2xl lg:flex shadow-2xs">
      {/* Search Input Button */}
      <button
        onClick={toggleCommandK}
        className="group relative flex w-full max-w-md items-center gap-3 rounded-2xl border border-border/70 bg-surface/70 px-4 py-2.5 text-xs text-muted-foreground shadow-xs backdrop-blur-md transition-all duration-200 hover:border-emerald-500/50 hover:bg-surface hover:text-foreground hover:shadow-md"
      >
        <Search className="size-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
        <span className="flex-1 text-left font-medium">Tìm kiếm thông minh (Từ vựng, Bài đọc, Quiz, Đề thi)...</span>
        <div className="flex items-center gap-1">
          <kbd className="rounded-lg border border-border bg-muted/80 px-2 py-0.5 font-mono text-[10px] font-bold text-foreground shadow-2xs">
            Ctrl
          </kbd>
          <kbd className="rounded-lg border border-border bg-muted/80 px-2 py-0.5 font-mono text-[10px] font-bold text-foreground shadow-2xs">
            K
          </kbd>
        </div>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dual Engine Badge */}
        <div className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-purple-500/10 px-3 py-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 shadow-2xs">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          <Cpu className="size-3.5" />
          <span>Dual-Engine AI (Google + OpenRouter)</span>
        </div>

        <ThemeToggle />
        <UserMenu />
      </div>

      <CommandKModal />
    </header>
  );
}

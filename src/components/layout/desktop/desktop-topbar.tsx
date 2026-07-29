"use client";

import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/shared/theme-toggle";
import { UserMenu } from "@/components/layout/shared/user-menu";
import { CommandKModal } from "@/features/search/components/command-k-modal";
import { useSearchStore } from "@/features/search/store/search-store";

export function DesktopTopbar() {
  const toggleCommandK = useSearchStore((s) => s.toggleCommandK);

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur lg:flex">
      <button
        onClick={toggleCommandK}
        className="relative flex w-full max-w-sm items-center gap-2 rounded-xl border border-border/80 bg-surface/60 px-3.5 py-2 text-xs text-muted-foreground shadow-xs transition-all hover:border-emerald-500/50 hover:bg-surface hover:text-foreground"
      >
        <Search className="size-4 text-emerald-600 dark:text-emerald-400" />
        <span className="flex-1 text-left">Tìm kiếm thông minh (Từ vựng, Bài đọc, Quiz...)...</span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
          Ctrl K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>

      <CommandKModal />
    </header>
  );
}

"use client";

import { Menu, Leaf, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useUiStore } from "@/store/ui-store";
import { useSearchStore } from "@/features/search/store/search-store";
import { ThemeToggle } from "@/components/layout/shared/theme-toggle";

export function MobileTopbar() {
  const { setMobileNavOpen } = useUiStore();
  const { setCommandKOpen } = useSearchStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-surface/70 px-3.5 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)] lg:hidden pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileNavOpen(true)}
          className="size-9 rounded-xl hover:bg-surface-raised active:scale-90 transition-transform"
          aria-label="Open menu"
        >
          <Menu className="size-5 text-foreground" />
        </Button>

        <div className="flex items-center gap-2 font-display text-base font-bold text-foreground">
          <div className="relative flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-[0_0_14px_-2px_rgba(16,185,129,0.5)]">
            <Leaf className="size-4 fill-emerald-500/25 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="tracking-tight">{siteConfig.shortName}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCommandKOpen(true)}
          className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-raised active:scale-90 transition-transform"
          title="Tìm kiếm ngữ nghĩa (Ctrl+K)"
        >
          <Search className="size-4 text-emerald-600 dark:text-emerald-400" />
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}

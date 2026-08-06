"use client";

import { Menu, Leaf, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useUiStore } from "@/store/ui-store";
import { useSearchStore } from "@/features/search/store/search-store";
import { ThemeToggle } from "@/components/layout/shared/theme-toggle";

export function MobileTopbar() {
  const { setMobileNavOpen } = useUiStore();
  const { setCommandKOpen } = useSearchStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-3.5 backdrop-blur-2xl shadow-xs lg:hidden pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileNavOpen(true)}
          className="size-9 rounded-xl hover:bg-muted active:scale-95 transition-all"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5 text-foreground" />
        </Button>

        <div className="flex items-center gap-2 font-display text-sm sm:text-base font-extrabold text-foreground">
          <div className="relative flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-emerald-500/15 to-transparent text-primary border border-primary/30 shadow-[0_0_12px_-2px_rgba(16,185,129,0.5)]">
            <Leaf className="size-4 fill-primary/20 text-primary" />
          </div>
          <span className="tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text">
            {siteConfig.shortName}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-extrabold text-primary border border-primary/20 uppercase tracking-widest">
            AI Pro
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCommandKOpen(true)}
          className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
          title="Tìm kiếm thông minh (Ctrl+K)"
        >
          <Search className="size-4 text-primary" />
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}

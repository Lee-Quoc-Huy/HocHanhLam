"use client";

import { Menu, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useUiStore } from "@/store/ui-store";
import { ThemeToggle } from "@/components/layout/shared/theme-toggle";

export function MobileTopbar() {
  const { setMobileNavOpen } = useUiStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur lg:hidden">
      <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
        <Menu />
      </Button>
      <div className="flex items-center gap-2 font-display text-base font-bold text-foreground">
        <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Leaf className="size-3.5 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span>{siteConfig.shortName}</span>
      </div>
      <ThemeToggle />
    </header>
  );
}

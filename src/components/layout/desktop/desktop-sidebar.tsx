"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { navConfig, siteConfig } from "@/config/site";
import { useUiStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function DesktopSidebar() {
  const pathname = usePathname();
  const { isDesktopSidebarCollapsed, toggleDesktopSidebar } = useUiStore();

  return (
    <motion.aside
      animate={{ width: isDesktopSidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface lg:flex"
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!isDesktopSidebarCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-bold text-foreground hover:opacity-90">
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Leaf className="size-4 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span>{siteConfig.shortName}</span>
          </Link>
        ) : (
          <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Leaf className="size-4 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={toggleDesktopSidebar} aria-label="Toggle sidebar">
          <Icons.PanelLeft className="size-4" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navConfig.primary.map((item) => {
          const Icon = Icons[item.icon as keyof typeof Icons] as Icons.LucideIcon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!isDesktopSidebarCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-3">
        {navConfig.secondary.map((item) => {
          const Icon = Icons[item.icon as keyof typeof Icons] as Icons.LucideIcon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-4 shrink-0" />
              {!isDesktopSidebarCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}

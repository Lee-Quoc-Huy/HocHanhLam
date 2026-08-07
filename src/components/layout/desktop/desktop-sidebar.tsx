"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { Leaf, Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
      animate={{ width: isDesktopSidebarCollapsed ? 76 : 260 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border/70 bg-surface/90 backdrop-blur-2xl lg:flex z-30 shadow-xs"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
        {!isDesktopSidebarCollapsed ? (
          <Link href="/vocabulary" className="flex items-center gap-2.5 font-display font-extrabold text-foreground group">
            <div className="relative flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 via-teal-500/15 to-primary/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_-2px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
              <Leaf className="size-4.5 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight leading-tight">{siteConfig.shortName}</span>
              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">AI Platform</span>
            </div>
          </Link>
        ) : (
          <div className="flex size-9 items-center justify-center mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/25 via-teal-500/15 to-primary/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_-2px_rgba(16,185,129,0.4)]">
            <Leaf className="size-4.5 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
          </div>
        )}

        {!isDesktopSidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDesktopSidebar}
            aria-label="Toggle sidebar"
            className="size-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      {/* Primary Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        <div>
          {!isDesktopSidebarCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1.5">
              <Sparkles className="size-3 text-emerald-500" />
              <span>Menu Học Tập AI</span>
            </div>
          )}

          <nav className="space-y-1">
            {navConfig.primary.map((item) => {
              const Icon = (Icons[item.icon as keyof typeof Icons] || Icons.BookOpenText) as Icons.LucideIcon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isDesktopSidebarCollapsed ? item.title : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 group active:scale-98",
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 shadow-2xs"
                      : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}
                  <Icon
                    className={cn(
                      "size-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                      isActive ? "text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "text-muted-foreground/80"
                    )}
                  />
                  {!isDesktopSidebarCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Secondary Nav */}
        <div>
          {!isDesktopSidebarCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80">
              Hệ Thống & Cài Đặt
            </div>
          )}

          <nav className="space-y-1">
            {navConfig.secondary.map((item) => {
              const Icon = (Icons[item.icon as keyof typeof Icons] || Icons.Settings) as Icons.LucideIcon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isDesktopSidebarCollapsed ? item.title : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 hover:bg-surface-raised hover:text-foreground active:scale-98",
                    isActive ? "text-primary font-bold bg-primary/10" : "text-muted-foreground/80"
                  )}
                >
                  <Icon className="size-4.5 shrink-0 text-muted-foreground/80" />
                  {!isDesktopSidebarCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Toggle button when collapsed */}
      {isDesktopSidebarCollapsed && (
        <div className="border-t border-border/50 p-3 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDesktopSidebar}
            aria-label="Expand sidebar"
            className="size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <PanelLeftOpen className="size-4" />
          </Button>
        </div>
      )}
    </motion.aside>
  );
}

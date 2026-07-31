"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { X, Leaf, Sparkles } from "lucide-react";
import { navConfig, siteConfig } from "@/config/site";
import { useUiStore } from "@/store/ui-store";
import { UserMenu } from "@/components/layout/shared/user-menu";
import { cn } from "@/lib/utils/cn";

export function MobileNavSheet() {
  const { isMobileNavOpen, setMobileNavOpen } = useUiStore();
  const pathname = usePathname();

  return (
    <Dialog.Root open={isMobileNavOpen} onOpenChange={setMobileNavOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-in fade-in lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-80 flex-col bg-surface-raised/90 backdrop-blur-2xl p-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] shadow-[8px_0_40px_-8px_rgba(0,0,0,0.5)] animate-in slide-in-from-left duration-300 lg:hidden border-r border-white/10">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-4">
            <Dialog.Title className="font-display text-lg font-bold flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                <Leaf className="size-4 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span className="text-base font-bold text-foreground block leading-tight">{siteConfig.shortName}</span>
                <span className="text-[10px] text-muted-foreground font-mono">Personal AI Learning OS</span>
              </div>
            </Dialog.Title>

            <Dialog.Close className="rounded-xl p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground">
              <X className="size-5" />
            </Dialog.Close>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
            <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Sparkles className="size-3 text-emerald-500" /> <span>Học Tập & Tri Thức AI</span>
            </div>

            {navConfig.primary.map((item) => {
              const Icon = (Icons[item.icon as keyof typeof Icons] || Icons.BookOpenText) as Icons.LucideIcon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-semibold transition-all duration-200 active:scale-98",
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 shadow-2xs"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  )}
                >
                  <Icon className={cn("size-4.5", isActive ? "text-emerald-500" : "text-muted-foreground")} />
                  <span>{item.title}</span>
                </Link>
              );
            })}

            <div className="pt-4 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Hệ Thống & Cài Đặt
            </div>

            {navConfig.secondary.map((item) => {
              const Icon = (Icons[item.icon as keyof typeof Icons] || Icons.Settings) as Icons.LucideIcon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-semibold transition-all duration-200 active:scale-98",
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 shadow-2xs"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  )}
                >
                  <Icon className={cn("size-4.5", isActive ? "text-emerald-500" : "text-muted-foreground")} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Account Footer */}
          <div className="border-t border-border/60 pt-4 mt-auto">
            <UserMenu />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

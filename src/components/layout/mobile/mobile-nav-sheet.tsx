"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { X, Leaf } from "lucide-react";
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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface p-4 lg:hidden">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-bold flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Leaf className="size-3.5 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span>{siteConfig.shortName}</span>
            </Dialog.Title>
            <Dialog.Close aria-label="Close menu">
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <nav className="flex-1 space-y-1">
            {[...navConfig.primary, ...navConfig.secondary].map((item) => {
              const Icon = Icons[item.icon as keyof typeof Icons] as Icons.LucideIcon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border pt-3">
            <UserMenu />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Primary mobile navigation — the 4 most-used destinations, bottom-fixed. */
const TAB_ITEMS = [
  { title: "Home", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Vocab", href: "/vocabulary", icon: "BookOpenText" },
  { title: "AI Tutor", href: "/ai-tutor", icon: "Sparkles" },
  { title: "Progress", href: "/progress", icon: "TrendingUp" },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur lg:hidden">
      {TAB_ITEMS.map((item) => {
        const Icon = Icons[item.icon as keyof typeof Icons] as Icons.LucideIcon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 text-[11px] font-medium",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

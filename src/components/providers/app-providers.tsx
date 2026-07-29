"use client";

import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { AuthSyncProvider } from "./auth-sync-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Single composition root for every client-side provider. Import ONE
 * component in the root layout instead of nesting providers there —
 * keeps app/layout.tsx a Server Component.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthSyncProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster richColors position="top-right" closeButton />
          </TooltipProvider>
        </AuthSyncProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

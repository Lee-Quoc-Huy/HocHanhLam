"use client";

/**
 * Browser-side Supabase client. Use inside Client Components / hooks only.
 * Session is persisted via cookies (see @supabase/ssr) so it stays in sync
 * with the server client used in Server Components and Route Handlers.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return browserClient;
}

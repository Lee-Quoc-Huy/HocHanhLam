import "server-only";

/**
 * Service-role Supabase client. NEVER import this into anything that can be
 * bundled client-side. Reserved for trusted server contexts only: Route
 * Handlers performing privileged writes, and Edge Functions.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { getDashboardData } from "@/features/dashboard/data/mock-dashboard-data";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Trang chủ" };

/**
 * Full product dashboard (Home).
 *
 * Data note: the learning-domain schema (srs_reviews, missions, documents, ...)
 * doesn't exist in Supabase yet (see src/types/database.types.ts), so this
 * page renders from `getDashboardData()`, a deterministic mock matching the
 * `DashboardData` shape. Swap that one call for a real data-fetching hook
 * once those tables land — every component below only depends on the shape,
 * not the source.
 *
 * The one real piece wired in today: `userName` comes from the actual
 * logged-in Supabase user (fullName from user_metadata, falling back to the
 * email's local-part, then a generic greeting) instead of a hard-coded mock name.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "bạn";

  const data = getDashboardData(displayName);
  return <DashboardView data={data} />;
}

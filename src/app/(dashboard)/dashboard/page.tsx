import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { getDashboardData } from "@/features/dashboard/data/mock-dashboard-data";

export const metadata = { title: "Dashboard" };

/**
 * Full product dashboard (Home).
 *
 * Data note: the learning-domain schema (srs_reviews, missions, documents, ...)
 * doesn't exist in Supabase yet (see src/types/database.types.ts), so this
 * page renders from `getDashboardData()`, a deterministic mock matching the
 * `DashboardData` shape. Swap that one call for a real data-fetching hook
 * once those tables land — every component below only depends on the shape,
 * not the source.
 */
export default function DashboardPage() {
  const data = getDashboardData();
  return <DashboardView data={data} />;
}

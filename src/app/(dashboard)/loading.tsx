import { HeaderSkeleton, GridSkeleton } from "@/components/ui/skeleton-loaders";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <GridSkeleton count={6} />
    </div>
  );
}

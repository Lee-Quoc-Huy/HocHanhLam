import { AppShell } from "@/components/layout/app-shell";

/**
 * Layout for every authenticated route. Access control itself lives in
 * middleware.ts (runs before this even renders); this layout is purely
 * presentational (shell composition).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

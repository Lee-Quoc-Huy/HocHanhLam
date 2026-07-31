import { DesktopSidebar } from "./desktop-sidebar";
import { DesktopTopbar } from "./desktop-topbar";

/**
 * Desktop application shell: fixed sidebar + topbar + scrollable content
 * column. Rendered for lg+ viewports by <AppShell>; hidden entirely below
 * lg via the `hidden lg:flex` classes on its children so no desktop-only
 * JS/markup weight leaks onto mobile.
 */
export function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden min-h-screen lg:flex">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DesktopTopbar />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

import { MobileTopbar } from "./mobile-topbar";
import { MobileNavSheet } from "./mobile-nav-sheet";
import { MobileTabBar } from "./mobile-tab-bar";

/**
 * Mobile application shell: top bar + overlay nav sheet + bottom tab bar.
 * Content area gets bottom padding to clear the fixed tab bar, and this
 * whole shell renders on all viewport widths but is visually hidden on
 * lg+ by the `lg:hidden` classes inside each child.
 */
export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:hidden">
      <MobileTopbar />
      <MobileNavSheet />
      <main className="flex-1 px-4 py-4 pb-20">{children}</main>
      <MobileTabBar />
    </div>
  );
}

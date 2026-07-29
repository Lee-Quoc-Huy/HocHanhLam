import { DesktopShell } from "./desktop/desktop-shell";
import { MobileShell } from "./mobile/mobile-shell";

/**
 * Renders both the desktop and mobile shells and lets CSS breakpoints
 * (`hidden lg:flex` / `lg:hidden`) decide which is visible. Deliberately
 * NOT a JS device-detection switch (e.g. useIsDesktop + conditional render):
 * that approach causes a hydration mismatch / layout flash on first paint
 * because the server can't know the client's viewport. Both trees are
 * cheap (no data fetching of their own), so the duplication cost is small
 * and correctness/no-flash wins.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopShell>{children}</DesktopShell>
      <MobileShell>{children}</MobileShell>
    </>
  );
}

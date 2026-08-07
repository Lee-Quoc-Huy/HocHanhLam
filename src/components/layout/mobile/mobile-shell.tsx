import { MobileTopbar } from "./mobile-topbar";
import { MobileNavSheet } from "./mobile-nav-sheet";
import { MobileTabBar } from "./mobile-tab-bar";

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col lg:hidden bg-background isolate overflow-x-hidden">
      {/* Ambient cinematic glow — fixed, behind content, ignores scroll */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-24 -left-16 size-80 rounded-full bg-emerald-500/15 blur-[100px] dark:bg-emerald-500/20" />
        <div className="absolute top-1/3 -right-20 size-80 rounded-full bg-teal-400/15 blur-[110px] dark:bg-teal-400/15" />
        <div className="absolute bottom-10 left-1/4 size-72 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <MobileTopbar />
      <MobileNavSheet />
      <main className="relative flex-1 px-3.5 py-4 pb-28 max-w-3xl mx-auto w-full animate-in fade-in duration-300">
        {children}
      </main>
      <MobileTabBar />
    </div>
  );
}

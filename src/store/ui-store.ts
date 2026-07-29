"use client";

/**
 * Global, cross-feature UI state (things every layout/component may need):
 * sidebar collapse, active mobile sheet, command palette, etc. Feature-local
 * UI state should live in that feature's own store instead of here.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  isDesktopSidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  isCommandPaletteOpen: boolean;
  toggleDesktopSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isDesktopSidebarCollapsed: false,
      isMobileNavOpen: false,
      isCommandPaletteOpen: false,
      toggleDesktopSidebar: () =>
        set((s) => ({ isDesktopSidebarCollapsed: !s.isDesktopSidebarCollapsed })),
      setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
    }),
    {
      name: "linguaverse-ui",
      partialize: (state) => ({ isDesktopSidebarCollapsed: state.isDesktopSidebarCollapsed }),
    },
  ),
);

"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook. Defaults to `false` on the server; the real
 * value is applied after mount, so combine with a skeleton or accept a
 * brief layout shift on first paint (mitigated by BREAKPOINTS constants
 * matching the Tailwind config).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export const BREAKPOINTS = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
} as const;

export function useIsDesktop() {
  return useMediaQuery(BREAKPOINTS.desktop);
}

export function useIsMobile() {
  return useMediaQuery(BREAKPOINTS.mobile);
}

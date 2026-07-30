"use client";

import { useEffect } from "react";
import { useSearchStore } from "../store/search-store";
import { searchService } from "../api/search-service";

export function useSemanticSearch() {
  const store = useSearchStore();

  useEffect(() => {
    store.fetchHistory();

    const unsubscribe = searchService.subscribeToRealtime(() => {
      store.fetchHistory();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        store.toggleCommandK();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return store;
}

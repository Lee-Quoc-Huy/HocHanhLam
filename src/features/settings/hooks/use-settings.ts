"use client";

import { useEffect } from "react";
import { useSettingsStore } from "../store/settings-store";

export function useSettings() {
  const store = useSettingsStore();

  useEffect(() => {
    store.fetchSettingsData();
  }, []);

  return store;
}

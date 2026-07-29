"use client";

import { useEffect } from "react";
import { useAiCenterStore } from "../store/ai-center-store";
import { aiCenterService } from "../api/ai-center-service";

export function useAiCenter() {
  const store = useAiCenterStore();

  useEffect(() => {
    store.fetchConversations();

    const unsubscribe = aiCenterService.subscribeToRealtime(() => {
      store.fetchConversations();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return store;
}

"use client";

import { useEffect } from "react";
import { useLearningStore } from "../store/learning-store";

export function useLearningGame() {
  const store = useLearningStore();

  useEffect(() => {
    store.fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}

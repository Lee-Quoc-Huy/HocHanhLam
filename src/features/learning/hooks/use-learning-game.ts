"use client";

import { useEffect } from "react";
import { useLearningStore } from "../store/learning-store";

export function useLearningGame() {
  const store = useLearningStore();

  useEffect(() => {
    store.fetchUserData();
  }, []);

  return store;
}

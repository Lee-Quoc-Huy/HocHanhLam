"use client";

import { useEffect } from "react";
import {
  useFlashcardStore,
  selectFilteredFlashcards,
  selectFlashcardStats,
} from "../store/flashcard-store";
import { flashcardService } from "../api/flashcard-service";

export function useFlashcards() {
  const store = useFlashcardStore();

  useEffect(() => {
    store.fetchData();

    const unsubscribe = flashcardService.subscribeToRealtime(() => {
      store.fetchData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredCards = selectFilteredFlashcards(store.cards, store.filter);
  const stats = selectFlashcardStats(store.cards, store.collections);

  return {
    ...store,
    filteredCards,
    stats,
  };
}

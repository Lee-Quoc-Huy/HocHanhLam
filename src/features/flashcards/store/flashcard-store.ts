"use client";

import { create } from "zustand";
import {
  Flashcard,
  FlashcardCollection,
  FlashcardFolder,
  FlashcardFilter,
  CreateFlashcardInput,
  UpdateFlashcardInput,
  FlashcardStats,
} from "../types";
import { flashcardService } from "../api/flashcard-service";
import { SRSRating } from "../lib/srs-algorithm";

export type ActiveTab =
  | "review"
  | "quiz"
  | "spelling"
  | "reflex"
  | "blank"
  | "listening"
  | "browse"
  | "decks";

interface FlashcardState {
  cards: Flashcard[];
  collections: FlashcardCollection[];
  folders: FlashcardFolder[];
  isLoading: boolean;
  error: string | null;

  activeTab: ActiveTab;
  filter: FlashcardFilter;

  // Review Queue state
  reviewQueue: Flashcard[];
  currentReviewIndex: number;
  isCardFlipped: boolean;
  isProcessingReview: boolean; // Atomic lock against card jump bugs
  reviewedCountToday: number;

  // Modals
  isCardFormOpen: boolean;
  selectedCardForEdit: Flashcard | null;
  selectedCardForDelete: Flashcard | null;
  isFolderModalOpen: boolean;
  isDeckModalOpen: boolean;

  // Actions
  fetchData: () => Promise<void>;
  createCard: (input: CreateFlashcardInput) => Promise<Flashcard>;
  updateCard: (id: string, updates: UpdateFlashcardInput) => Promise<Flashcard>;
  deleteCard: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  submitReview: (rating: SRSRating) => Promise<void>;
  flipCard: () => void;
  nextReviewCard: () => void;
  prevReviewCard: () => void;
  startReviewSession: (cardsToReview?: Flashcard[]) => void;

  createFolder: (name: string, description: string) => Promise<void>;
  createCollection: (name: string, description: string, language: any, folderId?: string) => Promise<void>;

  setActiveTab: (tab: ActiveTab) => void;
  setFilter: (updates: Partial<FlashcardFilter>) => void;
  resetFilter: () => void;

  openCreateCardModal: () => void;
  openEditCardModal: (card: Flashcard) => void;
  openDeleteCardModal: (card: Flashcard) => void;
  openFolderModal: () => void;
  openDeckModal: () => void;
  closeModals: () => void;
}

const initialFilter: FlashcardFilter = {
  search: "",
  language: "all",
  folderId: "all",
  collectionId: "all",
  dueOnly: false,
  onlyFavorites: false,
};

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  cards: [],
  collections: [],
  folders: [],
  isLoading: false,
  error: null,

  activeTab: "review",
  filter: initialFilter,

  reviewQueue: [],
  currentReviewIndex: 0,
  isCardFlipped: false,
  isProcessingReview: false,
  reviewedCountToday: 0,

  isCardFormOpen: false,
  selectedCardForEdit: null,
  selectedCardForDelete: null,
  isFolderModalOpen: false,
  isDeckModalOpen: false,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [cards, collections, folders] = await Promise.all([
        flashcardService.fetchFlashcards(),
        flashcardService.fetchCollections(),
        flashcardService.fetchFolders(),
      ]);

      set({ cards, collections, folders, isLoading: false });

      // Auto populate review queue with due cards if empty
      const now = new Date().toISOString();
      const dueCards = cards.filter((c) => c.due_date <= now || c.status === "new");
      set({ reviewQueue: dueCards.length > 0 ? dueCards : cards });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  createCard: async (input) => {
    const newCard = await flashcardService.createFlashcard(input);
    set((state) => ({
      cards: [newCard, ...state.cards],
      reviewQueue: [newCard, ...state.reviewQueue],
    }));
    return newCard;
  },

  updateCard: async (id, updates) => {
    const updated = await flashcardService.updateFlashcard(id, updates);
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? updated : c)),
      reviewQueue: state.reviewQueue.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  deleteCard: async (id) => {
    await flashcardService.deleteFlashcard(id);
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      reviewQueue: state.reviewQueue.filter((c) => c.id !== id),
    }));
  },

  toggleFavorite: async (id) => {
    const card = get().cards.find((c) => c.id === id);
    if (!card) return;
    const newStatus = !card.is_favorite;

    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, is_favorite: newStatus } : c)),
      reviewQueue: state.reviewQueue.map((c) => (c.id === id ? { ...c, is_favorite: newStatus } : c)),
    }));

    await flashcardService.updateFlashcard(id, { is_favorite: newStatus });
  },

  submitReview: async (rating) => {
    const { reviewQueue, currentReviewIndex, isProcessingReview } = get();
    if (isProcessingReview) return; // Prevent double execution / card jump bug

    const currentCard = reviewQueue[currentReviewIndex];
    if (!currentCard) return;

    set({ isProcessingReview: true, isCardFlipped: false });

    try {
      const updatedCard = await flashcardService.processReview(currentCard.id, rating);

      set((state) => {
        const nextQueue = state.reviewQueue.map((c) => (c.id === currentCard.id ? updatedCard : c));
        return {
          cards: state.cards.map((c) => (c.id === currentCard.id ? updatedCard : c)),
          reviewQueue: nextQueue,
          reviewedCountToday: state.reviewedCountToday + 1,
          currentReviewIndex: (state.currentReviewIndex + 1) % Math.max(1, nextQueue.length),
        };
      });
    } finally {
      set({ isProcessingReview: false });
    }
  },

  flipCard: () => set((state) => ({ isCardFlipped: !state.isCardFlipped })),

  nextReviewCard: () =>
    set((state) => ({
      isCardFlipped: false,
      currentReviewIndex: (state.currentReviewIndex + 1) % Math.max(1, state.reviewQueue.length),
    })),

  prevReviewCard: () =>
    set((state) => ({
      isCardFlipped: false,
      currentReviewIndex:
        (state.currentReviewIndex - 1 + state.reviewQueue.length) %
        Math.max(1, state.reviewQueue.length),
    })),

  startReviewSession: (cardsToReview) => {
    const targetCards = cardsToReview || get().cards;
    set({
      reviewQueue: targetCards,
      currentReviewIndex: 0,
      isCardFlipped: false,
      activeTab: "review",
    });
  },

  createFolder: async (name, description) => {
    const newFolder = await flashcardService.createFolder(name, description);
    set((state) => ({ folders: [newFolder, ...state.folders] }));
  },

  createCollection: async (name, description, language, folderId) => {
    const newCol = await flashcardService.createCollection(name, description, language, folderId);
    set((state) => ({ collections: [newCol, ...state.collections] }));
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setFilter: (updates) => set((state) => ({ filter: { ...state.filter, ...updates } })),

  resetFilter: () => set({ filter: initialFilter }),

  openCreateCardModal: () => set({ isCardFormOpen: true, selectedCardForEdit: null }),
  openEditCardModal: (card) => set({ isCardFormOpen: true, selectedCardForEdit: card }),
  openDeleteCardModal: (card) => set({ selectedCardForDelete: card }),
  openFolderModal: () => set({ isFolderModalOpen: true }),
  openDeckModal: () => set({ isDeckModalOpen: true }),

  closeModals: () =>
    set({
      isCardFormOpen: false,
      selectedCardForEdit: null,
      selectedCardForDelete: null,
      isFolderModalOpen: false,
      isDeckModalOpen: false,
    }),
}));

// Helper selector to compute stats
export function selectFlashcardStats(cards: Flashcard[], collections: FlashcardCollection[]): FlashcardStats {
  const now = new Date().toISOString();
  return {
    totalCards: cards.length,
    dueToday: cards.filter((c) => c.due_date <= now || c.status === "new").length,
    mastered: cards.filter((c) => c.status === "mastered").length,
    learning: cards.filter((c) => c.status === "learning").length,
    newCards: cards.filter((c) => c.status === "new").length,
    totalDecks: collections.length,
    streakDays: 5,
  };
}

// Selector to filter flashcards
export function selectFilteredFlashcards(cards: Flashcard[], filter: FlashcardFilter): Flashcard[] {
  const now = new Date().toISOString();
  return cards.filter((card) => {
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const matchFront = card.front_text.toLowerCase().includes(q);
      const matchSub = card.front_subtext?.toLowerCase().includes(q);
      const matchBack = card.back_text.toLowerCase().includes(q);
      const matchTags = card.tags.some((t) => t.toLowerCase().includes(q));

      if (!matchFront && !matchSub && !matchBack && !matchTags) return false;
    }

    if (filter.language !== "all" && card.language !== filter.language) return false;
    if (filter.collectionId !== "all" && card.collection_id !== filter.collectionId) return false;
    if (filter.dueOnly && card.due_date > now && card.status !== "new") return false;
    if (filter.onlyFavorites && !card.is_favorite) return false;

    return true;
  });
}

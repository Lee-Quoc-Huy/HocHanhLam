"use client";

import { create } from "zustand";
import {
  VocabularyItem,
  VocabularyFilter,
  CreateVocabularyInput,
  UpdateVocabularyInput,
  VocabularyStats,
} from "../types";
import { vocabularyService } from "../api/vocabulary-service";

export type ViewMode = "grid" | "table" | "flashcards";

interface VocabularyState {
  items: VocabularyItem[];
  isLoading: boolean;
  error: string | null;
  filter: VocabularyFilter;
  viewMode: ViewMode;

  // Modal controls
  isFormModalOpen: boolean;
  selectedItemForEdit: VocabularyItem | null;
  selectedItemForDetail: VocabularyItem | null;
  selectedItemForDelete: VocabularyItem | null;

  // Actions
  fetchItems: () => Promise<void>;
  createItem: (input: CreateVocabularyInput) => Promise<VocabularyItem>;
  updateItem: (id: string, updates: UpdateVocabularyInput) => Promise<VocabularyItem>;
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;

  // UI state setters
  setFilter: (updates: Partial<VocabularyFilter>) => void;
  resetFilter: () => void;
  setViewMode: (mode: ViewMode) => void;
  openCreateModal: () => void;
  openEditModal: (item: VocabularyItem) => void;
  openDetailModal: (item: VocabularyItem) => void;
  openDeleteModal: (item: VocabularyItem) => void;
  closeModals: () => void;
  setItemsFromRealtime: (items: VocabularyItem[]) => void;
}

const initialFilter: VocabularyFilter = {
  search: "",
  language: "all",
  collection: "all",
  difficulty: "all",
  part_of_speech: "all",
  onlyFavorites: false,
};

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  filter: initialFilter,
  viewMode: "grid",

  isFormModalOpen: false,
  selectedItemForEdit: null,
  selectedItemForDetail: null,
  selectedItemForDelete: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await vocabularyService.fetchVocabulary();
      set({ items, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  createItem: async (input) => {
    const newItem = await vocabularyService.createWord(input);
    set((state) => ({ items: [newItem, ...state.items] }));
    return newItem;
  },

  updateItem: async (id, updates) => {
    const updated = await vocabularyService.updateWord(id, updates);
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? updated : item)),
    }));
    return updated;
  },

  deleteItem: async (id) => {
    await vocabularyService.deleteWord(id);
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  toggleFavorite: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;

    // Optimistic UI update
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, is_favorite: !i.is_favorite } : i
      ),
    }));

    await vocabularyService.toggleFavorite(id, item.is_favorite);
  },

  setFilter: (updates) =>
    set((state) => ({ filter: { ...state.filter, ...updates } })),

  resetFilter: () => set({ filter: initialFilter }),

  setViewMode: (mode) => set({ viewMode: mode }),

  openCreateModal: () =>
    set({ isFormModalOpen: true, selectedItemForEdit: null }),

  openEditModal: (item) =>
    set({ isFormModalOpen: true, selectedItemForEdit: item }),

  openDetailModal: (item) => set({ selectedItemForDetail: item }),

  openDeleteModal: (item) => set({ selectedItemForDelete: item }),

  closeModals: () =>
    set({
      isFormModalOpen: false,
      selectedItemForEdit: null,
      selectedItemForDetail: null,
      selectedItemForDelete: null,
    }),

  setItemsFromRealtime: (items) => set({ items }),
}));

// Helper selector to compute stats
export function selectVocabularyStats(items: VocabularyItem[]): VocabularyStats {
  const collectionsSet = new Set(items.map((i) => i.collection).filter(Boolean));
  return {
    total: items.length,
    enCount: items.filter((i) => i.language === "en").length,
    koCount: items.filter((i) => i.language === "ko").length,
    zhCount: items.filter((i) => i.language === "zh").length,
    favoritesCount: items.filter((i) => i.is_favorite).length,
    collectionsCount: collectionsSet.size,
  };
}

// Selector to filter items according to active search and filters
export function selectFilteredVocabulary(
  items: VocabularyItem[],
  filter: VocabularyFilter
): VocabularyItem[] {
  return items.filter((item) => {
    // Search query check (word, ipa/pinyin, vietnamese, english_meaning, example, collection)
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const matchesWord = item.word.toLowerCase().includes(q);
      const matchesIpa = item.ipa.toLowerCase().includes(q);
      const matchesVietnamese = item.vietnamese.toLowerCase().includes(q);
      const matchesEnglish = item.english_meaning.toLowerCase().includes(q);
      const matchesExample = item.example.toLowerCase().includes(q);
      const matchesCollection = item.collection.toLowerCase().includes(q);
      const matchesSynonyms = item.synonyms.some((s) => s.toLowerCase().includes(q));

      if (
        !matchesWord &&
        !matchesIpa &&
        !matchesVietnamese &&
        !matchesEnglish &&
        !matchesExample &&
        !matchesCollection &&
        !matchesSynonyms
      ) {
        return false;
      }
    }

    // Language filter
    if (filter.language !== "all" && item.language !== filter.language) {
      return false;
    }

    // Collection filter
    if (filter.collection !== "all" && item.collection !== filter.collection) {
      return false;
    }

    // Difficulty filter
    if (filter.difficulty !== "all" && item.difficulty !== filter.difficulty) {
      return false;
    }

    // Part of speech filter
    if (filter.part_of_speech !== "all" && item.part_of_speech !== filter.part_of_speech) {
      return false;
    }

    // Favorites only filter
    if (filter.onlyFavorites && !item.is_favorite) {
      return false;
    }

    return true;
  });
}

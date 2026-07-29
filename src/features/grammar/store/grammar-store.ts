"use client";

import { create } from "zustand";
import {
  GrammarItem,
  GrammarFilter,
  CreateGrammarInput,
  UpdateGrammarInput,
  GrammarStats,
} from "../types";
import { grammarService } from "../api/grammar-service";

export type ViewMode = "grid" | "table";

interface GrammarState {
  items: GrammarItem[];
  isLoading: boolean;
  error: string | null;
  filter: GrammarFilter;
  viewMode: ViewMode;

  // Modal controls
  isFormModalOpen: boolean;
  selectedItemForEdit: GrammarItem | null;
  selectedItemForDetail: GrammarItem | null;
  selectedItemForDelete: GrammarItem | null;
  selectedItemForAi: GrammarItem | null;

  // Actions
  fetchItems: () => Promise<void>;
  createItem: (input: CreateGrammarInput) => Promise<GrammarItem>;
  updateItem: (id: string, updates: UpdateGrammarInput) => Promise<GrammarItem>;
  deleteItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  generateAiExplanation: (item: GrammarItem) => Promise<string>;

  // UI State setters
  setFilter: (updates: Partial<GrammarFilter>) => void;
  resetFilter: () => void;
  setViewMode: (mode: ViewMode) => void;
  openCreateModal: () => void;
  openEditModal: (item: GrammarItem) => void;
  openDetailModal: (item: GrammarItem) => void;
  openDeleteModal: (item: GrammarItem) => void;
  openAiModal: (item: GrammarItem) => void;
  closeModals: () => void;
  setItemsFromRealtime: (items: GrammarItem[]) => void;
}

const initialFilter: GrammarFilter = {
  search: "",
  language: "all",
  category: "all",
  difficulty: "all",
  onlyFavorites: false,
};

export const useGrammarStore = create<GrammarState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  filter: initialFilter,
  viewMode: "grid",

  isFormModalOpen: false,
  selectedItemForEdit: null,
  selectedItemForDetail: null,
  selectedItemForDelete: null,
  selectedItemForAi: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await grammarService.fetchGrammar();
      set({ items, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  createItem: async (input) => {
    const newItem = await grammarService.createGrammar(input);
    set((state) => ({ items: [newItem, ...state.items] }));
    return newItem;
  },

  updateItem: async (id, updates) => {
    const updated = await grammarService.updateGrammar(id, updates);
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? updated : item)),
    }));
    return updated;
  },

  deleteItem: async (id) => {
    await grammarService.deleteGrammar(id);
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  toggleFavorite: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;

    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, is_favorite: !i.is_favorite } : i
      ),
    }));

    await grammarService.toggleFavorite(id, item.is_favorite);
  },

  generateAiExplanation: async (item) => {
    const explanation = await grammarService.requestAiExplanation(item);
    set((state) => ({
      items: state.items.map((i) =>
        i.id === item.id ? { ...i, ai_explanation: explanation } : i
      ),
    }));
    return explanation;
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

  openAiModal: (item) => set({ selectedItemForAi: item }),

  closeModals: () =>
    set({
      isFormModalOpen: false,
      selectedItemForEdit: null,
      selectedItemForDetail: null,
      selectedItemForDelete: null,
      selectedItemForAi: null,
    }),

  setItemsFromRealtime: (items) => set({ items }),
}));

// Helper selector to compute stats
export function selectGrammarStats(items: GrammarItem[]): GrammarStats {
  const categoriesSet = new Set(items.map((i) => i.category).filter(Boolean));
  return {
    total: items.length,
    enCount: items.filter((i) => i.language === "en").length,
    koCount: items.filter((i) => i.language === "ko").length,
    zhCount: items.filter((i) => i.language === "zh").length,
    favoritesCount: items.filter((i) => i.is_favorite).length,
    categoriesCount: categoriesSet.size,
  };
}

// Selector to filter items according to active search and filters
export function selectFilteredGrammar(
  items: GrammarItem[],
  filter: GrammarFilter
): GrammarItem[] {
  return items.filter((item) => {
    // Search query check
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesMeaning = item.meaning.toLowerCase().includes(q);
      const matchesExplanation = item.explanation.toLowerCase().includes(q);
      const matchesCategory = item.category.toLowerCase().includes(q);
      const matchesExamples = item.examples?.some(
        (ex) =>
          ex.example.toLowerCase().includes(q) ||
          ex.translation.toLowerCase().includes(q)
      );

      if (
        !matchesTitle &&
        !matchesMeaning &&
        !matchesExplanation &&
        !matchesCategory &&
        !matchesExamples
      ) {
        return false;
      }
    }

    // Language filter
    if (filter.language !== "all" && item.language !== filter.language) {
      return false;
    }

    // Category filter
    if (filter.category !== "all" && item.category !== filter.category) {
      return false;
    }

    // Difficulty filter
    if (filter.difficulty !== "all" && item.difficulty !== filter.difficulty) {
      return false;
    }

    // Favorites only filter
    if (filter.onlyFavorites && !item.is_favorite) {
      return false;
    }

    return true;
  });
}

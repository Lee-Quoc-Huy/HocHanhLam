"use client";

import { create } from "zustand";
import {
  SearchResultItem,
  SearchHistoryItem,
  SearchFilter,
  SearchDomain,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
} from "../types";
import { searchService } from "../api/search-service";

interface SearchState {
  filter: SearchFilter;
  results: SearchResultItem[];
  autocompleteSuggestions: string[];
  history: SearchHistoryItem[];

  knowledgeNodes: KnowledgeGraphNode[];
  knowledgeEdges: KnowledgeGraphEdge[];

  isSearching: boolean;
  isCommandKOpen: boolean;
  activeView: "results" | "knowledge_graph";
  error: string | null;

  // Actions
  fetchHistory: () => Promise<void>;
  setFilter: (updates: Partial<SearchFilter>) => void;
  executeSearch: (queryToSearch?: string) => Promise<void>;
  fetchAutocomplete: (query: string) => Promise<void>;
  clearHistory: () => Promise<void>;

  setCommandKOpen: (open: boolean) => void;
  toggleCommandK: () => void;
  setActiveView: (view: "results" | "knowledge_graph") => void;
}

const initialFilter: SearchFilter = {
  query: "",
  domain: "all",
  language: "all",
  minScore: 50,
};

export const useSearchStore = create<SearchState>((set, get) => ({
  filter: initialFilter,
  results: [],
  autocompleteSuggestions: [],
  history: [],

  knowledgeNodes: searchService.getKnowledgeGraphData().nodes,
  knowledgeEdges: searchService.getKnowledgeGraphData().edges,

  isSearching: false,
  isCommandKOpen: false,
  activeView: "results",
  error: null,

  fetchHistory: async () => {
    try {
      const history = await searchService.fetchSearchHistory();
      set({ history });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  setFilter: (updates) =>
    set((state) => ({
      filter: { ...state.filter, ...updates },
    })),

  executeSearch: async (queryToSearch) => {
    const q = queryToSearch !== undefined ? queryToSearch : get().filter.query;
    if (!q.trim()) return;

    set({ isSearching: true, error: null, filter: { ...get().filter, query: q } });

    try {
      const results = await searchService.executeSearch(
        q,
        get().filter.domain,
        get().filter.language
      );

      const history = await searchService.fetchSearchHistory();

      set({
        results,
        history,
        isSearching: false,
        autocompleteSuggestions: [],
      });
    } catch (err) {
      set({ error: (err as Error).message, isSearching: false });
    }
  },

  fetchAutocomplete: async (query) => {
    if (!query.trim()) {
      set({ autocompleteSuggestions: [] });
      return;
    }
    const suggestions = await searchService.fetchAutocomplete(query);
    set({ autocompleteSuggestions: suggestions });
  },

  clearHistory: async () => {
    await searchService.clearSearchHistory();
    set({ history: [] });
  },

  setCommandKOpen: (open) => set({ isCommandKOpen: open }),
  toggleCommandK: () => set((state) => ({ isCommandKOpen: !state.isCommandKOpen })),

  setActiveView: (view) => set({ activeView: view }),
}));

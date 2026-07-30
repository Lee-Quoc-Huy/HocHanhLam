"use client";

import { create } from "zustand";
import {
  LibraryItem,
  LibraryFolder,
  LibraryCollection,
  ItemVersion,
  LibraryFilter,
  CreateItemInput,
  UpdateItemInput,
} from "../types";
import { libraryService } from "../api/library-service";

interface LibraryState {
  items: LibraryItem[];
  folders: LibraryFolder[];
  collections: LibraryCollection[];

  activeItem: LibraryItem | null;
  activeVersions: ItemVersion[];
  selectedItemForDelete: LibraryItem | null;

  filter: LibraryFilter;

  isLoading: boolean;
  isCreateNoteOpen: boolean;
  isCreateFolderOpen: boolean;
  isVersionHistoryOpen: boolean;
  error: string | null;

  // Actions
  fetchLibraryData: () => Promise<void>;

  createItem: (input: CreateItemInput) => Promise<LibraryItem>;
  updateItem: (id: string, updates: UpdateItemInput) => Promise<LibraryItem>;
  trashItem: (id: string) => Promise<void>;
  restoreItem: (id: string) => Promise<void>;
  deleteItemPermanently: (id: string) => Promise<void>;
  toggleFavorite: (id: string, current: boolean) => Promise<void>;

  createFolder: (name: string, color?: string) => Promise<LibraryFolder>;

  fetchVersions: (itemId: string) => Promise<void>;
  rollbackVersion: (version: ItemVersion) => Promise<void>;

  selectItemForView: (item: LibraryItem) => void;
  openDeleteModal: (item: LibraryItem) => void;
  closeModals: () => void;

  setFilter: (updates: Partial<LibraryFilter>) => void;
  resetFilter: () => void;

  setCreateNoteOpen: (open: boolean) => void;
  setCreateFolderOpen: (open: boolean) => void;
  setVersionHistoryOpen: (open: boolean) => void;
}

const initialFilter: LibraryFilter = {
  search: "",
  itemType: "all",
  folderId: null,
  collectionId: null,
  tag: null,
  favoritesOnly: false,
  trashedOnly: false,
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
  items: [],
  folders: [],
  collections: [],

  activeItem: null,
  activeVersions: [],
  selectedItemForDelete: null,

  filter: initialFilter,

  isLoading: false,
  isCreateNoteOpen: false,
  isCreateFolderOpen: false,
  isVersionHistoryOpen: false,
  error: null,

  fetchLibraryData: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await libraryService.fetchItems();
      const folders = await libraryService.fetchFolders();
      const collections = await libraryService.fetchCollections();
      set({ items, folders, collections, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  createItem: async (input) => {
    const newItem = await libraryService.createItem(input);
    set((state) => ({ items: [newItem, ...state.items] }));
    return newItem;
  },

  updateItem: async (id, updates) => {
    const updated = await libraryService.updateItem(id, updates);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? updated : i)),
      activeItem: state.activeItem?.id === id ? updated : state.activeItem,
    }));
    return updated;
  },

  trashItem: async (id) => {
    await libraryService.trashItem(id);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, is_trashed: true } : i)),
      activeItem: state.activeItem?.id === id ? null : state.activeItem,
    }));
  },

  restoreItem: async (id) => {
    await libraryService.restoreItem(id);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, is_trashed: false } : i)),
    }));
  },

  deleteItemPermanently: async (id) => {
    await libraryService.deleteItemPermanently(id);
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      activeItem: state.activeItem?.id === id ? null : state.activeItem,
    }));
  },

  toggleFavorite: async (id, current) => {
    const next = await libraryService.toggleFavorite(id, current);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, is_favorite: next } : i)),
      activeItem: state.activeItem?.id === id ? { ...state.activeItem, is_favorite: next } : state.activeItem,
    }));
  },

  createFolder: async (name, color = "#10b981") => {
    const folder = await libraryService.createFolder(name, color);
    set((state) => ({ folders: [folder, ...state.folders] }));
    return folder;
  },

  fetchVersions: async (itemId) => {
    const versions = await libraryService.fetchVersions(itemId);
    set({ activeVersions: versions });
  },

  rollbackVersion: async (ver) => {
    if (!get().activeItem) return;
    await get().updateItem(get().activeItem!.id, {
      title: ver.title,
      content_text: ver.content_text,
    });
    set({ isVersionHistoryOpen: false });
  },

  selectItemForView: (item) => {
    set({ activeItem: item });
    get().fetchVersions(item.id);
  },

  openDeleteModal: (item) => set({ selectedItemForDelete: item }),

  closeModals: () =>
    set({
      activeItem: null,
      selectedItemForDelete: null,
      isCreateNoteOpen: false,
      isCreateFolderOpen: false,
      isVersionHistoryOpen: false,
    }),

  setFilter: (updates) => set((state) => ({ filter: { ...state.filter, ...updates } })),
  resetFilter: () => set({ filter: initialFilter }),

  setCreateNoteOpen: (open) => set({ isCreateNoteOpen: open }),
  setCreateFolderOpen: (open) => set({ isCreateFolderOpen: open }),
  setVersionHistoryOpen: (open) => set({ isVersionHistoryOpen: open }),
}));

// Selector to filter items
export function selectFilteredLibraryItems(items: LibraryItem[], filter: LibraryFilter): LibraryItem[] {
  return items.filter((item) => {
    // Trash filter
    if (filter.trashedOnly) {
      if (!item.is_trashed) return false;
    } else {
      if (item.is_trashed) return false;
    }

    // Favorites filter
    if (filter.favoritesOnly && !item.is_favorite) return false;

    // Item Type filter
    if (filter.itemType !== "all" && item.item_type !== filter.itemType) return false;

    // Folder filter
    if (filter.folderId && item.folder_id !== filter.folderId) return false;

    // Search query filter
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchContent = item.content_text.toLowerCase().includes(q);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }

    return true;
  });
}

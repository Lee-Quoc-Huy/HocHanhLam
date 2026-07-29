"use client";

import { useEffect } from "react";
import {
  useVocabularyStore,
  selectFilteredVocabulary,
  selectVocabularyStats,
} from "../store/vocabulary-store";
import { vocabularyService } from "../api/vocabulary-service";

export function useVocabulary() {
  const {
    items,
    isLoading,
    error,
    filter,
    viewMode,
    isFormModalOpen,
    selectedItemForEdit,
    selectedItemForDetail,
    selectedItemForDelete,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    setFilter,
    resetFilter,
    setViewMode,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    closeModals,
    setItemsFromRealtime,
  } = useVocabularyStore();

  // Load items on mount & subscribe to realtime changes
  useEffect(() => {
    fetchItems();

    const unsubscribe = vocabularyService.subscribeToRealtime((freshItems) => {
      setItemsFromRealtime(freshItems);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchItems, setItemsFromRealtime]);

  const filteredItems = selectFilteredVocabulary(items, filter);
  const stats = selectVocabularyStats(items);

  // Extract all distinct collections available in dataset
  const availableCollections = Array.from(
    new Set(items.map((i) => i.collection).filter(Boolean))
  );

  return {
    items: filteredItems,
    allItems: items,
    stats,
    isLoading,
    error,
    filter,
    viewMode,
    availableCollections,
    isFormModalOpen,
    selectedItemForEdit,
    selectedItemForDetail,
    selectedItemForDelete,
    createItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    setFilter,
    resetFilter,
    setViewMode,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    closeModals,
  };
}

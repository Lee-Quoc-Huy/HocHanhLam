"use client";

import { useEffect } from "react";
import {
  useGrammarStore,
  selectFilteredGrammar,
  selectGrammarStats,
} from "../store/grammar-store";
import { grammarService } from "../api/grammar-service";

export function useGrammar() {
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
    selectedItemForAi,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    generateAiExplanation,
    setFilter,
    resetFilter,
    setViewMode,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openAiModal,
    closeModals,
    setItemsFromRealtime,
  } = useGrammarStore();

  useEffect(() => {
    fetchItems();

    const unsubscribe = grammarService.subscribeToRealtime((freshItems) => {
      setItemsFromRealtime(freshItems);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchItems, setItemsFromRealtime]);

  const filteredItems = selectFilteredGrammar(items, filter);
  const stats = selectGrammarStats(items);

  const availableCategories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  );

  return {
    items: filteredItems,
    allItems: items,
    stats,
    isLoading,
    error,
    filter,
    viewMode,
    availableCategories,
    isFormModalOpen,
    selectedItemForEdit,
    selectedItemForDetail,
    selectedItemForDelete,
    selectedItemForAi,
    createItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    generateAiExplanation,
    setFilter,
    resetFilter,
    setViewMode,
    openCreateModal,
    openEditModal,
    openDetailModal,
    openDeleteModal,
    openAiModal,
    closeModals,
  };
}

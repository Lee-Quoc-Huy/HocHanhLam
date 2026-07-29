"use client";

import { useVocabulary } from "@/features/vocabulary/hooks/use-vocabulary";
import { VocabularyHeader } from "@/features/vocabulary/components/vocabulary-header";
import { VocabularyFilters } from "@/features/vocabulary/components/vocabulary-filters";
import { VocabularyGrid } from "@/features/vocabulary/components/vocabulary-grid";
import { VocabularyTable } from "@/features/vocabulary/components/vocabulary-table";
import { VocabularyFormModal } from "@/features/vocabulary/components/vocabulary-form-modal";
import { VocabularyDetailModal } from "@/features/vocabulary/components/vocabulary-detail-modal";
import { VocabularyFlashcards } from "@/features/vocabulary/components/vocabulary-flashcards";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

export default function VocabularyPage() {
  const {
    items,
    stats,
    isLoading,
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
  } = useVocabulary();

  const handleFormSubmit = async (input: any) => {
    if (selectedItemForEdit) {
      await updateItem(selectedItemForEdit.id, input);
    } else {
      await createItem(input);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedItemForDelete) {
      await deleteItem(selectedItemForDelete.id);
      closeModals();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <VocabularyHeader
        stats={stats}
        onOpenCreateModal={openCreateModal}
        onOpenFlashcards={() => setViewMode("flashcards")}
      />

      {/* Mode Render: Flashcards or List/Grid */}
      {viewMode === "flashcards" ? (
        <VocabularyFlashcards
          items={items}
          onToggleFavorite={toggleFavorite}
          onExit={() => setViewMode("grid")}
        />
      ) : (
        <>
          {/* Filters & Search */}
          <VocabularyFilters
            filter={filter}
            availableCollections={availableCollections}
            viewMode={viewMode}
            onFilterChange={setFilter}
            onResetFilter={resetFilter}
            onViewModeChange={setViewMode}
          />

          {/* View Modes: Grid or Table */}
          {viewMode === "grid" ? (
            <VocabularyGrid
              items={items}
              isLoading={isLoading}
              onToggleFavorite={toggleFavorite}
              onOpenDetail={openDetailModal}
              onOpenEdit={openEditModal}
              onOpenDelete={openDeleteModal}
              onOpenCreate={openCreateModal}
            />
          ) : (
            <VocabularyTable
              items={items}
              onToggleFavorite={toggleFavorite}
              onOpenDetail={openDetailModal}
              onOpenEdit={openEditModal}
              onOpenDelete={openDeleteModal}
            />
          )}
        </>
      )}

      {/* Form Modal (Create / Edit) */}
      <VocabularyFormModal
        isOpen={isFormModalOpen}
        itemToEdit={selectedItemForEdit}
        availableCollections={availableCollections}
        onClose={closeModals}
        onSubmit={handleFormSubmit}
      />

      {/* Detail Modal */}
      <VocabularyDetailModal
        item={selectedItemForDetail}
        onClose={closeModals}
        onEdit={openEditModal}
        onToggleFavorite={toggleFavorite}
        onDelete={openDeleteModal}
      />

      {/* Delete Confirmation Modal */}
      <Dialog.Root
        open={!!selectedItemForDelete}
        onOpenChange={(open) => !open && closeModals()}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-xl animate-in zoom-in-95">
            <Dialog.Title className="font-display text-lg font-bold text-foreground">
              Xác Nhận Xóa Từ Vựng
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa từ{" "}
              <span className="font-bold text-foreground">
                &quot;{selectedItemForDelete?.word}&quot;
              </span>
              ? Thao tác này không thể hoàn tác.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={closeModals}>
                Hủy Bỏ
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Xóa Từ
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

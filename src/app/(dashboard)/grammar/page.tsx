"use client";

import { useGrammar } from "@/features/grammar/hooks/use-grammar";
import { GrammarHeader } from "@/features/grammar/components/grammar-header";
import { GrammarFilters } from "@/features/grammar/components/grammar-filters";
import { GrammarGrid } from "@/features/grammar/components/grammar-grid";
import { GrammarTable } from "@/features/grammar/components/grammar-table";
import { GrammarFormModal } from "@/features/grammar/components/grammar-form-modal";
import { GrammarDetailModal } from "@/features/grammar/components/grammar-detail-modal";
import { GrammarAiModal } from "@/features/grammar/components/grammar-ai-modal";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

export default function GrammarPage() {
  const {
    items,
    stats,
    isLoading,
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
  } = useGrammar();

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
      {/* Header */}
      <GrammarHeader stats={stats} onOpenCreateModal={openCreateModal} />

      {/* Filters */}
      <GrammarFilters
        filter={filter}
        availableCategories={availableCategories}
        viewMode={viewMode}
        onFilterChange={setFilter}
        onResetFilter={resetFilter}
        onViewModeChange={setViewMode}
      />

      {/* View Mode: Grid or Table */}
      {viewMode === "grid" ? (
        <GrammarGrid
          items={items}
          isLoading={isLoading}
          onToggleFavorite={toggleFavorite}
          onOpenDetail={openDetailModal}
          onOpenEdit={openEditModal}
          onOpenDelete={openDeleteModal}
          onOpenAiModal={openAiModal}
          onOpenCreate={openCreateModal}
        />
      ) : (
        <GrammarTable
          items={items}
          onToggleFavorite={toggleFavorite}
          onOpenDetail={openDetailModal}
          onOpenEdit={openEditModal}
          onOpenDelete={openDeleteModal}
          onOpenAiModal={openAiModal}
        />
      )}

      {/* Form Modal (Create / Edit) */}
      <GrammarFormModal
        isOpen={isFormModalOpen}
        itemToEdit={selectedItemForEdit}
        availableCategories={availableCategories}
        onClose={closeModals}
        onSubmit={handleFormSubmit}
      />

      {/* Detail Modal */}
      <GrammarDetailModal
        item={selectedItemForDetail}
        onClose={closeModals}
        onEdit={openEditModal}
        onToggleFavorite={toggleFavorite}
        onDelete={openDeleteModal}
        onOpenAiModal={openAiModal}
      />

      {/* AI Explanation Modal */}
      <GrammarAiModal
        item={selectedItemForAi}
        onClose={closeModals}
        onGenerateAi={generateAiExplanation}
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
              Xác Nhận Xóa Cấu Trúc Ngữ Pháp
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa ngữ pháp{" "}
              <span className="font-bold text-foreground">
                &quot;{selectedItemForDelete?.title}&quot;
              </span>
              ? Thao tác này không thể hoàn tác.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={closeModals}>
                Hủy Bỏ
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Xóa Cấu Trúc
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

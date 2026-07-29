"use client";

import { useDocuments } from "@/features/documents/hooks/use-documents";
import { DocumentHeader } from "@/features/documents/components/document-header";
import { DocumentUploadDropzone } from "@/features/documents/components/document-upload-dropzone";
import { DocumentGrid } from "@/features/documents/components/document-grid";
import { DocumentViewerModal } from "@/features/documents/components/document-viewer-modal";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw } from "lucide-react";

export default function DocumentsPage() {
  const {
    filteredDocuments,
    stats,
    filter,
    activeDocument,
    selectedDocumentForDelete,
    isAiProcessing,
    aiProcessingTask,
    translatedText,
    minedVocabulary,
    generatedFlashcards,
    activeQuiz,
    deleteDocument,
    runAiOcr,
    runAiTranslate,
    runAiVocabularyExtraction,
    runAiFlashcardGeneration,
    runAiQuizGeneration,
    selectDocumentForView,
    openDeleteModal,
    closeModals,
    setFilter,
    resetFilter,
    handleUploadFiles,
    handleDownloadDoc,
  } = useDocuments();

  const handleDeleteConfirm = async () => {
    if (selectedDocumentForDelete) {
      await deleteDocument(selectedDocumentForDelete.id);
      closeModals();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Stats */}
      <DocumentHeader stats={stats} />

      {/* Upload Dropzone & Clipboard Paste */}
      <DocumentUploadDropzone onUpload={handleUploadFiles} />

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-xl border border-border/80 bg-surface/80 p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            placeholder="Tìm kiếm tài liệu theo tên, nội dung trích xuất..."
            className="pl-9 bg-background/80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filter.fileType}
            onChange={(e) => setFilter({ fileType: e.target.value as any })}
            className="h-9 rounded-md border border-border bg-background px-3 font-medium text-foreground outline-none"
          >
            <option value="all">Tất Cả Loại Tệp</option>
            <option value="pdf">PDF / Sách</option>
            <option value="docx">Word (DOCX)</option>
            <option value="ppt">PowerPoint (PPT)</option>
            <option value="txt">Văn Bản (TXT)</option>
            <option value="image">Hình Ảnh</option>
            <option value="screenshot">Ảnh Màn Hình</option>
          </select>

          {(filter.search || filter.fileType !== "all") && (
            <Button variant="ghost" size="sm" onClick={resetFilter} className="gap-1 text-xs">
              <RotateCcw className="size-3" /> Đặt Lại
            </Button>
          )}
        </div>
      </div>

      {/* Document Cards Grid */}
      <DocumentGrid
        documents={filteredDocuments}
        onOpenViewer={selectDocumentForView}
        onDownload={handleDownloadDoc}
        onOpenDelete={openDeleteModal}
      />

      {/* AI Center Document Viewer & Actions Modal */}
      <DocumentViewerModal
        document={activeDocument}
        isAiProcessing={isAiProcessing}
        aiTaskName={aiProcessingTask}
        translatedText={translatedText}
        minedVocabulary={minedVocabulary}
        generatedFlashcards={generatedFlashcards}
        activeQuiz={activeQuiz}
        onClose={closeModals}
        onRunOcr={runAiOcr}
        onRunTranslate={runAiTranslate}
        onRunVocabulary={runAiVocabularyExtraction}
        onRunFlashcards={runAiFlashcardGeneration}
        onRunQuiz={runAiQuizGeneration}
        onDownload={handleDownloadDoc}
      />

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={!!selectedDocumentForDelete} onOpenChange={(open) => !open && closeModals()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-xl animate-in zoom-in-95">
            <Dialog.Title className="font-display text-lg font-bold text-foreground">
              Xác Nhận Xóa Tài Liệu
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa tài liệu &quot;{selectedDocumentForDelete?.title}&quot;? Thao tác này không thể hoàn tác.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={closeModals}>Hủy Bỏ</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Xóa Tài Liệu</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

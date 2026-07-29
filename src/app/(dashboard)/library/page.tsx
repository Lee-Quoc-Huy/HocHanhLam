"use client";

import { useLibrary } from "@/features/library/hooks/use-library";
import { LibraryHeader } from "@/features/library/components/library-header";
import { LibraryFolderTree } from "@/features/library/components/library-folder-tree";
import { LibraryItemGrid } from "@/features/library/components/library-item-grid";
import { LibraryDetailModal } from "@/features/library/components/library-detail-modal";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, X, Plus } from "lucide-react";
import { useState, useRef } from "react";

export default function LibraryPage() {
  const {
    items,
    folders,
    collections,
    filteredItems,
    filter,
    activeItem,
    activeVersions,
    isCreateNoteOpen,
    isCreateFolderOpen,
    fetchLibraryData,
    updateItem,
    trashItem,
    restoreItem,
    deleteItemPermanently,
    toggleFavorite,
    createFolder,
    rollbackVersion,
    selectItemForView,
    closeModals,
    setFilter,
    resetFilter,
    setCreateNoteOpen,
    setCreateFolderOpen,
    handleUploadFiles,
    handleCreateNote,
    handleDownload,
    handleGenerateShare,
  } = useLibrary();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Note Modal state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState("GhiChú, IELTS");

  // New Folder Modal state
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#10b981");

  const submitCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noteTitle.trim()) {
      await handleCreateNote(noteTitle, noteContent, noteTags);
      setNoteTitle("");
      setNoteContent("");
    }
  };

  const submitCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      await createFolder(folderName, folderColor);
      setFolderName("");
      setCreateFolderOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.mp3,.wav,.m4a,.mp4,.webm,.png,.jpg,.jpeg,.webp"
        onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
        className="hidden"
      />

      {/* Header Banner & Stats */}
      <LibraryHeader
        items={items}
        trashedOnly={filter.trashedOnly}
        favoritesOnly={filter.favoritesOnly}
        onUploadClick={() => fileInputRef.current?.click()}
        onCreateNoteClick={() => setCreateNoteOpen(true)}
        onCreateFolderClick={() => setCreateFolderOpen(true)}
        onToggleTrashView={() => setFilter({ trashedOnly: !filter.trashedOnly, favoritesOnly: false })}
        onToggleFavoritesView={() => setFilter({ favoritesOnly: !filter.favoritesOnly, trashedOnly: false })}
      />

      {/* Main Content Layout (Sidebar Folder Tree + Item Grid) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Folder Tree */}
        <div className="lg:col-span-1 space-y-4">
          <LibraryFolderTree
            folders={folders}
            collections={collections}
            selectedFolderId={filter.folderId || null}
            onSelectFolder={(fId) => setFilter({ folderId: fId })}
          />
        </div>

        {/* Right Main Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Type Filter Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={filter.search}
                onChange={(e) => setFilter({ search: e.target.value })}
                placeholder="Tìm kiếm tài nguyên theo tên, nội dung, thẻ tag..."
                className="pl-9 bg-background/80"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={filter.itemType}
                onChange={(e) => setFilter({ itemType: e.target.value as any })}
                className="h-9 rounded-md border border-border bg-background px-3 font-medium text-foreground outline-none"
              >
                <option value="all">Tất Cả Định Dạng</option>
                <option value="document">Tài Liệu (PDF/DOCX)</option>
                <option value="audio">Âm Thanh (Audio)</option>
                <option value="video">Video Bài Giảng</option>
                <option value="image">Hình Ảnh</option>
                <option value="note">Ghi Chú</option>
              </select>

              {(filter.search || filter.itemType !== "all" || filter.folderId || filter.favoritesOnly || filter.trashedOnly) && (
                <Button variant="ghost" size="sm" onClick={resetFilter} className="gap-1 text-xs">
                  <RotateCcw className="size-3" /> Đặt Lại
                </Button>
              )}
            </div>
          </div>

          {/* Grid Display */}
          <LibraryItemGrid
            items={filteredItems}
            trashedOnly={filter.trashedOnly}
            onSelectItem={selectItemForView}
            onToggleFavorite={toggleFavorite}
            onTrashItem={trashItem}
            onRestoreItem={restoreItem}
            onPermanentDelete={deleteItemPermanently}
            onDownload={handleDownload}
            onShare={handleGenerateShare}
          />
        </div>
      </div>

      {/* Item Detail Modal */}
      <LibraryDetailModal
        item={activeItem}
        versions={activeVersions}
        onClose={closeModals}
        onUpdate={updateItem}
        onRollback={rollbackVersion}
        onDownload={handleDownload}
        onShare={handleGenerateShare}
      />

      {/* Create Note Modal */}
      <Dialog.Root open={isCreateNoteOpen} onOpenChange={setCreateNoteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <Dialog.Title className="font-display text-lg font-bold text-foreground">
                Tạo Ghi Chú Cá Nhân Mới
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <X className="size-4" />
                </Button>
              </Dialog.Close>
            </div>

            <form onSubmit={submitCreateNote} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tiêu đề ghi chú:</label>
                <Input
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Ví dụ: Ghi Chú Từ Vựng IELTS Listening Part 1"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Thẻ Tags (phân cách bằng dấu phẩy):</label>
                <Input
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  placeholder="IELTS, Listening, Từ Vựng"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Nội dung ghi chú (Markdown):</label>
                <textarea
                  rows={6}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Nhập nội dung ghi chú dạng Markdown..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" onClick={() => setCreateNoteOpen(false)}>Hủy Bỏ</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Tạo Ghi Chú</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Create Folder Modal */}
      <Dialog.Root open={isCreateFolderOpen} onOpenChange={setCreateFolderOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <Dialog.Title className="font-display text-lg font-bold text-foreground">
                Tạo Thư Mục Mới
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <X className="size-4" />
                </Button>
              </Dialog.Close>
            </div>

            <form onSubmit={submitCreateFolder} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Tên thư mục:</label>
                <Input
                  required
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Ví dụ: TOPIK Korean Speaking Clips"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Màu đại diện:</label>
                <div className="flex items-center gap-2">
                  {["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFolderColor(c)}
                      className={`size-7 rounded-full transition-all ${
                        folderColor === c ? "scale-110 ring-2 ring-emerald-500" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-3">
                <Button type="button" variant="outline" onClick={() => setCreateFolderOpen(false)}>Hủy Bỏ</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Tạo Thư Mục</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

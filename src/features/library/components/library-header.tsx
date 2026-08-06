"use client";

import { FolderKanban, Upload, FileText, Music, StickyNote, Trash2, Plus, Star, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryItem } from "../types";

interface LibraryHeaderProps {
  items: LibraryItem[];
  trashedOnly: boolean;
  onUploadClick: () => void;
  onUploadExamClick: () => void;
  onCreateNoteClick: () => void;
  onCreateFolderClick: () => void;
  onToggleTrashView: () => void;
  onToggleFavoritesView: () => void;
  favoritesOnly: boolean;
}

export function LibraryHeader({
  items,
  trashedOnly,
  onUploadClick,
  onUploadExamClick,
  onCreateNoteClick,
  onCreateFolderClick,
  onToggleTrashView,
  onToggleFavoritesView,
  favoritesOnly,
}: LibraryHeaderProps) {
  const activeItems = items.filter((i) => !i.is_trashed);
  const trashedItems = items.filter((i) => i.is_trashed);

  const docCount = activeItems.filter((i) => i.item_type === "document").length;
  const examCount = activeItems.filter((i) => i.item_type === "exam_paper").length;
  const mediaCount = activeItems.filter((i) => i.item_type === "audio" || i.item_type === "video" || i.item_type === "image").length;
  const noteCount = activeItems.filter((i) => i.item_type === "note").length;

  return (
    <div className="space-y-6">
      {/* Title & Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20">
            <FolderKanban className="size-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Thư Viện Tri Thức AI
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Quản lý Thư mục · Tài liệu · Đề thi riêng · File nghe · Ghi chú · Thùng rác
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onUploadExamClick} className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs">
            <FileSpreadsheet className="size-4" /> Upload Đề Thi
          </Button>

          <Button onClick={onUploadClick} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs">
            <Upload className="size-4" /> Tải Tệp Lên
          </Button>

          <Button onClick={onCreateNoteClick} variant="outline" className="gap-1.5 text-xs h-9 rounded-xl">
            <StickyNote className="size-4 text-emerald-600" /> Tạo Ghi Chú
          </Button>

          <Button onClick={onCreateFolderClick} variant="outline" className="gap-1.5 text-xs h-9 rounded-xl">
            <Plus className="size-4" /> Thư Mục Mới
          </Button>

          <Button
            onClick={onToggleFavoritesView}
            variant={favoritesOnly ? "default" : "outline"}
            className={`gap-1.5 text-xs h-9 rounded-xl ${favoritesOnly ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
          >
            <Star className="size-4 text-amber-500 fill-amber-500" /> Yêu Thích
          </Button>

          <Button
            onClick={onToggleTrashView}
            variant={trashedOnly ? "destructive" : "outline"}
            className="gap-1.5 text-xs h-9 rounded-xl"
          >
            <Trash2 className="size-4" /> Thùng Rác ({trashedItems.length})
          </Button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400">
            <FileSpreadsheet className="size-3.5" /> Đề Thi & File Kèm
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-purple-700 dark:text-purple-300">
            {examCount}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <FileText className="size-3.5" /> Tài Liệu & Sách
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {docCount}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
            <Music className="size-3.5" /> Audio / Video / Ảnh
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-blue-700 dark:text-blue-300">
            {mediaCount}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Star className="size-3.5" /> Đã Đánh Dấu Yêu Thích
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-700 dark:text-amber-300">
            {activeItems.filter((i) => i.is_favorite).length}
          </div>
        </div>
      </div>
    </div>
  );
}

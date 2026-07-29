"use client";

import { FolderKanban, FileText, Image as ImageIcon, BookOpen, Layers } from "lucide-react";
import { DocumentStats } from "../types";

interface DocumentHeaderProps {
  stats: DocumentStats;
}

export function DocumentHeader({ stats }: DocumentHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent text-purple-600 dark:text-purple-400 shadow-sm border border-purple-500/20">
            <FolderKanban className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Trung Tâm Tài Liệu AI Center
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Upload PDF · DOCX · PPT · TXT · Ảnh chụp màn hình · Sách · AI OCR & Trích xuất tự động
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400">
            <Layers className="size-3.5" /> Tổng Số Tài Liệu
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-purple-700 dark:text-purple-300">
            {stats.totalDocs}
          </div>
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400">
            <BookOpen className="size-3.5" /> PDF & Sách (EPUB)
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-rose-700 dark:text-rose-300">
            {stats.pdfCount}
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400">
            <ImageIcon className="size-3.5" /> Ảnh & Screenshot
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-blue-700 dark:text-blue-300">
            {stats.imageCount}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <FileText className="size-3.5" /> Text / DOCX / PPT
          </div>
          <div className="mt-1 font-display text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {stats.textCount}
          </div>
        </div>
      </div>
    </div>
  );
}

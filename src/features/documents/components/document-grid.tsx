"use client";

import { FileText, FileCode, Image as ImageIcon, BookOpen, Download, Trash2, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentItem, DocFileType } from "../types";

interface DocumentGridProps {
  documents: DocumentItem[];
  onOpenViewer: (doc: DocumentItem) => void;
  onDownload: (doc: DocumentItem) => void;
  onOpenDelete: (doc: DocumentItem) => void;
}

const FILE_ICON_MAP: Record<DocFileType, any> = {
  pdf: FileText,
  docx: FileText,
  ppt: FileCode,
  txt: FileCode,
  image: ImageIcon,
  screenshot: ImageIcon,
  book: BookOpen,
};

const FILE_COLOR_MAP: Record<DocFileType, string> = {
  pdf: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  docx: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  ppt: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  txt: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  image: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  screenshot: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  book: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
};

export function DocumentGrid({
  documents,
  onOpenViewer,
  onDownload,
  onOpenDelete,
}: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface/40">
        <FileText className="size-10 text-muted-foreground mx-auto mb-3" />
        <h4 className="font-display text-base font-bold text-foreground">Chưa Có Tài Liệu Nào</h4>
        <p className="mt-1 text-xs text-muted-foreground">Kéo thả tệp hoặc bấm Ctrl+V để upload tài liệu đầu tiên của bạn.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => {
        const Icon = FILE_ICON_MAP[doc.file_type] || FileText;
        const colorClass = FILE_COLOR_MAP[doc.file_type] || FILE_COLOR_MAP.txt;

        return (
          <div
            key={doc.id}
            className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${colorClass}`}>
                  <Icon className="size-3.5" />
                  <span>{doc.file_type}</span>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">{doc.file_size}</span>
              </div>

              {/* Title */}
              <h3 className="mt-3.5 font-display text-base font-bold text-foreground line-clamp-2 leading-snug">
                {doc.title}
              </h3>

              {/* Extracted Text Snippet Preview */}
              <p className="mt-2 text-xs text-muted-foreground line-clamp-3 font-mono leading-relaxed bg-background/50 p-2.5 rounded-lg border border-border/40">
                {doc.extracted_text || "Chưa trích xuất văn bản. Nhấp vào Xử lý AI để nhận diện..."}
              </p>
            </div>

            {/* Footer Action Bar */}
            <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3">
              <span className="text-[10px] text-muted-foreground">
                {new Date(doc.created_at).toLocaleDateString("vi-VN")}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={() => onOpenViewer(doc)}
                  className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  <Sparkles className="size-3.5" /> Xem & AI
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => onDownload(doc)}
                  title="Tải về TXT"
                >
                  <Download className="size-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:bg-destructive/10"
                  onClick={() => onOpenDelete(doc)}
                  title="Xóa tài liệu"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

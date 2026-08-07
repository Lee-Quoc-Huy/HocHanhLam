"use client";

import {
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  StickyNote,
  FileSpreadsheet,
  Star,
  Download,
  Share2,
  Trash2,
  RotateCcw,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryItem, LibraryItemType } from "../types";
import { useState } from "react";

interface LibraryItemGridProps {
  items: LibraryItem[];
  trashedOnly: boolean;
  onSelectItem: (item: LibraryItem) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTrashItem: (id: string) => void;
  onRestoreItem: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onDownload: (item: LibraryItem) => void;
  onShare: (item: LibraryItem) => string;
}

const TYPE_ICON_MAP: Record<LibraryItemType, any> = {
  document: FileText,
  audio: Music,
  video: Video,
  image: ImageIcon,
  note: StickyNote,
  exam_paper: FileSpreadsheet,
};

const TYPE_LABEL_MAP: Record<LibraryItemType, string> = {
  document: "Tài Liệu",
  audio: "Âm Thanh",
  video: "Video",
  image: "Hình Ảnh",
  note: "Ghi Chú",
  exam_paper: "Đề Thi",
};

const TYPE_COLOR_MAP: Record<LibraryItemType, string> = {
  document: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  audio: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  video: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  image: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  note: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  exam_paper: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

export function LibraryItemGrid({
  items,
  trashedOnly,
  onSelectItem,
  onToggleFavorite,
  onTrashItem,
  onRestoreItem,
  onPermanentDelete,
  onDownload,
  onShare,
}: LibraryItemGridProps) {
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const handleShareClick = (item: LibraryItem) => {
    onShare(item);
    setCopiedShareId(item.id);
    setTimeout(() => setCopiedShareId(null), 3000);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-surface/50 backdrop-blur-md">
        <FileText className="size-12 text-muted-foreground/60 mx-auto mb-3" />
        <h4 className="font-display text-base font-bold text-foreground">
          {trashedOnly ? "Thùng Rác Trống" : "Chưa Có Tài Nguyên Nào Trong Thư Viện"}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          {trashedOnly
            ? "Không có tài nguyên nào đang nằm trong thùng rác."
            : "Nhấn nút 'Upload File' hoặc 'Upload Đề Thi' ở trên để lưu trữ tệp tin đầu tiên."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = TYPE_ICON_MAP[item.item_type] || FileText;
        const colorClass = TYPE_COLOR_MAP[item.item_type] || TYPE_COLOR_MAP.document;
        const typeLabel = TYPE_LABEL_MAP[item.item_type] || "File";

        return (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-surface/80 p-5 shadow-xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl dark:hover:shadow-emerald-500/5"
          >
            <div>
              {/* Type Badge & Favorite Star */}
              <div className="flex items-center justify-between gap-2">
                <span className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider ${colorClass}`}>
                  <Icon className="size-3.5" />
                  <span>{typeLabel}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleFavorite(item.id, item.is_favorite)}
                    className="p-1.5 text-muted-foreground hover:text-amber-500 active:scale-90 transition-all"
                    title="Đánh dấu yêu thích"
                  >
                    <Star
                      className={`size-4.5 ${
                        item.is_favorite ? "text-amber-500 fill-amber-500" : ""
                      }`}
                    />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg border border-border/40">
                    {item.file_size}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="mt-3.5 font-display text-sm sm:text-base font-extrabold text-foreground line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>

              {/* Preview Media / Text Snippet */}
              {item.item_type === "image" && item.file_url ? (
                <div className="mt-3 h-32 rounded-2xl overflow-hidden border border-border/60 bg-background/50">
                  {/* eslint-disable-next-html-element-suppression */}
                  <img src={item.file_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : item.item_type === "audio" && item.file_url ? (
                <div className="mt-3 p-3 rounded-2xl border border-border/60 bg-background/70 shadow-2xs">
                  <audio controls src={item.file_url} className="w-full h-8" />
                </div>
              ) : (
                <p className="mt-2.5 text-xs text-muted-foreground line-clamp-3 font-mono leading-relaxed bg-background/60 p-3 rounded-2xl border border-border/50">
                  {item.content_text || "Chưa có xem trước nội dung..."}
                </p>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="rounded-lg bg-muted/80 px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground border border-border/40">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3.5">
              <span className="text-[10px] font-mono text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString("vi-VN")}
              </span>

              <div className="flex items-center gap-1.5">
                {trashedOnly ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onRestoreItem(item.id)}
                      className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                    >
                      <RotateCcw className="size-3.5" /> Khôi Phục
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => onPermanentDelete(item.id)}
                      title="Xóa vĩnh viễn"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onSelectItem(item)}
                      className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                    >
                      <Sparkles className="size-3.5" /> Xem & Sửa
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-xl border-border/70"
                      onClick={() => handleShareClick(item)}
                      title="Tạo link chia sẻ"
                    >
                      {copiedShareId === item.id ? <Check className="size-3.5 text-emerald-600" /> : <Share2 className="size-3.5" />}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-xl border-border/70"
                      onClick={() => onDownload(item)}
                      title="Tải về"
                    >
                      <Download className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => onTrashItem(item.id)}
                      title="Chuyển vào thùng rác"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

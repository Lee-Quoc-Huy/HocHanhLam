"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, FileText, History, Download, Share2, Save, CheckCircle2, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryItem, ItemVersion } from "../types";

interface LibraryDetailModalProps {
  item: LibraryItem | null;
  versions: ItemVersion[];
  onClose: () => void;
  onUpdate: (id: string, updates: any) => Promise<any>;
  onRollback: (version: ItemVersion) => Promise<void>;
  onDownload: (item: LibraryItem, format: "txt" | "md" | "json") => void;
  onShare: (item: LibraryItem) => string;
}

export function LibraryDetailModal({
  item,
  versions,
  onClose,
  onUpdate,
  onRollback,
  onDownload,
  onShare,
}: LibraryDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "versions">("edit");
  const [title, setTitle] = useState(item?.title || "");
  const [content, setContent] = useState(item?.content_text || "");
  const [isSaved, setIsSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  if (!item) return null;

  const handleSave = async () => {
    await onUpdate(item.id, { title, content_text: content });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyShare = () => {
    onShare(item);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3000);
  };

  return (
    <Dialog.Root open={!!item} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                {item.item_type}
              </span>
              <Dialog.Title className="font-display text-lg font-bold text-foreground line-clamp-1">
                {item.title}
              </Dialog.Title>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyShare} className="gap-1 text-xs">
                {shareCopied ? <Check className="size-3.5 text-emerald-600" /> : <Share2 className="size-3.5" />}
                <span>{shareCopied ? "Đã Sao Chép Link" : "Chia Sẻ"}</span>
              </Button>

              <Button variant="outline" size="sm" onClick={() => onDownload(item, "md")} className="gap-1 text-xs">
                <Download className="size-3.5" /> Tải Markdown
              </Button>

              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <X className="size-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-border py-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                activeTab === "edit" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <FileText className="size-3.5" /> Chỉnh Sửa Nội Dung
            </button>

            <button
              onClick={() => setActiveTab("versions")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                activeTab === "versions" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <History className="size-3.5" /> Lịch Sử Phiên Bản ({versions.length})
            </button>
          </div>

          {/* Content Editor Tab */}
          {activeTab === "edit" && (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm">
              {isSaved && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" /> Đã lưu phiên bản mới thành công!
                </div>
              )}

              {/* Media Preview Player if applicable */}
              {item.item_type === "audio" && item.file_url && (
                <div className="p-4 rounded-xl border border-border bg-background">
                  <audio controls src={item.file_url} className="w-full" />
                </div>
              )}

              {item.item_type === "video" && item.file_url && (
                <div className="rounded-xl overflow-hidden border border-border bg-black max-h-64 flex justify-center">
                  <video controls src={item.file_url} className="max-h-64" />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Tiêu đề tài nguyên:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 font-display text-base font-bold outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Nội dung văn bản / Ghi chú (Markdown):</label>
                <textarea
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6">
                  <Save className="size-4" /> Lưu Phiên Bản Mới
                </Button>
              </div>
            </div>
          )}

          {/* Version History Tab */}
          {activeTab === "versions" && (
            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs sm:text-sm">
              <p className="text-xs text-muted-foreground">
                Xem lại danh sách lịch sử sửa đổi và khôi phục về bản ghi cũ:
              </p>

              {versions.map((ver) => (
                <div key={ver.id} className="rounded-xl border border-border bg-background p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      Phiên bản #{ver.version_number}
                    </span>
                    <h4 className="font-bold text-foreground">{ver.title}</h4>
                    <p className="text-[11px] font-mono text-muted-foreground line-clamp-1">{ver.content_text}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(ver.created_at).toLocaleString("vi-VN")}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRollback(ver)}
                    className="gap-1.5 text-xs shrink-0"
                  >
                    <RotateCcw className="size-3.5" /> Khôi Phục Bản Này
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

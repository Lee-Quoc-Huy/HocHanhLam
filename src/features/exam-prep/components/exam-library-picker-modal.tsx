"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { FolderKanban, FileText, Headphones, Check, X, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useLibrary } from "@/features/library/hooks/use-library";

interface ExamLibraryPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectFile: (fileId: string, fileName: string, fileContent: string) => void;
  selectedFileId?: string;
}

export function ExamLibraryPickerModal({
  open,
  onClose,
  onSelectFile,
  selectedFileId,
}: ExamLibraryPickerModalProps) {
  const { items } = useLibrary();
  const [search, setSearch] = useState("");

  const filteredLibraryItems = useMemo(() => {
    return items.filter((item) => {
      if (item.status === "trashed") return false;
      if (!search.trim()) return true;
      return (
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [items, search]);

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                <FolderKanban className="size-5" />
              </div>
              <div>
                <Dialog.Title className="font-display text-lg font-bold text-foreground">
                  Chọn Tài Liệu Thư Viện Đồ Ôn
                </Dialog.Title>
                <p className="text-xs text-muted-foreground">
                  AI sẽ trích xuất từ vựng, bài đọc, câu nghe từ file trong Thư viện để biên soạn đề thi
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Lọc file theo tên hoặc thẻ tag (TOPIK, TOEIC, HSK...)"
              className="w-full rounded-2xl border border-border bg-background pl-9 pr-4 py-2.5 text-xs outline-none focus:border-indigo-500"
            />
          </div>

          {/* File List */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
            {filteredLibraryItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <p>Chưa tìm thấy tài liệu phù hợp trong Thư viện.</p>
                <p className="text-[11px]">Hãy tải lên bài thi TOPIK/TOEIC/HSK dạng PDF, DOCX, MP3 hoặc Ghi chú vào trang Thư viện.</p>
              </div>
            ) : (
              filteredLibraryItems.map((item) => {
                const isSelected = selectedFileId === item.id;
                const isAudio = item.type === "audio";
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectFile(item.id, item.title, item.content || item.summary || item.title);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all active:scale-98 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/15 font-bold text-indigo-600 shadow-sm"
                        : "border-border/60 bg-background/80 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${isAudio ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}`}>
                        {isAudio ? <Headphones className="size-4" /> : <FileText className="size-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold line-clamp-1">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{item.type.toUpperCase()}</span>
                          {item.tags && item.tags.length > 0 && (
                            <span className="truncate max-w-[150px]">· {item.tags.join(", ")}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="flex size-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Check className="size-3.5" />
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center border-t border-border pt-3">
            {selectedFileId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSelectFile("", "", "");
                  onClose();
                }}
                className="text-xs text-rose-500 hover:text-rose-600"
              >
                Hủy Chọn File
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose} className="ml-auto text-xs">
              Đóng
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

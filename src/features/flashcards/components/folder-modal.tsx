"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, FolderPlus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlashcardFolder } from "../types";

interface FolderModalProps {
  isOpen: boolean;
  type: "folder" | "deck";
  folders: FlashcardFolder[];
  onClose: () => void;
  onCreateFolder: (name: string, description: string) => Promise<void>;
  onCreateDeck: (name: string, description: string, language: any, folderId?: string) => Promise<void>;
}

export function FolderModal({
  isOpen,
  type,
  folders,
  onClose,
  onCreateFolder,
  onCreateDeck,
}: FolderModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [folderId, setFolderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (type === "folder") {
        await onCreateFolder(name.trim(), description.trim());
      } else {
        await onCreateDeck(name.trim(), description.trim(), language, folderId || undefined);
      }
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <Dialog.Title className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              {type === "folder" ? (
                <>
                  <FolderPlus className="size-5 text-amber-500" />
                  <span>Tạo Thư Mục Mới</span>
                </>
              ) : (
                <>
                  <BookOpen className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Tạo Bộ Thẻ Mới</span>
                </>
              )}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-semibold">
                {type === "folder" ? "Tên Thư Mục" : "Tên Bộ Thẻ"} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === "folder" ? "Ví dụ: Luyện Thi IELTS, Tiếng Hàn Sơ Cấp" : "Ví dụ: HSK 5 Từ Vựng, IELTS Speaking"}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="font-semibold">
                Mô Tả Nhanh
              </Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả nội dung học tập..."
              />
            </div>

            {type === "deck" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="targetLang" className="font-semibold">
                    Ngôn Ngữ
                  </Label>
                  <select
                    id="targetLang"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="en">🇬🇧 Tiếng Anh</option>
                    <option value="ko">🇰🇷 Tiếng Hàn</option>
                    <option value="zh">🇨🇳 Tiếng Trung</option>
                    <option value="all">🌐 Đa Ngôn Ngữ</option>
                  </select>
                </div>

                {folders.length > 0 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="folderSelect" className="font-semibold">
                      Thư Mục Mẹ (Tùy chọn)
                    </Label>
                    <select
                      id="folderSelect"
                      value={folderId}
                      onChange={(e) => setFolderId(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Không nằm trong thư mục (Thư mục gốc)</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy Bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md"
              >
                {isSubmitting ? "Đang tạo…" : "Tạo Mới"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

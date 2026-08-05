"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Layers, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Flashcard,
  CreateFlashcardInput,
  FlashcardCollection,
  FlashcardLanguage,
  GameModeType,
} from "../types";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";

interface FlashcardFormModalProps {
  isOpen: boolean;
  itemToEdit: Flashcard | null;
  collections: FlashcardCollection[];
  gameModeTarget?: GameModeType;
  targetGameMode?: GameModeType;
  onClose: () => void;
  onSubmit: (input: CreateFlashcardInput) => Promise<void>;
}

export function FlashcardFormModal({
  isOpen,
  itemToEdit,
  collections,
  gameModeTarget,
  targetGameMode,
  onClose,
  onSubmit,
}: FlashcardFormModalProps) {
  const actualGameModeTarget = targetGameMode || gameModeTarget;
  const { speak } = useSpeech();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [collectionId, setCollectionId] = useState("");
  const [language, setLanguage] = useState<FlashcardLanguage>("en");
  const [frontText, setFrontText] = useState("");
  const [frontSubtext, setFrontSubtext] = useState("");
  const [backText, setBackText] = useState("");
  const [backExplanation, setBackExplanation] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setCollectionId(itemToEdit.collection_id || collections[0]?.id || "");
      setLanguage(itemToEdit.language);
      setFrontText(itemToEdit.front_text);
      setFrontSubtext(itemToEdit.front_subtext || "");
      setBackText(itemToEdit.back_text);
      setBackExplanation(itemToEdit.back_explanation || "");
      setAudioUrl(itemToEdit.audio_url || "");
      setImageUrl(itemToEdit.image_url || "");
      setTagsInput(itemToEdit.tags?.join(", ") || "");
      setIsFavorite(itemToEdit.is_favorite || false);
    } else {
      setCollectionId(collections[0]?.id || "");
      setLanguage("en");
      setFrontText("");
      setFrontSubtext("");
      setBackText("");
      setBackExplanation("");
      setAudioUrl("");
      setImageUrl("");
      setTagsInput(actualGameModeTarget ? actualGameModeTarget.toUpperCase() : "");
      setIsFavorite(false);
    }
  }, [itemToEdit, collections, isOpen, actualGameModeTarget]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontText.trim() || !backText.trim()) return;

    setIsSubmitting(true);
    try {
      const parseCsv = (str: string) =>
        str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      const inputData: CreateFlashcardInput = {
        collection_id: collectionId || null,
        game_mode: actualGameModeTarget || itemToEdit?.game_mode || undefined,
        language,
        front_text: frontText.trim(),
        front_subtext: frontSubtext.trim(),
        back_text: backText.trim(),
        back_explanation: backExplanation.trim(),
        audio_url: audioUrl.trim(),
        image_url: imageUrl.trim(),
        tags: parseCsv(tagsInput),
        is_favorite: isFavorite,
      };

      await onSubmit(inputData);
      onClose();
    } catch (err) {
      console.error("Flashcard form error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gameLabel = actualGameModeTarget
    ? actualGameModeTarget === "quiz"
      ? "Quiz"
      : actualGameModeTarget === "spelling"
      ? "Chính Tả"
      : actualGameModeTarget === "reflex"
      ? "Tốc Độ Phản Xạ"
      : actualGameModeTarget === "blank"
      ? "Điền Từ"
      : actualGameModeTarget === "listening"
      ? "Luyện Nghe"
      : "Lật Thẻ SRS"
    : "";

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 sm:p-7 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Dialog.Title className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="size-5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {itemToEdit
                  ? "Chỉnh Sửa Thẻ Flashcard"
                  : gameLabel
                  ? `Tạo Thẻ Riêng Cho Trò Chơi ${gameLabel}`
                  : "Tạo Thẻ Flashcard Mới"}
              </span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitForm} className="mt-5 space-y-4 text-xs sm:text-sm">
            {/* Deck & Language */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="deck" className="font-semibold">
                  Chọn Bộ Thẻ (Deck)
                </Label>
                <select
                  id="deck"
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                >
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.language.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-semibold">Ngôn Ngữ Mục Tiêu</Label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "en", label: "Tiếng Anh", flag: "🇬🇧" },
                    { id: "ko", label: "Tiếng Hàn", flag: "🇰🇷" },
                    { id: "zh", label: "Tiếng Trung", flag: "🇨🇳" },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLanguage(lang.id as FlashcardLanguage)}
                      className={`flex items-center justify-center gap-1 rounded-lg border py-1.5 font-medium transition-all ${
                        language === lang.id
                          ? "border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Front Side */}
            <div className="space-y-1.5">
              <Label htmlFor="front" className="font-semibold">
                Mặt Trước (Từ/Câu Hỏi) <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="front"
                  required
                  value={frontText}
                  onChange={(e) => setFrontText(e.target.value)}
                  placeholder="Ví dụ: Serendipity, 坚持, 설레다"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => speak(frontText, language, audioUrl)}
                  disabled={!frontText.trim()}
                  title="Thử phát âm"
                >
                  <Volume2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subtext" className="font-semibold">
                Phụ Đề Mặt Trước (Phiên âm IPA / Pinyin / Subtitle)
              </Label>
              <Input
                id="subtext"
                value={frontSubtext}
                onChange={(e) => setFrontSubtext(e.target.value)}
                placeholder="Ví dụ: /ɪˈfem.ər.əl/, jiān chí, seol-le-da"
              />
            </div>

            {/* Back Side */}
            <div className="space-y-1.5">
              <Label htmlFor="back" className="font-semibold">
                Mặt Sau (Nghĩa / Đáp Án) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="back"
                required
                value={backText}
                onChange={(e) => setBackText(e.target.value)}
                placeholder="Ví dụ: Sự tình cờ may mắn, Kiên trì"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="backExp" className="font-semibold">
                Giải Thích & Câu Ví Dụ Chi Tiết
              </Label>
              <textarea
                id="backExp"
                rows={3}
                value={backExplanation}
                onChange={(e) => setBackExplanation(e.target.value)}
                placeholder="Ví dụ minh họa & ngữ cảnh câu..."
                className="w-full rounded-md border border-border bg-background p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <Label htmlFor="tags" className="font-semibold">
                Thẻ Phân Loại (Cách nhau bởi dấu phẩy)
              </Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ví dụ: IELTS, TOPIK2, HSK4"
              />
            </div>

            {/* Favorite check */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <label className="flex cursor-pointer items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="size-4 rounded border-border text-emerald-600 focus:ring-emerald-600"
                />
                <span>Đánh dấu Thẻ Yêu Thích</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy Bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 font-medium text-white shadow-md"
              >
                {isSubmitting
                  ? "Đang lưu…"
                  : itemToEdit
                  ? "Cập Nhật Thẻ"
                  : `Tạo Thẻ ${gameLabel || "Mới"}`}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

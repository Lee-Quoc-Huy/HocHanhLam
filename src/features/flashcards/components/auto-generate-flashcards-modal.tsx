"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { vocabularyService } from "@/features/vocabulary/api/vocabulary-service";
import type { VocabularyItem } from "@/features/vocabulary/types";
import type { CreateFlashcardInput } from "../types";

interface AutoGenerateFlashcardsModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCard: (input: CreateFlashcardInput) => Promise<unknown>;
}

const PART_OF_SPEECH_LABEL: Record<string, string> = {
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
  adverb: "Phó từ",
  phrase: "Cụm từ",
  idiom: "Thành ngữ",
  particle: "Trợ từ",
};

export function AutoGenerateFlashcardsModal({ open, onClose, onCreateCard }: AutoGenerateFlashcardsModalProps) {
  const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [count, setCount] = useState(20);
  const [language, setLanguage] = useState<"all" | "en" | "ko" | "zh">("all");
  const [partOfSpeech, setPartOfSpeech] = useState<string>("all");
  const [collection, setCollection] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setDone(null);
    setIsLoadingWords(true);
    vocabularyService
      .fetchVocabulary()
      .then(setAllWords)
      .catch(() => toast.error("Không thể tải danh sách từ vựng."))
      .finally(() => setIsLoadingWords(false));
  }, [open]);

  const availablePartsOfSpeech = useMemo(
    () => Array.from(new Set(allWords.map((w) => w.part_of_speech).filter(Boolean))),
    [allWords]
  );
  const availableCollections = useMemo(
    () => Array.from(new Set(allWords.map((w) => w.collection).filter(Boolean))),
    [allWords]
  );

  const matchingWords = useMemo(() => {
    return allWords.filter((w) => {
      if (language !== "all" && w.language !== language) return false;
      if (partOfSpeech !== "all" && w.part_of_speech !== partOfSpeech) return false;
      if (collection !== "all" && w.collection !== collection) return false;
      return true;
    });
  }, [allWords, language, partOfSpeech, collection]);

  function handleClose() {
    setDone(null);
    onClose();
  }

  async function handleGenerate() {
    if (matchingWords.length === 0) {
      toast.error("Không có từ vựng nào khớp với bộ lọc đã chọn.");
      return;
    }

    setIsGenerating(true);
    try {
      // Shuffle then take the requested count, so repeated generations don't
      // always produce the exact same first N words.
      const shuffled = [...matchingWords].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, count);

      for (const word of picked) {
        await onCreateCard({
          language: word.language,
          collection_id: null,
          front_text: word.word,
          front_subtext: word.ipa || "",
          back_text: word.vietnamese,
          back_explanation: word.english_meaning
            ? `${word.english_meaning}${word.example ? `\n\nVí dụ: ${word.example}` : ""}`
            : word.example || "",
          audio_url: word.audio_url || "",
          image_url: word.image_url || "",
          tags: [word.collection, word.part_of_speech].filter(Boolean) as string[],
          is_favorite: false,
        });
      }

      toast.success(`Đã tạo ${picked.length} flashcard từ Kho Từ Vựng.`);
      setDone(picked.length);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo flashcard tự động.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-5 shadow-2xl animate-in zoom-in-95 fade-in max-h-[85vh] overflow-y-auto">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Wand2 className="size-4" />
              </div>
              <div>
                <Dialog.Title className="font-display text-base font-bold text-foreground">
                  Tạo Flashcard Tự Động
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">
                  Lấy từ vựng có sẵn trong Kho Từ Vựng để tạo flashcard hàng loạt.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {isLoadingWords ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : done !== null ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Wand2 className="size-10 text-emerald-500" />
              <p className="text-sm font-medium text-foreground">Đã tạo {done} flashcard mới!</p>
              <Button variant="outline" onClick={handleClose} className="mt-2">
                Đóng
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Số lượng thẻ: <span className="text-emerald-600 dark:text-emerald-400">{count}</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={50}
                  step={5}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>20</span>
                  <span>50</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Ngôn ngữ</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">Tất cả ngôn ngữ</option>
                  <option value="en">Tiếng Anh</option>
                  <option value="ko">Tiếng Hàn</option>
                  <option value="zh">Tiếng Trung</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Từ loại</label>
                <select
                  value={partOfSpeech}
                  onChange={(e) => setPartOfSpeech(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">Tất cả từ loại</option>
                  {availablePartsOfSpeech.map((p) => (
                    <option key={p} value={p}>
                      {PART_OF_SPEECH_LABEL[p] ?? p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">Chủ đề / Bộ sưu tập</label>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="all">Tất cả chủ đề</option>
                  {availableCollections.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-muted-foreground">
                Đang khớp <span className="font-semibold text-foreground">{matchingWords.length}</span> từ vựng với bộ
                lọc hiện tại
                {matchingWords.length < count && matchingWords.length > 0 && (
                  <> — chỉ tạo được tối đa {matchingWords.length} thẻ.</>
                )}
              </p>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || matchingWords.length === 0}
                className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang tạo…
                  </>
                ) : (
                  <>
                    <Wand2 className="size-4" /> Tạo {Math.min(count, matchingWords.length)} Flashcard
                  </>
                )}
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

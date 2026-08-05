"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Wand2, Loader2, BookOpen, BookMarked, Layers, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { vocabularyService } from "@/features/vocabulary/api/vocabulary-service";
import { grammarService } from "@/features/grammar/api/grammar-service";
import type { VocabularyItem } from "@/features/vocabulary/types";
import type { GrammarItem } from "@/features/grammar/types";
import type { CreateFlashcardInput } from "../types";
import { cn } from "@/lib/utils/cn";

interface AutoGenerateFlashcardsModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCard: (input: CreateFlashcardInput) => Promise<unknown>;
  targetGameMode?: string;
}

export function AutoGenerateFlashcardsModal({ open, onClose, onCreateCard, targetGameMode }: AutoGenerateFlashcardsModalProps) {
  const [sourceType, setSourceType] = useState<"vocabulary" | "grammar">("vocabulary");

  // Vocabulary State & Extended Filters
  const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
  const [vocabCount, setVocabCount] = useState(20);
  const [vocabLang, setVocabLang] = useState<"all" | "en" | "ko" | "zh">("all");
  const [vocabCollection, setVocabCollection] = useState<string>("all");
  const [vocabPos, setVocabPos] = useState<string>("all");
  const [vocabDifficulty, setVocabDifficulty] = useState<string>("all");

  // Grammar State & Extended Filters
  const [allGrammar, setAllGrammar] = useState<GrammarItem[]>([]);
  const [grammarCount, setGrammarCount] = useState(15);
  const [grammarLang, setGrammarLang] = useState<"all" | "en" | "ko" | "zh">("all");
  const [grammarCategory, setGrammarCategory] = useState<string>("all");
  const [grammarDifficulty, setGrammarDifficulty] = useState<string>("all");

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsLoadingData(true);
    Promise.all([vocabularyService.fetchVocabulary(), grammarService.fetchGrammar()])
      .then(([words, grammar]) => {
        setAllWords(words || []);
        setAllGrammar(grammar || []);
      })
      .catch(() => toast.error("Không thể tải dữ liệu từ vựng/ngữ pháp."))
      .finally(() => setIsLoadingData(false));
  }, [open]);

  // Vocab Filters
  const availableCollections = useMemo(
    () => Array.from(new Set(allWords.map((w) => w.collection).filter(Boolean))),
    [allWords]
  );
  const matchingWords = useMemo(() => {
    return allWords.filter((w) => {
      if (vocabLang !== "all" && w.language !== vocabLang) return false;
      if (vocabCollection !== "all" && w.collection !== vocabCollection) return false;
      if (vocabPos !== "all" && w.part_of_speech !== vocabPos) return false;
      if (vocabDifficulty !== "all" && w.difficulty !== vocabDifficulty) return false;
      return true;
    });
  }, [allWords, vocabLang, vocabCollection, vocabPos, vocabDifficulty]);

  // Grammar Filters
  const availableCategories = useMemo(
    () => Array.from(new Set(allGrammar.map((g) => g.category).filter(Boolean))),
    [allGrammar]
  );
  const matchingGrammar = useMemo(() => {
    return allGrammar.filter((g) => {
      if (grammarLang !== "all" && g.language !== grammarLang) return false;
      if (grammarCategory !== "all" && g.category !== grammarCategory) return false;
      if (grammarDifficulty !== "all" && g.difficulty !== grammarDifficulty) return false;
      return true;
    });
  }, [allGrammar, grammarLang, grammarCategory, grammarDifficulty]);

  function handleClose() {
    onClose();
  }

  // Extract Flashcards from Vocabulary Vault
  async function handleExtractVocab() {
    if (matchingWords.length === 0) {
      toast.error("Không có từ vựng nào khớp với bộ lọc đã chọn.");
      return;
    }

    setIsSaving(true);
    let savedCount = 0;

    try {
      const shuffled = [...matchingWords].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, vocabCount);

      for (const word of picked) {
        try {
          await onCreateCard({
            language: word.language,
            collection_id: null,
            game_mode: (targetGameMode as any) || undefined,
            front_text: word.word,
            front_subtext: word.ipa || "",
            back_text: word.vietnamese,
            back_explanation: word.english_meaning
              ? `${word.english_meaning}${word.example ? `\n\nVí dụ: ${word.example}` : ""}`
              : word.example || "",
            audio_url: word.audio_url || "",
            image_url: word.image_url || "",
            tags: [word.collection, word.part_of_speech, word.difficulty].filter(Boolean) as string[],
            is_favorite: false,
          });
          savedCount++;
        } catch (e) {
          console.error("Failed to extract single word:", e);
        }
      }

      toast.success(`Đã trích xuất ${savedCount} thẻ từ Kho Từ Vựng!`);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo thẻ tự động.");
    } finally {
      setIsSaving(false);
    }
  }

  // Extract Flashcards from Grammar Vault
  async function handleExtractGrammar() {
    if (matchingGrammar.length === 0) {
      toast.error("Không có cấu trúc ngữ pháp nào khớp với bộ lọc.");
      return;
    }

    setIsSaving(true);
    let savedCount = 0;

    try {
      const shuffled = [...matchingGrammar].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, grammarCount);

      for (const g of picked) {
        try {
          const exText = g.examples && g.examples.length > 0
            ? `Ví dụ: ${g.examples[0].example}\n(${g.examples[0].translation})`
            : "";

          await onCreateCard({
            language: g.language,
            collection_id: null,
            game_mode: (targetGameMode as any) || undefined,
            front_text: g.title,
            front_subtext: g.category || "Ngữ pháp",
            back_text: g.meaning,
            back_explanation: `${g.explanation}\n\n${exText}`,
            audio_url: "",
            image_url: "",
            tags: [g.category, "Grammar", g.difficulty].filter(Boolean) as string[],
            is_favorite: false,
          });
          savedCount++;
        } catch (e) {
          console.error("Failed to extract single grammar:", e);
        }
      }

      toast.success(`Đã trích xuất ${savedCount} thẻ từ Kho Ngữ Pháp!`);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo thẻ tự động.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-emerald-500/30 bg-surface-raised/95 p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 fade-in max-h-[88vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
                <Wand2 className="size-5" />
              </div>
              <div>
                <Dialog.Title className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Tạo Thẻ Tự Động Nâng Cao</span>
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">
                  Lọc theo Loại từ, Chủ đề & Cấp độ để trích xuất thẻ ôn tập chính xác.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Source Vault Switcher */}
          <div className="mb-5 flex rounded-xl border border-border bg-background p-1 text-xs font-semibold">
            <button
              onClick={() => setSourceType("vocabulary")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all",
                sourceType === "vocabulary"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="size-4" />
              <span>Kho Từ Vựng ({allWords.length})</span>
            </button>

            <button
              onClick={() => setSourceType("grammar")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all",
                sourceType === "grammar"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookMarked className="size-4" />
              <span>Kho Ngữ Pháp ({allGrammar.length})</span>
            </button>
          </div>

          {isLoadingData ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-emerald-600" />
            </div>
          ) : sourceType === "vocabulary" ? (
            /* VOCABULARY EXTRACTION FORM */
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Số lượng thẻ cần tạo: <span className="text-emerald-600 font-bold">{vocabCount}</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={vocabCount}
                  onChange={(e) => setVocabCount(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Ngôn ngữ</label>
                  <select
                    value={vocabLang}
                    onChange={(e) => setVocabLang(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
                  >
                    <option value="all">Tất cả ngôn ngữ</option>
                    <option value="en">🇬🇧 Tiếng Anh</option>
                    <option value="ko">🇰🇷 Tiếng Hàn</option>
                    <option value="zh">🇨🇳 Tiếng Trung</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Chủ đề / Bộ sưu tập</label>
                  <select
                    value={vocabCollection}
                    onChange={(e) => setVocabCollection(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
                  >
                    <option value="all">Tất cả chủ đề</option>
                    {availableCollections.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Loại từ (Part of speech)</label>
                  <select
                    value={vocabPos}
                    onChange={(e) => setVocabPos(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
                  >
                    <option value="all">Tất cả loại từ</option>
                    <option value="noun">Danh từ (Noun)</option>
                    <option value="verb">Động từ (Verb)</option>
                    <option value="adjective">Tính từ (Adjective)</option>
                    <option value="adverb">Phó từ (Adverb)</option>
                    <option value="phrase">Cụm từ (Phrase)</option>
                    <option value="idiom">Thành ngữ (Idiom)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Cấp độ (Level)</label>
                  <select
                    value={vocabDifficulty}
                    onChange={(e) => setVocabDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
                  >
                    <option value="all">Tất cả cấp độ</option>
                    <option value="beginner">Sơ cấp (Beginner)</option>
                    <option value="intermediate">Trung cấp (Intermediate)</option>
                    <option value="advanced">Nâng cao (Advanced)</option>
                    <option value="master">Bậc thầy (Master)</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Filter className="size-3.5 text-emerald-500" />
                Khớp <span className="font-bold text-foreground">{matchingWords.length}</span> từ vựng phù hợp với bộ lọc.
              </p>

              <Button
                onClick={handleExtractVocab}
                disabled={isSaving || matchingWords.length === 0}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md hover:opacity-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang trích xuất từ vựng...
                  </>
                ) : (
                  <>
                    <Layers className="size-4" /> Tạo {Math.min(vocabCount, matchingWords.length)} Thẻ Từ Vựng
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* GRAMMAR EXTRACTION FORM */
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Số lượng thẻ cần tạo: <span className="text-indigo-600 font-bold">{grammarCount}</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={5}
                  value={grammarCount}
                  onChange={(e) => setGrammarCount(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Ngôn ngữ</label>
                  <select
                    value={grammarLang}
                    onChange={(e) => setGrammarLang(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
                  >
                    <option value="all">Tất cả ngôn ngữ</option>
                    <option value="en">🇬🇧 Tiếng Anh</option>
                    <option value="ko">🇰🇷 Tiếng Hàn</option>
                    <option value="zh">🇨🇳 Tiếng Trung</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Chủ đề / Danh mục</label>
                  <select
                    value={grammarCategory}
                    onChange={(e) => setGrammarCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
                  >
                    <option value="all">Tất cả danh mục</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-foreground">Cấp độ (Level)</label>
                  <select
                    value={grammarDifficulty}
                    onChange={(e) => setGrammarDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
                  >
                    <option value="all">Tất cả cấp độ</option>
                    <option value="beginner">Sơ cấp (Beginner)</option>
                    <option value="intermediate">Trung cấp (Intermediate)</option>
                    <option value="advanced">Nâng cao (Advanced)</option>
                    <option value="master">Bậc thầy (Master)</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Filter className="size-3.5 text-indigo-500" />
                Khớp <span className="font-bold text-foreground">{matchingGrammar.length}</span> cấu trúc ngữ pháp phù hợp.
              </p>

              <Button
                onClick={handleExtractGrammar}
                disabled={isSaving || matchingGrammar.length === 0}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md hover:opacity-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang trích xuất ngữ pháp...
                  </>
                ) : (
                  <>
                    <Layers className="size-4" /> Tạo {Math.min(grammarCount, matchingGrammar.length)} Thẻ Ngữ Pháp
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

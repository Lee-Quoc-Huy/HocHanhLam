"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Wand2, Loader2, Sparkles, BookOpen, Layers, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { vocabularyService } from "@/features/vocabulary/api/vocabulary-service";
import type { VocabularyItem } from "@/features/vocabulary/types";
import type { CreateFlashcardInput } from "../types";
import { cn } from "@/lib/utils/cn";

interface AutoGenerateFlashcardsModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCard: (input: CreateFlashcardInput) => Promise<unknown>;
}

const PRESET_TOPICS = [
  { label: "🏢 Công Sở & Giao Tiếp", topic: "Giao tiếp công sở & Văn phòng", lang: "en" },
  { label: "✈️ Du Lịch & Sân Bay", topic: "Du lịch, Khách sạn & Sân bay", lang: "en" },
  { label: "🎓 TOPIK II Từ Vựng", topic: "Từ vựng quan trọng thi TOPIK II", lang: "ko" },
  { label: "🧧 HSK 4 Động Từ", topic: "Động từ hay gặp trong HSK 4", lang: "zh" },
  { label: "🍔 Ẩm Thực & Mua Sắm", topic: "Gọi món ẩm thực & Mua sắm", lang: "ko" },
  { label: "💼 Phỏng Vấn Xin Việc", topic: "Phỏng vấn xin việc & CV", lang: "en" },
];

export function AutoGenerateFlashcardsModal({ open, onClose, onCreateCard }: AutoGenerateFlashcardsModalProps) {
  const [generateMode, setGenerateMode] = useState<"ai" | "vocabulary">("ai");

  // AI Generation State
  const [topic, setTopic] = useState("Giao tiếp công sở & Văn phòng");
  const [aiLanguage, setAiLanguage] = useState<"en" | "ko" | "zh">("en");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [aiCount, setAiCount] = useState(10);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [previewItems, setPreviewItems] = useState<any[]>([]);

  // Vocabulary Extraction State
  const [allWords, setAllWords] = useState<VocabularyItem[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [count, setCount] = useState(20);
  const [language, setLanguage] = useState<"all" | "en" | "ko" | "zh">("all");
  const [partOfSpeech, setPartOfSpeech] = useState<string>("all");
  const [collection, setCollection] = useState<string>("all");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPreviewItems([]);
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
    setPreviewItems([]);
    onClose();
  }

  // Generate Flashcards / Quiz items via AI API
  async function handleAiGenerate() {
    if (!topic.trim()) {
      toast.error("Vui lòng nhập chủ đề muốn tạo.");
      return;
    }

    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          language: aiLanguage,
          level,
          count: aiCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tạo bộ thẻ từ AI.");

      setPreviewItems(data.items || []);
      toast.success(`AI đã tạo xong ${data.items?.length || 0} thẻ cho chủ đề "${topic}".`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi gọi AI.");
    } finally {
      setIsAiGenerating(false);
    }
  }

  // Save generated AI items to Flashcard store
  async function handleSavePreviewItems() {
    if (previewItems.length === 0) return;
    setIsSaving(true);
    try {
      for (const item of previewItems) {
        await onCreateCard({
          language: aiLanguage,
          collection_id: null,
          front_text: item.front_text,
          front_subtext: item.front_subtext || "",
          back_text: item.back_text,
          back_explanation: item.back_explanation || "",
          audio_url: "",
          image_url: "",
          tags: item.tags || [topic],
          is_favorite: false,
        });
      }
      toast.success(`Đã lưu ${previewItems.length} thẻ mới vào hệ thống!`);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu thẻ.");
    } finally {
      setIsSaving(false);
    }
  }

  // Bulk extract from local vocabulary
  async function handleVocabExtract() {
    if (matchingWords.length === 0) {
      toast.error("Không có từ vựng nào khớp với bộ lọc đã chọn.");
      return;
    }

    setIsSaving(true);
    try {
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

      toast.success(`Đã trích xuất ${picked.length} flashcard từ Kho Từ Vựng.`);
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo flashcard tự động.");
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
                  <span>Tạo Flashcard & Quiz AI VIP</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Tự Động 100%
                  </span>
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">
                  Soạn bộ thẻ học và câu hỏi Quiz thông minh bằng AI hoặc trích xuất từ Kho Từ Vựng.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Generator Mode Switcher */}
          <div className="mb-5 flex rounded-xl border border-border bg-background p-1 text-xs font-semibold">
            <button
              onClick={() => setGenerateMode("ai")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2 rounded-lg transition-all",
                generateMode === "ai"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="size-3.5" />
              <span>Tạo Chủ Đề Bằng AI</span>
            </button>
            <button
              onClick={() => setGenerateMode("vocabulary")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2 rounded-lg transition-all",
                generateMode === "vocabulary"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="size-3.5" />
              <span>Trích Xuất Kho Từ Vựng</span>
            </button>
          </div>

          {/* MODE 1: AI Topic Generator */}
          {generateMode === "ai" && (
            <div className="space-y-4">
              {/* Preset Topics Badges */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Gợi ý chủ đề hay:</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TOPICS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTopic(p.topic);
                        setAiLanguage(p.lang as any);
                      }}
                      className="rounded-xl border border-border/80 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Input */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Chủ đề mong muốn:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Nhập chủ đề (VD: Giao tiếp sân bay, Phỏng vấn IT...)"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Language & Level & Count */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Ngôn ngữ</label>
                  <select
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs font-medium outline-none"
                  >
                    <option value="en">🇬🇧 Anh</option>
                    <option value="ko">🇰🇷 Hàn</option>
                    <option value="zh">🇨🇳 Trung</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Trình độ</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs font-medium outline-none"
                  >
                    <option value="beginner">Sơ cấp</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Cao cấp</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Số lượng</label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs font-medium outline-none"
                  >
                    <option value={5}>5 thẻ</option>
                    <option value={10}>10 thẻ</option>
                    <option value={15}>15 thẻ</option>
                    <option value={20}>20 thẻ</option>
                  </select>
                </div>
              </div>

              {/* AI Generate Button */}
              <Button
                onClick={handleAiGenerate}
                disabled={isAiGenerating || !topic.trim()}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-md hover:opacity-95"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> AI Đang Soạn Bài...
                  </>
                ) : (
                  <>
                    <Wand2 className="size-4" /> Bắt Đầu Soạn {aiCount} Thẻ Với AI
                  </>
                )}
              </Button>

              {/* Live AI Generation Preview Cards */}
              {previewItems.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="size-4" /> Kết quả preview ({previewItems.length} thẻ)
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAiGenerate}
                      disabled={isAiGenerating}
                      className="h-7 text-[11px] gap-1"
                    >
                      <RefreshCw className="size-3" /> Soạn Lại
                    </Button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {previewItems.map((item, idx) => (
                      <div key={idx} className="rounded-xl border border-border bg-background p-3 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-foreground">
                          <span>{item.front_text} <span className="font-mono text-[10px] text-emerald-500">[{item.front_subtext}]</span></span>
                          <span className="text-emerald-600 font-semibold">{item.back_text}</span>
                        </div>
                        {item.back_explanation && (
                          <p className="text-[11px] text-muted-foreground truncate">{item.back_explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleSavePreviewItems}
                    disabled={isSaving}
                    className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                  >
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : `Lưu ${previewItems.length} Thẻ Vào Kho`}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: Bulk Extract from Local Vocabulary Vault */}
          {generateMode === "vocabulary" && (
            <div className="space-y-4">
              {isLoadingWords ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-foreground">
                      Số lượng thẻ: <span className="text-emerald-600 dark:text-emerald-400">{count}</span>
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      step={5}
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-foreground">Ngôn ngữ</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
                      >
                        <option value="all">Tất cả ngôn ngữ</option>
                        <option value="en">Tiếng Anh</option>
                        <option value="ko">Tiếng Hàn</option>
                        <option value="zh">Tiếng Trung</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-foreground">Chủ đề</label>
                      <select
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
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
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Đang khớp <span className="font-semibold text-foreground">{matchingWords.length}</span> từ vựng khả dụng.
                  </p>

                  <Button
                    onClick={handleVocabExtract}
                    disabled={isSaving || matchingWords.length === 0}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:opacity-95"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Đang trích xuất...
                      </>
                    ) : (
                      <>
                        <Layers className="size-4" /> Trích Xuất {Math.min(count, matchingWords.length)} Thẻ
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

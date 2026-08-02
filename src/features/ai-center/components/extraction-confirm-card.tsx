"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BookOpenText, BookMarked, Layers, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vocabularyService } from "@/features/vocabulary/api/vocabulary-service";
import { grammarService } from "@/features/grammar/api/grammar-service";
import { flashcardService } from "@/features/flashcards/api/flashcard-service";

interface ExtractedVocabulary {
  language?: "en" | "ko" | "zh";
  word: string;
  ipa?: string;
  vietnamese: string;
  english_meaning?: string;
  part_of_speech?: string;
  example?: string;
  example_translation?: string;
  difficulty?: "beginner" | "intermediate" | "advanced" | "master";
}

interface ExtractedGrammar {
  language?: "en" | "ko" | "zh";
  title: string;
  meaning: string;
  explanation?: string;
  examples?: { example: string; translation: string }[];
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced" | "master";
}

interface ExtractedFlashcard {
  front_text: string;
  front_subtext?: string;
  back_text: string;
  back_explanation?: string;
  tags?: string[];
}

export interface ExtractionData {
  summary?: string;
  vocabulary: ExtractedVocabulary[];
  grammar: ExtractedGrammar[];
  flashcards: ExtractedFlashcard[];
}

type SectionKey = "vocabulary" | "grammar" | "flashcards";

const PRESET_COLLECTIONS = ["General", "IELTS Academic", "TOPIK II", "HSK 4", "Daily Communication"];

export function ExtractionConfirmCard({ data, targetLanguage }: { data: ExtractionData; targetLanguage: "en" | "ko" | "zh" }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    data.vocabulary.forEach((_, i) => (init[`vocabulary-${i}`] = true));
    data.grammar.forEach((_, i) => (init[`grammar-${i}`] = true));
    data.flashcards.forEach((_, i) => (init[`flashcards-${i}`] = true));
    return init;
  });
  const [saved, setSaved] = useState<Record<SectionKey, boolean>>({
    vocabulary: false,
    grammar: false,
    flashcards: false,
  });
  const [saving, setSaving] = useState<SectionKey | null>(null);
  const [collection, setCollection] = useState("General");
  const [customCollection, setCustomCollection] = useState("");

  const toggle = (key: string) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  async function saveVocabulary() {
    setSaving("vocabulary");
    try {
      const finalCollection = collection === "NEW" ? customCollection.trim() || "General" : collection;
      const items = data.vocabulary.filter((_, i) => checked[`vocabulary-${i}`]);
      for (const item of items) {
        await vocabularyService.createWord({
          language: item.language ?? targetLanguage,
          word: item.word,
          ipa: item.ipa ?? "",
          vietnamese: item.vietnamese,
          english_meaning: item.english_meaning ?? "",
          part_of_speech: item.part_of_speech ?? "noun",
          example: item.example ?? "",
          example_translation: item.example_translation ?? "",
          audio_url: "",
          image_url: "",
          synonyms: [],
          antonyms: [],
          frequency: 3,
          difficulty: item.difficulty ?? "intermediate",
          is_favorite: false,
          collection: finalCollection,
        } as any);
      }
      toast.success(`Đã lưu ${items.length} từ vào Kho Từ Vựng (Bộ sưu tập: ${finalCollection}).`);
      setSaved((s) => ({ ...s, vocabulary: true }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu từ vựng.");
    } finally {
      setSaving(null);
    }
  }

  async function saveGrammar() {
    setSaving("grammar");
    try {
      const items = data.grammar.filter((_, i) => checked[`grammar-${i}`]);
      for (const item of items) {
        await grammarService.createGrammar({
          language: item.language ?? targetLanguage,
          title: item.title,
          meaning: item.meaning,
          explanation: item.explanation ?? "",
          examples: item.examples ?? [],
          common_mistakes: [],
          related_grammar: [],
          difficulty: item.difficulty ?? "intermediate",
          is_favorite: false,
          category: item.category ?? "General",
        } as any);
      }
      toast.success(`Đã lưu ${items.length} cấu trúc vào Ngữ Pháp.`);
      setSaved((s) => ({ ...s, grammar: true }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể lưu ngữ pháp.");
    } finally {
      setSaving(null);
    }
  }

  async function saveFlashcards() {
    setSaving("flashcards");
    try {
      const items = data.flashcards.filter((_, i) => checked[`flashcards-${i}`]);
      for (const item of items) {
        await flashcardService.createFlashcard({
          language: targetLanguage,
          collection_id: null,
          front_text: item.front_text,
          front_subtext: item.front_subtext ?? "",
          back_text: item.back_text,
          back_explanation: item.back_explanation ?? "",
          audio_url: "",
          image_url: "",
          tags: item.tags && item.tags.length > 0 ? item.tags : ["Ảnh/Tài Liệu AI"],
          is_favorite: false,
        } as any);
      }
      toast.success(`Đã tạo ${items.length} flashcard mới.`);
      setSaved((s) => ({ ...s, flashcards: true }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể tạo flashcard.");
    } finally {
      setSaving(null);
    }
  }

  const sections: {
    key: SectionKey;
    label: string;
    icon: typeof BookOpenText;
    items: { title: string; subtitle: string }[];
    onSave: () => void;
  }[] = [
    {
      key: "vocabulary",
      label: "Từ Vựng",
      icon: BookOpenText,
      items: data.vocabulary.map((v) => ({ title: v.word, subtitle: v.vietnamese })),
      onSave: saveVocabulary,
    },
    {
      key: "grammar",
      label: "Ngữ Pháp",
      icon: BookMarked,
      items: data.grammar.map((g) => ({ title: g.title, subtitle: g.meaning })),
      onSave: saveGrammar,
    },
    {
      key: "flashcards",
      label: "Flashcard",
      icon: Layers,
      items: data.flashcards.map((f) => ({ title: f.front_text, subtitle: f.back_text })),
      onSave: saveFlashcards,
    },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
      {sections.map((section) => {
        const Icon = section.icon;
        const selectedCount = section.items.filter((_, i) => checked[`${section.key}-${i}`]).length;
        return (
          <div key={section.key} className="rounded-lg border border-border/80 bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Icon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {section.label} ({section.items.length})
                </span>
              </div>
              {saved[section.key] ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3" /> Đã lưu
                </span>
              ) : (
                <Button
                  size="sm"
                  onClick={section.onSave}
                  disabled={selectedCount === 0 || saving === section.key}
                  className="h-7 gap-1 bg-emerald-600 px-2.5 text-[11px] text-white hover:bg-emerald-700"
                >
                  {saving === section.key ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    `Lưu ${selectedCount} mục`
                  )}
                </Button>
              )}
            </div>

            {section.key === "vocabulary" && !saved.vocabulary && (
              <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-md bg-muted/40 p-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">Bộ Sưu Tập:</span>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="h-6 rounded-md border border-border bg-background px-1.5 text-[11px] font-medium outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {PRESET_COLLECTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c === "General" ? "Chung" : c}
                    </option>
                  ))}
                  <option value="NEW">+ Bộ sưu tập mới</option>
                </select>
                {collection === "NEW" && (
                  <input
                    value={customCollection}
                    onChange={(e) => setCustomCollection(e.target.value)}
                    placeholder="Tên bộ sưu tập mới…"
                    className="h-6 flex-1 min-w-[120px] rounded-md border border-border bg-background px-1.5 text-[11px] outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                )}
              </div>
            )}

            <div className="space-y-1.5">
              {section.items.map((item, i) => {
                const key = `${section.key}-${i}`;
                return (
                  <label
                    key={key}
                    className="flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 text-xs hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[key]}
                      onChange={() => toggle(key)}
                      disabled={saved[section.key]}
                      className="mt-0.5 size-3.5 accent-emerald-600"
                    />
                    <span className="flex-1">
                      <span className="font-semibold text-foreground">{item.title}</span>
                      <span className="text-muted-foreground"> — {item.subtitle}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

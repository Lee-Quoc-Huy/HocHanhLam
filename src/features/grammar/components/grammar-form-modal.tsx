"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2, BookMarked, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GrammarItem,
  CreateGrammarInput,
  GrammarLanguage,
  DifficultyLevel,
  GrammarExample,
  CommonMistake,
} from "../types";

interface GrammarFormModalProps {
  isOpen: boolean;
  itemToEdit: GrammarItem | null;
  availableCategories: string[];
  onClose: () => void;
  onSubmit: (input: CreateGrammarInput) => Promise<void>;
}

export function GrammarFormModal({
  isOpen,
  itemToEdit,
  availableCategories,
  onClose,
  onSubmit,
}: GrammarFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [language, setLanguage] = useState<GrammarLanguage>("en");
  const [title, setTitle] = useState("");
  const [meaning, setMeaning] = useState("");
  const [explanation, setExplanation] = useState("");
  const [examples, setExamples] = useState<GrammarExample[]>([
    { example: "", translation: "" },
  ]);
  const [commonMistakes, setCommonMistakes] = useState<CommonMistake[]>([]);
  const [relatedGrammarInput, setRelatedGrammarInput] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [isFavorite, setIsFavorite] = useState(false);
  const [category, setCategory] = useState("General");
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    if (itemToEdit) {
      setLanguage(itemToEdit.language);
      setTitle(itemToEdit.title);
      setMeaning(itemToEdit.meaning);
      setExplanation(itemToEdit.explanation || "");
      setExamples(
        itemToEdit.examples?.length > 0
          ? itemToEdit.examples
          : [{ example: "", translation: "" }]
      );
      setCommonMistakes(itemToEdit.common_mistakes || []);
      setRelatedGrammarInput(itemToEdit.related_grammar?.join(", ") || "");
      setDifficulty(itemToEdit.difficulty || "intermediate");
      setIsFavorite(itemToEdit.is_favorite || false);
      setCategory(itemToEdit.category || "General");
    } else {
      setLanguage("en");
      setTitle("");
      setMeaning("");
      setExplanation("");
      setExamples([{ example: "", translation: "" }]);
      setCommonMistakes([]);
      setRelatedGrammarInput("");
      setDifficulty("intermediate");
      setIsFavorite(false);
      setCategory("General");
      setCustomCategory("");
    }
  }, [itemToEdit, isOpen]);

  // Dynamic Examples Handlers
  const handleAddExample = () => {
    setExamples([...examples, { example: "", translation: "" }]);
  };

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleExampleChange = (
    index: number,
    field: "example" | "translation",
    val: string
  ) => {
    const updated = [...examples];
    const target = updated[index];
    if (target) {
      target[field] = val;
      setExamples(updated);
    }
  };

  // Dynamic Mistakes Handlers
  const handleAddMistake = () => {
    setCommonMistakes([
      ...commonMistakes,
      { incorrect: "", correct: "", explanation: "" },
    ]);
  };

  const handleRemoveMistake = (index: number) => {
    setCommonMistakes(commonMistakes.filter((_, i) => i !== index));
  };

  const handleMistakeChange = (
    index: number,
    field: "incorrect" | "correct" | "explanation",
    val: string
  ) => {
    const updated = [...commonMistakes];
    const target = updated[index];
    if (target) {
      target[field] = val;
      setCommonMistakes(updated);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !meaning.trim()) return;

    setIsSubmitting(true);
    try {
      const finalCategory =
        category === "NEW" ? customCategory.trim() || "General" : category;

      const parseCsv = (str: string) =>
        str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      const filteredExamples = examples.filter((ex) => ex.example.trim() !== "");
      const filteredMistakes = commonMistakes.filter(
        (m) => m.incorrect.trim() !== "" || m.correct.trim() !== ""
      );

      const inputData: CreateGrammarInput = {
        language,
        title: title.trim(),
        meaning: meaning.trim(),
        explanation: explanation.trim(),
        examples: filteredExamples,
        common_mistakes: filteredMistakes,
        related_grammar: parseCsv(relatedGrammarInput),
        difficulty,
        is_favorite: isFavorite,
        category: finalCategory,
      };

      await onSubmit(inputData);
      onClose();
    } catch (err) {
      console.error("Form submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 sm:p-7 max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Dialog.Title className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BookMarked className="size-5 text-indigo-600 dark:text-indigo-400" />
              <span>{itemToEdit ? "Edit Grammar Structure" : "Add New Grammar Structure"}</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitForm} className="mt-5 space-y-4 text-xs sm:text-sm">
            {/* Target Language */}
            <div className="space-y-1.5">
              <Label className="font-semibold">Target Language</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "en", label: "English", flag: "🇬🇧" },
                  { id: "ko", label: "Korean", flag: "🇰🇷" },
                  { id: "zh", label: "Chinese", flag: "🇨🇳" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id as GrammarLanguage)}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-medium transition-all ${
                      language === lang.id
                        ? "border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Meaning */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-semibold">
                  Grammar Structure / Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    language === "en"
                      ? "e.g., Used to vs. Be used to"
                      : language === "ko"
                      ? "e.g., N+은/는 커녕"
                      : "e.g., 越 A 越 B"
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="meaning" className="font-semibold">
                  Vietnamese Meaning Summary <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="meaning"
                  required
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  placeholder="e.g., Đã từng làm vs Quen với việc..."
                />
              </div>
            </div>

            {/* Difficulty & Category */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="diff" className="font-semibold">
                  Difficulty Level
                </Label>
                <select
                  id="diff"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="beginner">Beginner (A1-A2)</option>
                  <option value="intermediate">Intermediate (B1-B2)</option>
                  <option value="advanced">Advanced (C1-C2)</option>
                  <option value="master">Master</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="font-semibold">
                  Category
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="General">General</option>
                  <option value="Tenses & Verbs">Tenses & Verbs</option>
                  <option value="Connectors & Clause">Connectors & Clause</option>
                  <option value="TOPIK II Advanced">TOPIK II Advanced</option>
                  <option value="HSK 3-4 Structures">HSK 3-4 Structures</option>
                  {availableCategories
                    .filter(
                      (c) =>
                        ![
                          "General",
                          "Tenses & Verbs",
                          "Connectors & Clause",
                          "TOPIK II Advanced",
                          "HSK 3-4 Structures",
                        ].includes(c)
                    )
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  <option value="NEW">+ Create New Category</option>
                </select>
              </div>
            </div>

            {category === "NEW" && (
              <div className="space-y-1.5 animate-in fade-in">
                <Label htmlFor="customCategory" className="font-semibold">
                  New Category Name
                </Label>
                <Input
                  id="customCategory"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g., Modals, Subjunctive"
                />
              </div>
            )}

            {/* Explanation & Formula */}
            <div className="space-y-1.5">
              <Label htmlFor="explanation" className="font-semibold">
                Detailed Explanation & Formula
              </Label>
              <textarea
                id="explanation"
                rows={3}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Nêu rõ công thức kết hợp, hoàn cảnh sử dụng và quy tắc chia từ..."
                className="w-full rounded-md border border-border bg-background p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            {/* Examples Dynamic List */}
            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Example Sentences</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddExample}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="size-3" /> Add Example
                </Button>
              </div>

              {examples.map((ex, i) => (
                <div key={i} className="flex gap-2 items-start bg-muted/40 p-2 rounded-lg border border-border/40">
                  <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={ex.example}
                      onChange={(e) => handleExampleChange(i, "example", e.target.value)}
                      placeholder="Target language sentence..."
                    />
                    <Input
                      value={ex.translation}
                      onChange={(e) => handleExampleChange(i, "translation", e.target.value)}
                      placeholder="Dịch nghĩa tiếng Việt..."
                    />
                  </div>
                  {examples.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveExample(i)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Common Mistakes Dynamic List */}
            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="size-3.5" /> Common Mistakes (Lỗi thường gặp)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMistake}
                  className="h-7 gap-1 text-xs"
                >
                  <Plus className="size-3" /> Add Mistake Rule
                </Button>
              </div>

              {commonMistakes.map((m, i) => (
                <div key={i} className="space-y-2 bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      Rule #{i + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveMistake(i)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={m.incorrect}
                      onChange={(e) => handleMistakeChange(i, "incorrect", e.target.value)}
                      placeholder="Incorrect: Câu sai..."
                    />
                    <Input
                      value={m.correct}
                      onChange={(e) => handleMistakeChange(i, "correct", e.target.value)}
                      placeholder="Correct: Câu đúng..."
                    />
                  </div>
                  <Input
                    value={m.explanation}
                    onChange={(e) => handleMistakeChange(i, "explanation", e.target.value)}
                    placeholder="Giải thích vì sao sai và cách khắc phục..."
                  />
                </div>
              ))}
            </div>

            {/* Related Grammar Tags */}
            <div className="space-y-1.5 border-t border-border pt-3">
              <Label htmlFor="related" className="font-semibold">
                Related Grammar Patterns (Cách nhau bởi dấu phẩy)
              </Label>
              <Input
                id="related"
                value={relatedGrammarInput}
                onChange={(e) => setRelatedGrammarInput(e.target.value)}
                placeholder="e.g., Would for past habits, V+기는 커녕"
              />
            </div>

            {/* Favorite check */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <label className="flex cursor-pointer items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="size-4 rounded border-border text-indigo-600 focus:ring-indigo-600"
                />
                <span>Add to Favorite Grammar Points</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 font-medium text-white shadow-md"
              >
                {isSubmitting
                  ? "Saving…"
                  : itemToEdit
                  ? "Update Grammar"
                  : "Create Grammar"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

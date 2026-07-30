"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Star, Edit, Trash2, Sparkles, BookMarked, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrammarItem } from "../types";

interface GrammarDetailModalProps {
  item: GrammarItem | null;
  onClose: () => void;
  onEdit: (item: GrammarItem) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (item: GrammarItem) => void;
  onOpenAiModal: (item: GrammarItem) => void;
}

export function GrammarDetailModal({
  item,
  onClose,
  onEdit,
  onToggleFavorite,
  onDelete,
  onOpenAiModal,
}: GrammarDetailModalProps) {
  if (!item) return null;

  const getLanguageDetails = (lang: string) => {
    switch (lang) {
      case "en":
        return { name: "English", flag: "🇬🇧", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400" };
      case "ko":
        return { name: "Korean", flag: "🇰🇷", badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400" };
      case "zh":
        return { name: "Chinese", flag: "🇨🇳", badge: "bg-red-500/10 text-red-600 dark:text-red-400" };
      default:
        return { name: lang, flag: "🌐", badge: "bg-muted text-muted-foreground" };
    }
  };

  const langInfo = getLanguageDetails(item.language);

  return (
    <Dialog.Root open={!!item} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 sm:p-7 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${langInfo.badge}`}>
                <span>{langInfo.flag}</span>
                <span>{langInfo.name}</span>
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground uppercase">
                {item.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleFavorite(item.id)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-amber-500"
              >
                <Star
                  className={`size-5 ${
                    item.is_favorite ? "fill-amber-400 text-amber-400" : ""
                  }`}
                />
              </button>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <X className="size-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          {/* Body */}
          <div className="mt-5 space-y-5">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {item.title}
              </h1>
              <p className="mt-1 font-semibold text-base text-indigo-600 dark:text-indigo-400">
                {item.meaning}
              </p>
            </div>

            {/* Explanation & Formula */}
            {item.explanation && (
              <div className="rounded-xl border border-border/80 bg-surface/80 p-4 space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookMarked className="size-3.5 text-indigo-500" /> Explanation & Rules
                </div>
                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed font-mono">
                  {item.explanation}
                </p>
              </div>
            )}

            {/* Examples List */}
            {item.examples?.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Example Sentences ({item.examples.length})
                </div>
                <div className="space-y-2">
                  {item.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border/60 bg-background/80 p-3 text-xs space-y-0.5"
                    >
                      <p className="font-medium text-foreground italic">
                        &quot;{ex.example}&quot;
                      </p>
                      {ex.translation && (
                        <p className="text-muted-foreground">→ {ex.translation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Mistakes */}
            {item.common_mistakes?.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" /> Common Mistakes ({item.common_mistakes.length})
                </div>
                <div className="space-y-2">
                  {item.common_mistakes.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-rose-600 font-bold">❌ Incorrect:</span>
                        <s className="text-foreground">{m.incorrect}</s>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Correct:</span>
                        <span className="font-semibold text-foreground">{m.correct}</span>
                      </div>
                      {m.explanation && (
                        <p className="text-muted-foreground pt-1 border-t border-rose-500/20">
                          💡 {m.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Grammar */}
            {item.related_grammar?.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Related Grammar Patterns
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.related_grammar.map((rel) => (
                    <span
                      key={rel}
                      className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400"
                    >
                      ↔ {rel}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-border pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-1.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                onClick={() => {
                  onClose();
                  onOpenAiModal(item);
                }}
              >
                <Sparkles className="size-4 text-amber-500" /> AI Explanation
              </Button>

              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 gap-1.5"
                onClick={() => {
                  onClose();
                  onDelete(item);
                }}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Edit className="size-4" /> Edit Rule
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

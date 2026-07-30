"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Volume2, Star, Edit, Trash2, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VocabularyItem } from "../types";
import { useSpeech } from "../hooks/use-speech";

interface VocabularyDetailModalProps {
  item: VocabularyItem | null;
  onClose: () => void;
  onEdit: (item: VocabularyItem) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (item: VocabularyItem) => void;
}

export function VocabularyDetailModal({
  item,
  onClose,
  onEdit,
  onToggleFavorite,
  onDelete,
}: VocabularyDetailModalProps) {
  const { speak, isPlaying } = useSpeech();

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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 sm:p-7 max-h-[85vh] overflow-y-auto">
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

          {/* Main Word Header */}
          <div className="mt-5 space-y-4">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.word}
                className="h-48 w-full rounded-xl object-cover border border-border shadow-xs"
              />
            )}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                  {item.word}
                </h1>
                {item.ipa && (
                  <p className="mt-1 font-mono text-base text-primary font-medium">
                    [{item.ipa}]
                  </p>
                )}
              </div>

              <Button
                onClick={() => speak(item.word, item.language, item.audio_url)}
                variant="outline"
                className={`gap-2 rounded-full shadow-xs ${
                  isPlaying ? "border-primary text-primary animate-pulse" : ""
                }`}
              >
                <Volume2 className="size-4" />
                <span>Listen</span>
              </Button>
            </div>

            {/* Meanings */}
            <div className="rounded-xl border border-border/80 bg-surface/80 p-4 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary uppercase">
                  {item.part_of_speech}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {item.vietnamese}
                </span>
              </div>

              {item.english_meaning && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.english_meaning}
                </p>
              )}
            </div>

            {/* Example */}
            {item.example && (
              <div className="space-y-1.5 rounded-xl border border-border/60 bg-background/80 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <BookOpen className="size-3.5" /> Example Context
                </div>
                <p className="text-sm font-medium text-foreground italic">
                  &quot;{item.example}&quot;
                </p>
                {item.example_translation && (
                  <p className="text-xs text-muted-foreground">
                    → {item.example_translation}
                  </p>
                )}
              </div>
            )}

            {/* Synonyms & Antonyms */}
            {(item.synonyms?.length > 0 || item.antonyms?.length > 0) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {item.synonyms?.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Synonyms (Từ đồng nghĩa)
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.synonyms.map((syn) => (
                        <span
                          key={syn}
                          className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.antonyms?.length > 0 && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                    <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      Antonyms (Từ trái nghĩa)
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.antonyms.map((ant) => (
                        <span
                          key={ant}
                          className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-300"
                        >
                          {ant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collection & Frequency */}
            <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Layers className="size-3.5" /> Collection:{" "}
                <span className="font-semibold text-foreground">{item.collection}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Frequency:</span>
                <span className="font-semibold text-foreground">{item.frequency}/5★</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-between border-t border-border pt-4">
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

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="gap-1.5"
              >
                <Edit className="size-4" /> Edit Word
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

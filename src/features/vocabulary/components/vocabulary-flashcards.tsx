"use client";

import { useState } from "react";
import { Volume2, Star, ChevronLeft, ChevronRight, Shuffle, RotateCw, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VocabularyItem } from "../types";
import { useSpeech } from "../hooks/use-speech";

interface VocabularyFlashcardsProps {
  items: VocabularyItem[];
  onToggleFavorite: (id: string) => void;
  onExit: () => void;
}

export function VocabularyFlashcards({
  items,
  onToggleFavorite,
  onExit,
}: VocabularyFlashcardsProps) {
  const { speak } = useSpeech();
  const [deck, setDeck] = useState<VocabularyItem[]>(items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentItem = deck[currentIndex];

  if (deck.length === 0 || !currentItem) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
        <Sparkles className="size-8 text-amber-500 mb-2" />
        <h3 className="font-display text-lg font-semibold">No Flashcards to Study</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add some words or change your active filters to study with flashcards.
        </p>
        <Button onClick={onExit} className="mt-4">
          Back to Vocabulary List
        </Button>
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const progressPercentage = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExit} className="gap-1.5">
            <X className="size-4" /> Exit Flashcards
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShuffle} className="gap-1.5 text-xs">
            <Shuffle className="size-3.5" /> Shuffle
          </Button>
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          Card {currentIndex + 1} of {deck.length} ({progressPercentage}%)
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* 3D Flip Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="group relative min-h-[360px] w-full cursor-pointer rounded-2xl border border-border/80 bg-surface/90 p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-2xl flex flex-col justify-between"
      >
        {/* Card Top: Flag, POS, Favorite */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide">
            {currentItem.language === "en"
              ? "🇬🇧 English"
              : currentItem.language === "ko"
              ? "🇰🇷 Korean"
              : "🇨🇳 Chinese"}{" "}
            · {currentItem.part_of_speech}
          </span>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => speak(currentItem.word, currentItem.language, currentItem.audio_url)}
              className="rounded-full bg-background border border-border p-2 text-muted-foreground hover:text-primary transition-colors"
              title="Pronounce"
            >
              <Volume2 className="size-4" />
            </button>
            <button
              onClick={() => onToggleFavorite(currentItem.id)}
              className="rounded-full bg-background border border-border p-2 text-muted-foreground hover:text-amber-500 transition-colors"
            >
              <Star
                className={`size-4 ${
                  currentItem.is_favorite ? "fill-amber-400 text-amber-400" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card Center: Front (Word) or Back (Meaning & Examples) */}
        <div className="my-auto text-center py-6">
          {!isFlipped ? (
            /* FRONT OF CARD */
            <div className="space-y-3 animate-in fade-in">
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                {currentItem.word}
              </h2>
              {currentItem.ipa && (
                <p className="font-mono text-lg text-primary font-medium">
                  [{currentItem.ipa}]
                </p>
              )}
              <p className="text-xs text-muted-foreground pt-4 flex items-center justify-center gap-1">
                <RotateCw className="size-3" /> Click card to flip & reveal meaning
              </p>
            </div>
          ) : (
            /* BACK OF CARD */
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {currentItem.vietnamese}
                </h3>
                {currentItem.english_meaning && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentItem.english_meaning}
                  </p>
                )}
              </div>

              {currentItem.example && (
                <div className="mx-auto max-w-md rounded-xl border border-border/60 bg-background/80 p-3 text-xs text-left">
                  <p className="font-medium italic text-foreground">
                    &quot;{currentItem.example}&quot;
                  </p>
                  {currentItem.example_translation && (
                    <p className="mt-1 text-muted-foreground">
                      → {currentItem.example_translation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Bottom Hint */}
        <div className="text-center text-[11px] font-medium text-muted-foreground border-t border-border/40 pt-3">
          Collection: <span className="text-foreground">{currentItem.collection}</span> · Difficulty:{" "}
          <span className="capitalize text-foreground">{currentItem.difficulty}</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={handlePrev}
          variant="outline"
          size="lg"
          className="flex-1 gap-2 rounded-xl"
        >
          <ChevronLeft className="size-5" /> Previous
        </Button>
        <Button
          onClick={handleNext}
          size="lg"
          className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 font-medium shadow-md"
        >
          Next <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}

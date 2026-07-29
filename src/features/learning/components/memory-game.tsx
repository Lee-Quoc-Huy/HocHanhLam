"use client";

import { useState } from "react";
import { Brain, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameResult, MemoryCardItem } from "../types";
import { SAMPLE_MATCHING_PAIRS } from "../api/learning-service";

interface MemoryGameProps {
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

export function MemoryGame({ onFinish, onExit }: MemoryGameProps) {
  const pairs = SAMPLE_MATCHING_PAIRS;

  const [cards, setCards] = useState<MemoryCardItem[]>(() => {
    const list: MemoryCardItem[] = [];
    pairs.forEach((p) => {
      list.push({ id: `m-term-${p.id}`, pairId: p.id, content: p.term, type: "term", isFlipped: false, isMatched: false });
      list.push({ id: `m-def-${p.id}`, pairId: p.id, content: p.definition, type: "definition", isFlipped: false, isMatched: false });
    });
    return list.sort(() => Math.random() - 0.5);
  });

  const [flippedCards, setFlippedCards] = useState<MemoryCardItem[]>([]);
  const [moves, setMoves] = useState(0);

  const handleCardClick = (card: MemoryCardItem) => {
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const updatedCards = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setCards(updatedCards);

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const first = newFlipped[0];
      const second = newFlipped[1];

      if (!first || !second) return;

      if (first.pairId === second.pairId) {
        // Match!
        setCards((prev) =>
          prev.map((c) => (c.pairId === first.pairId ? { ...c, isMatched: true } : c))
        );
        setFlippedCards([]);

        // Check if all matched
        if (cards.filter((c) => c.isMatched).length + 2 === cards.length) {
          setTimeout(() => {
            onFinish({
              gameMode: "memory_game",
              score: pairs.length,
              totalQuestions: pairs.length,
              accuracy: 100,
              xpEarned: 120,
              timeSeconds: 40,
            });
          }, 600);
        }
      } else {
        // Flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c))
          );
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-border/80 bg-surface-raised p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Memory Game 🧠
          </span>
          <h2 className="mt-1.5 font-display text-xl font-bold text-foreground">
            Lật Thẻ Trí Nhớ ({cards.filter((c) => c.isMatched).length / 2}/{pairs.length}) · Lượt lật: {moves}
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground hover:text-foreground">
          Thoát Game
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => {
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`h-28 rounded-2xl border font-bold text-xs sm:text-sm text-center flex items-center justify-center p-3 transition-all duration-300 shadow-md ${
                card.isFlipped || card.isMatched
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold scale-[1.02]"
                  : "border-border bg-gradient-to-br from-surface to-background text-muted-foreground hover:border-emerald-500/50"
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <span>{card.content}</span>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground/60">
                  <Brain className="size-6" />
                  <span className="text-[10px] font-mono">LẬT THẺ</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

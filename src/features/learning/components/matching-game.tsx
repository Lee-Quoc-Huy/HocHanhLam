"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameResult } from "../types";
import { SAMPLE_MATCHING_PAIRS } from "../api/learning-service";

interface MatchingGameProps {
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

interface TileItem {
  id: string;
  pairId: string;
  text: string;
  type: "term" | "definition";
}

export function MatchingGame({ onFinish, onExit }: MatchingGameProps) {
  const pairs = SAMPLE_MATCHING_PAIRS;

  const [tiles] = useState<TileItem[]>(() => {
    const list: TileItem[] = [];
    pairs.forEach((p) => {
      list.push({ id: `t-${p.id}`, pairId: p.id, text: p.term, type: "term" });
      list.push({ id: `d-${p.id}`, pairId: p.id, text: p.definition, type: "definition" });
    });
    return list.sort(() => Math.random() - 0.5);
  });

  const [selectedFirst, setSelectedFirst] = useState<TileItem | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [errorId, setErrorId] = useState<string | null>(null);

  const handleSelectTile = (tile: TileItem) => {
    if (matchedIds.includes(tile.id)) return;

    if (!selectedFirst) {
      setSelectedFirst(tile);
      return;
    }

    if (selectedFirst.id === tile.id) return;

    // Check match
    if (selectedFirst.pairId === tile.pairId) {
      setMatchedIds((prev) => [...prev, selectedFirst.id, tile.id]);
      setSelectedFirst(null);

      // Check if all matched
      if (matchedIds.length + 2 === tiles.length) {
        setTimeout(() => {
          onFinish({
            gameMode: "matching_game",
            score: pairs.length,
            totalQuestions: pairs.length,
            accuracy: 100,
            xpEarned: 100,
            timeSeconds: 30,
          });
        }, 500);
      }
    } else {
      setErrorId(tile.id);
      setTimeout(() => {
        setSelectedFirst(null);
        setErrorId(null);
      }, 600);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-border/80 bg-surface-raised p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Matching Game 🃏
          </span>
          <h2 className="mt-1.5 font-display text-xl font-bold text-foreground">
            Ghép Thẻ Từ Vựng & Nghĩa ({matchedIds.length / 2}/{pairs.length})
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground hover:text-foreground">
          Thoát Game
        </Button>
      </div>

      {/* Tiles Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => {
          const isMatched = matchedIds.includes(tile.id);
          const isSelected = selectedFirst?.id === tile.id;
          const isError = errorId === tile.id;

          let btnClass = "border-border bg-surface hover:border-emerald-500 hover:bg-emerald-500/10 text-foreground";
          if (isMatched) btnClass = "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 opacity-40 pointer-events-none";
          else if (isSelected) btnClass = "border-emerald-600 bg-emerald-500/20 text-emerald-600 font-bold scale-[1.03]";
          else if (isError) btnClass = "border-rose-500 bg-rose-500/20 text-rose-600 animate-shake";

          return (
            <button
              key={tile.id}
              onClick={() => handleSelectTile(tile)}
              className={`h-24 p-3 rounded-2xl border font-bold text-xs sm:text-sm text-center flex items-center justify-center transition-all duration-200 shadow-xs ${btnClass}`}
            >
              <span>{tile.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Zap, Check, X, RotateCcw, Trophy, Flame, Volume2, Plus, Wand2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flashcard } from "../types";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";

interface FlashcardReflexEngineProps {
  queue: Flashcard[];
  aiItems?: any[];
  onOpenCreateCardForGame?: () => void;
  onOpenAutoGenForGame?: () => void;
  onDeleteCard?: (id: string) => void;
}

interface ReflexItem {
  card: Flashcard;
  shownMeaning: string;
  isMatch: boolean;
}

export function FlashcardReflexEngine({
  queue,
  aiItems,
  onOpenCreateCardForGame,
  onOpenAutoGenForGame,
  onDeleteCard,
}: FlashcardReflexEngineProps) {
  const { speak } = useSpeech();
  const [items, setItems] = useState<ReflexItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(4); // 4 seconds per word
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | "timeout" | null>(null);

  // Generate true/false reflex pairs
  useEffect(() => {
    if (queue.length === 0) return;
    const generated: ReflexItem[] = queue.map((card) => {
      const isMatch = Math.random() > 0.4; // 60% chance True, 40% False
      let shownMeaning = card.back_text;

      if (!isMatch) {
        const distractors = queue.filter((c) => c.id !== card.id && c.back_text !== card.back_text);
        if (distractors.length > 0) {
          shownMeaning = distractors[Math.floor(Math.random() * distractors.length)].back_text;
        } else {
          shownMeaning = "Nghĩa khác";
        }
      }

      return { card, shownMeaning, isMatch };
    });

    setItems(generated);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCompleted(false);
    setTimeLeft(4);
    setLastResult(null);
  }, [queue]);

  // Countdown timer per item
  useEffect(() => {
    if (completed || items.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(null); // Time out!
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, completed, items]);

  const currentItem = items[currentIndex];

  const handleAnswer = (userChoice: boolean | null) => {
    if (completed || !currentItem) return;

    const correct = userChoice !== null && userChoice === currentItem.isMatch;

    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setLastResult("correct");
    } else {
      setStreak(0);
      setLastResult(userChoice === null ? "timeout" : "wrong");
    }

    if (currentIndex < items.length - 1) {
      setCurrentIndex((i) => i + 1);
      setTimeLeft(4);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCompleted(false);
    setTimeLeft(4);
    setLastResult(null);
  };

  if (queue.length === 0 || !currentItem) {
    return (
      <div className="mx-auto max-w-md space-y-3">
        {(onOpenAutoGenForGame || onOpenCreateCardForGame) && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {onOpenAutoGenForGame && (
              <Button size="sm" onClick={onOpenAutoGenForGame} className="h-8 text-xs gap-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl">
                <Wand2 className="size-3.5" /> Tạo Tự Động
              </Button>
            )}
            {onOpenCreateCardForGame && (
              <Button size="sm" onClick={onOpenCreateCardForGame} className="h-8 text-xs gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl">
                <Plus className="size-3.5" /> + Thẻ Phản Xạ
              </Button>
            )}
          </div>
        )}
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface/40">
          <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mx-auto mb-3">
            <Zap className="size-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">Chưa Có Thẻ Để Thử Phản Xạ</h3>
          <p className="mt-2 text-sm text-muted-foreground">Tạo thêm thẻ từ vựng để bắt đầu thử thách phản xạ tốc độ!</p>
        </div>
      </div>
    );
  }

  if (completed) {
    const accuracy = Math.round((score / items.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-3xl border border-amber-500/30 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl space-y-6"
      >
        <div className="flex size-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 mx-auto border border-amber-500/30">
          <Trophy className="size-10" />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">Hoàn Thành Thử Thách Phản Xạ!</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Điểm Phản Xạ</span>
            <p className="font-display text-2xl font-bold text-amber-500">{score} / {items.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Chính Xác</span>
            <p className="font-display text-2xl font-bold text-emerald-500">{accuracy}%</p>
          </div>
        </div>
        <Button onClick={handleRestart} className="w-full gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white py-6">
          <RotateCcw className="size-4" /> Thử Lại
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1">
          <Zap className="size-4 text-amber-500" />
          <span>Thẻ {currentIndex + 1} / {items.length}</span>
        </span>

        {streak > 1 && (
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Flame className="size-3.5 fill-amber-500" /> Streak {streak}🔥
          </span>
        )}

        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-600 font-bold border border-amber-500/20">
          ⏱️ Còn lại: {timeLeft}s
        </span>
      </div>

      {/* Timer Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-1000 ${
            timeLeft <= 1 ? "bg-rose-500" : "bg-gradient-to-r from-amber-500 to-emerald-500"
          }`}
          style={{ width: `${(timeLeft / 4) * 100}%` }}
        />
      </div>

      {/* Main Reflex Box */}
      <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 text-center shadow-xl backdrop-blur-md space-y-6">
        <div className="flex justify-between items-center">
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 uppercase">
            ⚡ Phản Xạ Tốc Độ
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => speak(currentItem.card.front_text, currentItem.card.language)}
              className="p-2 rounded-full border border-border bg-background text-muted-foreground hover:text-emerald-500"
            >
              <Volume2 className="size-4" />
            </button>
            {onDeleteCard && (
              <button
                onClick={() => onDeleteCard(currentItem.card.id)}
                className="p-2 rounded-full border border-border bg-background text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Xóa thẻ này khỏi Supabase"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="py-4 space-y-3">
          <h2 className="font-display text-4xl font-extrabold text-foreground">{currentItem.card.front_text}</h2>
          <div className="text-xs text-muted-foreground uppercase font-semibold">Bằng với nghĩa:</div>
          <div className="rounded-2xl border border-border bg-background/80 p-4 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            "{currentItem.shownMeaning}"
          </div>
        </div>

        {/* Action Buttons: TRUE or FALSE */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Button
            onClick={() => handleAnswer(false)}
            size="lg"
            className="py-7 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg gap-2 shadow-lg"
          >
            <X className="size-6" /> SAI (False)
          </Button>

          <Button
            onClick={() => handleAnswer(true)}
            size="lg"
            className="py-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg gap-2 shadow-lg"
          >
            <Check className="size-6" /> ĐÚNG (True)
          </Button>
        </div>

        {lastResult && (
          <div className="text-xs font-bold pt-1">
            {lastResult === "correct" && <span className="text-emerald-500">⚡ Chính xác!</span>}
            {lastResult === "wrong" && <span className="text-rose-500">❌ Chưa đúng!</span>}
            {lastResult === "timeout" && <span className="text-amber-500">⏰ Hết giờ!</span>}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Keyboard, Clock, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameResult } from "../types";
import { SAMPLE_TYPING_TARGETS } from "../api/learning-service";

interface TypingGameProps {
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

export function TypingGame({ onFinish, onExit }: TypingGameProps) {
  const targets = SAMPLE_TYPING_TARGETS;
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTarget = targets[currentIndex];
  const [userInput, setUserInput] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentTarget) {
    return (
      <div className="p-8 text-center">
        <p>Không tìm thấy mục gõ phím.</p>
        <Button onClick={onExit} className="mt-4">Quay lại</Button>
      </div>
    );
  }

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);

    if (val.trim() === currentTarget.text.trim()) {
      if (currentIndex < targets.length - 1) {
        setCurrentIndex((i) => i + 1);
        setUserInput("");
      } else {
        // Finished typing game
        onFinish({
          gameMode: "typing_game",
          score: targets.length,
          totalQuestions: targets.length,
          accuracy: 100,
          xpEarned: 110,
          timeSeconds: timer,
        });
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-border/80 bg-surface-raised p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
            Typing Speed Game ⌨️
          </span>
          <h2 className="mt-1.5 font-display text-xl font-bold text-foreground">
            Luyện Gõ Phím Nhanh & Chính Xác ({currentIndex + 1}/{targets.length})
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Clock className="size-4" /> {timer}s
          </span>
          <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground hover:text-foreground">
            Thoát Game
          </Button>
        </div>
      </div>

      {/* Target Sentence Display */}
      <div className="space-y-2">
        <div className="rounded-2xl border border-border bg-background p-5 font-mono text-base font-bold text-foreground tracking-wide select-none leading-relaxed">
          {currentTarget.text.split("").map((char, i) => {
            let charColor = "text-muted-foreground";
            if (i < userInput.length) {
              charColor = userInput[i] === char ? "text-emerald-600 dark:text-emerald-400 font-bold underline" : "text-rose-600 bg-rose-500/20";
            }
            return (
              <span key={i} className={charColor}>
                {char}
              </span>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground italic">Dịch nghĩa: &quot;{currentTarget.translation}&quot;</p>
      </div>

      {/* Typing Input */}
      <div className="relative">
        <input
          autoFocus
          type="text"
          value={userInput}
          onChange={handleChangeInput}
          placeholder="Nhập lại chính xác câu phía trên vào đây..."
          className="w-full h-14 rounded-2xl border border-emerald-500/50 bg-background px-4 font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
    </div>
  );
}

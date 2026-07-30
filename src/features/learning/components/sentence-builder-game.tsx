"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameResult } from "../types";
import { SAMPLE_SENTENCE_BUILDER } from "../api/learning-service";

interface SentenceBuilderGameProps {
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

export function SentenceBuilderGame({ onFinish, onExit }: SentenceBuilderGameProps) {
  const questions = SAMPLE_SENTENCE_BUILDER;
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQ = questions[currentIndex];
  const [availableWords, setAvailableWords] = useState<string[]>(() =>
    currentQ ? [...currentQ.words].sort(() => Math.random() - 0.5) : []
  );
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isCheckSubmitted, setIsCheckSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  if (!currentQ) {
    return (
      <div className="p-8 text-center">
        <p>Không tìm thấy câu ghép.</p>
        <Button onClick={onExit} className="mt-4">Quay lại</Button>
      </div>
    );
  }

  const handleSelectWord = (word: string, index: number) => {
    if (isCheckSubmitted) return;
    setSelectedWords((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeselectWord = (word: string, index: number) => {
    if (isCheckSubmitted) return;
    setAvailableWords((prev) => [...prev, word]);
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckAnswer = () => {
    const builtSentence = selectedWords.join(" ");
    const correct = builtSentence.trim() === currentQ.originalSentence.trim();
    setIsCorrect(correct);
    setIsCheckSubmitted(true);
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextQ = questions[currentIndex + 1];
      setCurrentIndex((i) => i + 1);
      if (nextQ) {
        setAvailableWords([...nextQ.words].sort(() => Math.random() - 0.5));
      }
      setSelectedWords([]);
      setIsCheckSubmitted(false);
    } else {
      const accuracy = Math.round((score / questions.length) * 100);
      onFinish({
        gameMode: "sentence_builder",
        score,
        totalQuestions: questions.length,
        accuracy,
        xpEarned: score * 30 + 30,
        timeSeconds: 45,
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-border/80 bg-surface-raised p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Sentence Builder 🧩
          </span>
          <h2 className="mt-1.5 font-display text-xl font-bold text-foreground">
            Sắp xếp từ thành câu đúng ({currentIndex + 1}/{questions.length})
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground hover:text-foreground">
          Thoát Game
        </Button>
      </div>

      {/* Translation Hint */}
      <div className="rounded-2xl border border-border bg-background p-4 font-medium text-sm text-foreground">
        💡 Câu cần ghép: <span className="text-emerald-600 dark:text-emerald-400 font-bold">&quot;{currentQ.translation}&quot;</span>
      </div>

      {/* Built Sentence Container Drop Area */}
      <div className="min-h-[90px] rounded-2xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-wrap items-center gap-2">
        {selectedWords.length === 0 && (
          <span className="text-xs text-muted-foreground italic">Nhấp vào các từ phía dưới để xếp thành câu...</span>
        )}
        {selectedWords.map((word, idx) => (
          <button
            key={idx}
            onClick={() => handleDeselectWord(word, idx)}
            className="rounded-xl border border-emerald-500/40 bg-emerald-600 text-white px-3 py-1.5 text-sm font-bold shadow-xs hover:bg-emerald-700 transition-all animate-in zoom-in-90"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Available Word Tiles */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {availableWords.map((word, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectWord(word, idx)}
            className="rounded-xl border border-border bg-surface hover:border-emerald-500 hover:bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-foreground shadow-xs transition-all"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Answer Feedback Banner */}
      {isCheckSubmitted && (
        <div className={`rounded-2xl border p-4 text-xs font-bold flex items-center gap-2 ${
          isCorrect
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
            : "border-rose-500/30 bg-rose-500/10 text-rose-600"
        }`}>
          {isCorrect ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
          <span>{isCorrect ? "Chính xác! Bạn ghép câu rất chuẩn 🎉" : `Chưa đúng! Đáp án đúng: "${currentQ.originalSentence}"`}</span>
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        {!isCheckSubmitted ? (
          <Button
            onClick={handleCheckAnswer}
            disabled={selectedWords.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6"
          >
            Kiểm Tra Câu
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6"
          >
            <span>Câu Tiếp Theo</span>
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

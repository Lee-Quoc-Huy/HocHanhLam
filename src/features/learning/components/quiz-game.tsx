"use client";

import { useState, useEffect } from "react";
import { Volume2, CheckCircle2, XCircle, ArrowRight, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizQuestion, GameResult, GameMode } from "../types";
import { SAMPLE_QUIZZES } from "../api/learning-service";

interface QuizGameProps {
  mode: GameMode;
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

export function QuizGame({ mode, onFinish, onExit }: QuizGameProps) {
  const questions: QuizQuestion[] = SAMPLE_QUIZZES[mode] || SAMPLE_QUIZZES.quiz || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished
      const accuracy = Math.round((score / (questions.length || 1)) * 100);
      const xpEarned = score * 25 + 20;

      onFinish({
        gameMode: mode,
        score,
        totalQuestions: questions.length,
        accuracy,
        xpEarned,
        timeSeconds: timer,
      });
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!currentQ) {
    return (
      <div className="p-8 text-center">
        <p>Không tìm thấy câu hỏi bài Quiz.</p>
        <Button onClick={onExit} className="mt-4">Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-border/80 bg-surface-raised p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
      {/* Game Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {mode.replace("_", " ")}
          </span>
          <h2 className="mt-1.5 font-display text-xl font-bold text-foreground">
            Câu {currentIndex + 1} / {questions.length}
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

      {/* Audio Playback for Listening Quiz */}
      {mode === "listening_quiz" && (
        <div className="flex items-center justify-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <Button
            size="lg"
            onClick={() => speakText(currentQ.question)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
          >
            <Volume2 className="size-5" /> Phát Âm Thanh Mẫu
          </Button>
        </div>
      )}

      {/* Question Text */}
      <div className="rounded-2xl border border-border bg-background p-5 font-bold text-base text-foreground leading-relaxed">
        {currentQ.question}
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {currentQ.options.map((opt, optIdx) => {
          const isSelected = selectedOption === optIdx;
          const isCorrect = optIdx === currentQ.correctAnswer;

          let btnClass = "border-border bg-surface hover:bg-muted text-foreground";
          if (isAnswered) {
            if (isCorrect) btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold shadow-xs";
            else if (isSelected) btnClass = "border-rose-500 bg-rose-500/10 text-rose-600";
          } else if (isSelected) {
            btnClass = "border-emerald-600 bg-emerald-500/10 text-emerald-600 font-bold";
          }

          return (
            <button
              key={optIdx}
              onClick={() => handleSelectOption(optIdx)}
              disabled={isAnswered}
              className={`p-4 rounded-xl border text-sm font-semibold text-left transition-all duration-200 flex items-center justify-between ${btnClass}`}
            >
              <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
              {isAnswered && isCorrect && <CheckCircle2 className="size-4 text-emerald-600" />}
              {isAnswered && isSelected && !isCorrect && <XCircle className="size-4 text-rose-600" />}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      {isAnswered && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 text-xs font-mono">
          <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="size-4 text-amber-500" /> Giải thích chi tiết từ AI:
          </p>
          <p className="text-muted-foreground leading-relaxed">{currentQ.explanation}</p>
        </div>
      )}

      {/* Footer Next Action */}
      <div className="flex justify-end pt-2 border-t border-border">
        <Button
          onClick={handleNextQuestion}
          disabled={!isAnswered}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6"
        >
          <span>{currentIndex < questions.length - 1 ? "Câu Tiếp Theo" : "Hoàn Thành & Nhận XP"}</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

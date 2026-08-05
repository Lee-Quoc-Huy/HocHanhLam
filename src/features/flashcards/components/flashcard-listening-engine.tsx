"use client";

import { useState, useEffect } from "react";
import { Headphones, Volume2, CheckCircle2, XCircle, RotateCcw, Trophy, ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flashcard } from "../types";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";
import { cn } from "@/lib/utils/cn";

interface FlashcardListeningEngineProps {
  queue: Flashcard[];
}

export function FlashcardListeningEngine({ queue }: FlashcardListeningEngineProps) {
  const { speak } = useSpeech();
  const [listenMode, setListenMode] = useState<"pick" | "write">("pick");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  const currentCard = queue[currentIndex];

  useEffect(() => {
    if (!currentCard || queue.length === 0) return;

    // Auto play sound when card changes
    speak(currentCard.front_text, currentCard.language, currentCard.audio_url);

    // Generate options for pick mode
    const distractors = queue
      .filter((c) => c.id !== currentCard.id && c.front_text !== currentCard.front_text)
      .map((c) => c.front_text);

    const shuffled = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
    while (shuffled.length < 3) {
      shuffled.push(`Đáp án ${shuffled.length + 1}`);
    }

    setOptions([...shuffled, currentCard.front_text].sort(() => 0.5 - Math.random()));
    setUserInput("");
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentIndex, queue]);

  if (queue.length === 0 || !currentCard) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-12 text-center bg-surface/40">
        <div className="flex size-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 mx-auto mb-3">
          <Headphones className="size-8" />
        </div>
        <h3 className="font-display text-xl font-bold text-foreground">Chưa Có Thẻ Để Luyện Nghe</h3>
        <p className="mt-2 text-sm text-muted-foreground">Tạo thêm thẻ vựng để bắt đầu bài luyện nghe phát âm!</p>
      </div>
    );
  }

  const handlePlayAudio = () => {
    speak(currentCard.front_text, currentCard.language, currentCard.audio_url);
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const correct = opt === currentCard.front_text;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered) {
      handleNext();
      return;
    }

    if (!userInput.trim()) return;
    const correct = userInput.trim().toLowerCase() === currentCard.front_text.trim().toLowerCase();
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCompleted(false);
  };

  if (completed) {
    const accuracy = Math.round((score / queue.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-3xl border border-purple-500/30 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl space-y-6"
      >
        <div className="flex size-20 items-center justify-center rounded-3xl bg-purple-500/10 text-purple-500 mx-auto border border-purple-500/30">
          <Trophy className="size-10" />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">Hoàn Thành Bài Luyện Nghe!</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Điểm Số</span>
            <p className="font-display text-2xl font-bold text-purple-600">{score} / {queue.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Chính Xác</span>
            <p className="font-display text-2xl font-bold text-teal-600">{accuracy}%</p>
          </div>
        </div>
        <Button onClick={handleRestart} className="w-full gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white py-6">
          <RotateCcw className="size-4" /> Luyện Lại
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Headphones className="size-4 text-purple-500" />
          <span>Câu {currentIndex + 1} / {queue.length}</span>
        </span>
        {streak > 1 && (
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Flame className="size-3.5 fill-amber-500" /> Streak {streak}🔥
          </span>
        )}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / queue.length) * 100)}%` }}
        />
      </div>

      {/* Main Audio Box */}
      <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 text-center shadow-xl backdrop-blur-md space-y-6">
        <div className="flex justify-between items-center">
          {/* Sub-mode switcher: Pick or Write */}
          <div className="flex rounded-lg border border-border bg-background p-0.5 text-xs font-semibold">
            <button
              onClick={() => setListenMode("pick")}
              className={cn("px-2.5 py-1 rounded-md transition-all", listenMode === "pick" ? "bg-purple-600 text-white" : "text-muted-foreground")}
            >
              Nghe & Chọn
            </button>
            <button
              onClick={() => setListenMode("write")}
              className={cn("px-2.5 py-1 rounded-md transition-all", listenMode === "write" ? "bg-purple-600 text-white" : "text-muted-foreground")}
            >
              Nghe & Viết
            </button>
          </div>

          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 uppercase">
            {currentCard.language === "en" ? "🇬🇧 EN" : currentCard.language === "ko" ? "🇰🇷 KO" : "🇨🇳 ZH"}
          </span>
        </div>

        {/* Big Audio Trigger */}
        <div className="py-6 space-y-4">
          <Button
            onClick={handlePlayAudio}
            size="lg"
            className="size-24 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600 text-white shadow-xl hover:scale-105 transition-transform mx-auto flex flex-col items-center justify-center gap-1"
          >
            <Volume2 className="size-8 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Nghe Âm Thanh</span>
          </Button>

          <p className="text-xs text-muted-foreground">
            Bấm vào biểu tượng loa để nghe rõ phát âm từ vựng.
          </p>
        </div>

        {/* MODE A: LISTEN & PICK */}
        {listenMode === "pick" && (
          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            {options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isRight = opt === currentCard.front_text;

              let buttonStyle = "border-border bg-background text-foreground hover:border-purple-500/50";

              if (isAnswered) {
                if (isRight) {
                  buttonStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-600 font-bold shadow-md";
                } else if (isSelected) {
                  buttonStyle = "border-rose-500 bg-rose-500/20 text-rose-500 font-bold shadow-md";
                } else {
                  buttonStyle = "border-border/40 bg-background/50 text-muted-foreground opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition-all shadow-2xs active:scale-98",
                    buttonStyle
                  )}
                >
                  <span>{opt}</span>
                  {isAnswered && isRight && <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />}
                  {isAnswered && isSelected && !isRight && <XCircle className="size-5 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* MODE B: LISTEN & WRITE */}
        {listenMode === "write" && (
          <form onSubmit={handleWriteSubmit} className="space-y-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isAnswered}
              placeholder="Gõ từ bạn nghe được vào đây..."
              className={`w-full rounded-2xl border bg-background px-4 py-3.5 text-center text-lg font-bold outline-none transition-all ${
                isAnswered
                  ? isCorrect
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-rose-500 bg-rose-500/10 text-rose-600"
                  : "border-border focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              }`}
            />
            <Button
              type="submit"
              disabled={!isAnswered && !userInput.trim()}
              className="w-full py-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {isAnswered ? "Tiếp Theo" : "Kiểm Tra"}
            </Button>
          </form>
        )}

        {/* Feedback / Next button */}
        {isAnswered && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold">
              {isCorrect ? (
                <span className="text-emerald-500 flex items-center justify-center gap-1">
                  <CheckCircle2 className="size-4" /> Chính xác! ({currentCard.front_text} = {currentCard.back_text})
                </span>
              ) : (
                <span className="text-rose-500 flex items-center justify-center gap-1">
                  <XCircle className="size-4" /> Từ đúng là: <strong className="font-mono text-sm underline">{currentCard.front_text}</strong> ({currentCard.back_text})
                </span>
              )}
            </div>

            <Button
              onClick={handleNext}
              className="w-full py-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 shadow-md"
            >
              <span>{currentIndex < queue.length - 1 ? "Câu Tiếp Theo" : "Xem Kết Quả"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

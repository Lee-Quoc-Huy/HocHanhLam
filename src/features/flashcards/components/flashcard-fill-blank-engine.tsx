"use client";

import { useState, useEffect } from "react";
import { Puzzle, CheckCircle2, XCircle, RotateCcw, Trophy, ArrowRight, Flame, Volume2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flashcard } from "../types";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";
import { cn } from "@/lib/utils/cn";

interface FlashcardFillBlankEngineProps {
  queue: Flashcard[];
  allCards?: Flashcard[]; // All vocab in system for harder distractors
  aiItems?: any[];
  onOpenAutoGenForGame?: () => void;
}

interface BlankQuestion {
  card: Flashcard;
  sentenceWithBlank: string;
  missingWord: string;
  options: string[];
  questionType: "foreign_to_vn" | "vn_to_foreign";
}

export function FlashcardFillBlankEngine({
  queue,
  allCards,
  aiItems,
  onOpenAutoGenForGame,
}: FlashcardFillBlankEngineProps) {
  const { speak, stop } = useSpeech();
  const [questions, setQuestions] = useState<BlankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  useEffect(() => {
    if (queue.length === 0) return;

    // Use ALL cards as distractor pool for harder options
    const distractorPool = (allCards && allCards.length >= 6) ? allCards : queue;

    const generated: BlankQuestion[] = queue.map((card) => {
      // 50% chance: show sentence/context with missing FOREIGN word
      // 50% chance: show Vietnamese and blank the Vietnamese translation
      const useVnBlank = Math.random() > 0.5;

      let sentenceWithBlank: string;
      let missingWord: string;
      let questionType: "foreign_to_vn" | "vn_to_foreign";

      if (useVnBlank) {
        // Show the foreign word, blank is the Vietnamese meaning
        missingWord = card.back_text;
        sentenceWithBlank = `${card.front_text} có nghĩa là: [ ___ ]`;
        questionType = "foreign_to_vn";
      } else {
        // Show Vietnamese, blank is the foreign word
        missingWord = card.front_text;
        const example = card.back_explanation || "";
        if (example && example.toLowerCase().includes(missingWord.toLowerCase())) {
          const regex = new RegExp(missingWord, "gi");
          sentenceWithBlank = example.replace(regex, "[ ___ ]");
        } else {
          sentenceWithBlank = `"${card.back_text}" = [ ___ ]`;
        }
        questionType = "vn_to_foreign";
      }

      // Build distractors from ALL system cards (much harder)
      const distractors = distractorPool
        .filter((c) => c.id !== card.id)
        .map((c) => (questionType === "foreign_to_vn" ? c.back_text : c.front_text))
        .filter((d) => d && d !== missingWord && d.trim().length > 0);

      const uniqueDistractors = Array.from(new Set(distractors));
      const shuffledDistractors = uniqueDistractors.sort(() => 0.5 - Math.random()).slice(0, 3);

      while (shuffledDistractors.length < 3) {
        shuffledDistractors.push(`Lựa chọn ${shuffledDistractors.length + 1}`);
      }

      const options = [...shuffledDistractors, missingWord].sort(() => 0.5 - Math.random());

      return { card, sentenceWithBlank, missingWord, options, questionType };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCompleted(false);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [queue, allCards]);

  if (queue.length === 0 || questions.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl border border-dashed border-indigo-500/30 bg-surface/80 p-8 text-center shadow-xl backdrop-blur-md space-y-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto border border-indigo-500/30 shadow-md">
            <Puzzle className="size-8 animate-pulse" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">Chưa Có Thẻ Điền Từ</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Bấm "🤖 AI Tạo Tự Động" để AI trích xuất bộ thẻ điền từ còn thiếu riêng biệt. Câu hỏi đa chiều: ngoại ngữ ↔ tiếng Việt!
          </p>
          {onOpenAutoGenForGame && (
            <Button onClick={onOpenAutoGenForGame}
              className="py-5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 text-white font-bold text-xs gap-2 shadow-lg hover:opacity-95 active:scale-95">
              <Wand2 className="size-4" /> 🤖 AI Tạo Tự Động Điền Từ
            </Button>
          )}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    const isCorrect = opt === currentQ.missingWord;
    if (isCorrect) { setScore((s) => s + 1); setStreak((s) => s + 1); }
    else setStreak(0);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCompleted(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  if (completed) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-3xl border border-indigo-500/30 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-500 mx-auto border border-indigo-500/30 shadow-md">
          <Trophy className="size-10" />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">Hoàn Thành Bài Điền Từ!</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Điểm Số</span>
            <p className="font-display text-2xl font-bold text-indigo-600">{score} / {questions.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Chính Xác</span>
            <p className="font-display text-2xl font-bold text-teal-600">{accuracy}%</p>
          </div>
        </div>
        <Button onClick={handleRestart} className="w-full gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-6 font-bold shadow-lg">
          <RotateCcw className="size-4" /> Làm Lại
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Single top action bar */}
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3 text-xs shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Puzzle className="size-4 text-indigo-500" /> Điền Từ ({questions.length} thẻ):
        </div>
        {onOpenAutoGenForGame && (
          <Button size="sm" onClick={onOpenAutoGenForGame}
            className="h-8 text-xs gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md active:scale-95">
            <Wand2 className="size-3.5" /> 🤖 AI Tạo Tự Động
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>Câu {currentIndex + 1} / {questions.length}</span>
        {streak > 1 && (
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Flame className="size-3.5 fill-amber-500" /> Streak {streak}🔥
          </span>
        )}
        <span className={cn(
          "rounded-full px-2.5 py-1 text-[10px] font-bold border",
          currentQ.questionType === "vn_to_foreign"
            ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        )}>
          {currentQ.questionType === "vn_to_foreign" ? "🇻🇳 → Ngoại Ngữ" : "Ngoại Ngữ → 🇻🇳"}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%` }} />
      </div>

      <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex justify-between items-center">
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 uppercase border border-indigo-500/20">
            🧩 Điền Từ Vào Chỗ Trống
          </span>
          {currentQ.questionType === "vn_to_foreign" && (
            <button onClick={() => speak(currentQ.card.front_text, currentQ.card.language)}
              className="p-2 rounded-full border border-border bg-background text-muted-foreground hover:text-indigo-600 active:scale-90">
              <Volume2 className="size-4" />
            </button>
          )}
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Chọn từ đúng điền vào chỗ trống:</p>
          <div className="rounded-2xl border border-border bg-background/90 p-5 text-lg font-bold text-foreground leading-relaxed">
            {currentQ.sentenceWithBlank}
          </div>
          {/* DO NOT show the meaning/answer on the card itself */}
        </div>

        {/* 4 Choices Grid */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentQ.missingWord;

            let buttonStyle = "border-border bg-background text-foreground hover:border-indigo-500/50";
            if (isAnswered) {
              if (isCorrect) buttonStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-600 font-bold shadow-md";
              else if (isSelected) buttonStyle = "border-rose-500 bg-rose-500/20 text-rose-500 font-bold shadow-md";
              else buttonStyle = "border-border/40 bg-background/50 text-muted-foreground opacity-50";
            }

            return (
              <button key={idx} disabled={isAnswered} onClick={() => handleSelectOption(opt)}
                className={cn("flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition-all shadow-2xs active:scale-98", buttonStyle)}>
                <span>{opt}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="size-5 text-rose-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="space-y-3 pt-1">
            {/* Show correct answer ONLY after answering */}
            <div className="text-xs text-muted-foreground">
              {selectedOption !== currentQ.missingWord
                ? <span className="text-rose-500">Đáp án đúng: <strong className="font-mono">{currentQ.missingWord}</strong></span>
                : <span className="text-emerald-500">✓ Chính xác!</span>}
            </div>
            <Button onClick={handleNext}
              className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg active:scale-98">
              <span>{currentIndex < questions.length - 1 ? "Câu Tiếp Theo" : "Xem Kết Quả"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

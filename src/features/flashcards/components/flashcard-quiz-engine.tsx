"use client";

import { useState, useEffect } from "react";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  HelpCircle,
  ArrowRight,
  Flame,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Flashcard } from "../types";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";
import { cn } from "@/lib/utils/cn";

interface QuizQuestion {
  card: Flashcard;
  options: string[];
  correctAnswer: string;
  englishHint?: string;
}

interface FlashcardQuizEngineProps {
  queue: Flashcard[];
  allCards: Flashcard[];
  onFinish?: () => void;
}

export function FlashcardQuizEngine({ queue, allCards }: FlashcardQuizEngineProps) {
  const { speak } = useSpeech();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Generate quiz questions on queue changes
  useEffect(() => {
    if (!queue || queue.length === 0) return;

    const pool = queue.length >= 4 ? queue : allCards.length >= 4 ? allCards : queue;
    const generatedQuestions: QuizQuestion[] = queue.map((card) => {
      // Correct answer is card.back_text
      const correctAnswer = card.back_text;

      // Pick 3 unique distractors from pool
      const distractors = pool
        .filter((c) => c.id !== card.id && c.back_text !== correctAnswer)
        .map((c) => c.back_text);

      // Shuffle distractors
      const shuffledDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);

      // If pool doesn't have 3 distractors, fallback distractors
      while (shuffledDistractors.length < 3) {
        shuffledDistractors.push(`Lựa chọn ${shuffledDistractors.length + 1}`);
      }

      // Combine & shuffle options
      const options = [...shuffledDistractors, correctAnswer].sort(() => 0.5 - Math.random());

      // Prepare English hint for Korean (ko) & Chinese (zh) cards
      let englishHint = "";
      if (card.language === "ko" || card.language === "zh") {
        englishHint =
          card.front_subtext ||
          card.back_explanation ||
          card.tags?.find((t) => /^[a-zA-Z\s]+$/.test(t)) ||
          "";
      }

      return {
        card,
        options,
        correctAnswer,
        englishHint,
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setQuizCompleted(false);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [queue, allCards]);

  if (queue.length === 0 || questions.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-12 text-center bg-surface/40">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
          <HelpCircle className="size-8" />
        </div>
        <h3 className="font-display text-xl font-bold text-foreground">
          Chưa Có Thẻ Để Tạo Quiz
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Hãy tạo thêm thẻ hoặc chọn một bộ sưu tập để bắt đầu bài trắc nghiệm Quiz thông minh!
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentCard = currentQ.card;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setQuizCompleted(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  // Quiz Completion Screen
  if (quizCompleted) {
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-3xl border border-emerald-500/30 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl space-y-6"
      >
        <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-transparent text-amber-500 mx-auto border border-amber-500/30 shadow-md">
          <Trophy className="size-10" />
        </div>

        <div className="space-y-1">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            Hoàn Thành Bài Quiz!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Bạn vừa hoàn thành xuất sắc chuỗi câu hỏi trắc nghiệm từ vựng!
          </p>
        </div>

        {/* Score Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-background p-3.5 text-center">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Điểm Số</span>
            <p className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {score} / {questions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-3.5 text-center">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Chính Xác</span>
            <p className="font-display text-xl font-bold text-teal-600 dark:text-teal-400">
              {accuracy}%
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-3.5 text-center">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Streak Cao Nhất</span>
            <p className="font-display text-xl font-bold text-amber-500 flex items-center justify-center gap-1">
              <Flame className="size-4 fill-amber-500" /> {bestStreak}
            </p>
          </div>
        </div>

        <Button
          onClick={handleRestart}
          size="lg"
          className="w-full gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-medium text-white shadow-lg"
        >
          <RotateCcw className="size-4" /> Làm Lại Bài Quiz
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header Info Bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
        </span>

        {streak > 1 && (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 animate-bounce">
            <Flame className="size-3.5 fill-amber-500" /> Streak {streak}🔥
          </span>
        )}

        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
          Đúng: {score}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%` }}
        />
      </div>

      {/* Question Card Box */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6"
      >
        {/* Language Badge & Audio */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            {currentCard.language === "en"
              ? "🇬🇧 Tiếng Anh"
              : currentCard.language === "ko"
              ? "🇰🇷 Tiếng Hàn"
              : "🇨🇳 Tiếng Trung"}
          </span>

          <button
            onClick={() => speak(currentCard.front_text, currentCard.language, currentCard.audio_url)}
            className="flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-emerald-600 transition-colors shadow-2xs"
            title="Phát âm"
          >
            <Volume2 className="size-4 text-emerald-500" />
            <span>Nghe Phát Âm</span>
          </button>
        </div>

        {/* Main Question Text */}
        <div className="text-center py-3 space-y-2">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {currentCard.front_text}
          </h2>

          {/* Special Feature Requirement: Korean & Chinese English Hint Badge */}
          {(currentCard.language === "ko" || currentCard.language === "zh") && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xs mt-2">
              <Globe className="size-3.5 text-emerald-500" />
              <span>Gợi Ý Tiếng Anh:</span>
              <span className="font-mono italic text-foreground">
                {currentQ.englishHint || currentCard.front_subtext || "English meaning"}
              </span>
            </div>
          )}
        </div>

        {/* 4 Choices Grid */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let buttonStyle =
              "border-border/80 bg-background hover:border-emerald-500/50 hover:bg-emerald-500/5 text-foreground";

            if (isAnswered) {
              if (isCorrect) {
                buttonStyle =
                  "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shadow-md";
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
                onClick={() => handleSelectOption(option)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-200 shadow-2xs active:scale-98",
                  buttonStyle
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold font-mono">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && isCorrect && <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="size-5 text-rose-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Next Question Control */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between rounded-2xl border border-border/80 bg-surface/90 p-4 shadow-md backdrop-blur-md"
          >
            <div className="text-xs font-medium">
              {selectedOption === currentQ.correctAnswer ? (
                <span className="text-emerald-500 font-bold flex items-center gap-1 text-sm">
                  <CheckCircle2 className="size-4" /> Chính xác! Rất tuyệt vời!
                </span>
              ) : (
                <span className="text-rose-500 font-bold flex items-center gap-1 text-xs">
                  <XCircle className="size-4" /> Đáp án đúng là: <strong>{currentQ.correctAnswer}</strong>
                </span>
              )}
            </div>

            <Button
              onClick={handleNext}
              className="gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-medium text-white shadow-sm hover:opacity-95"
            >
              <span>{isLastQuestion ? "Xem Kết Quả" : "Câu Tiếp Theo"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

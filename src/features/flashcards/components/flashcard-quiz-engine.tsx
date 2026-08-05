"use client";

import { useState, useEffect, useMemo } from "react";
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
  Filter,
  FilterX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
}

export function FlashcardQuizEngine({ queue, allCards }: FlashcardQuizEngineProps) {
  const { speak } = useSpeech();

  // Custom Game Filters
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Available topics for filter
  const availableTopics = useMemo(() => {
    const tags = allCards.flatMap((c) => c.tags || []);
    return Array.from(new Set(tags)).filter(Boolean);
  }, [allCards]);

  // Dedicated data pool for Quiz
  const quizPool = useMemo(() => {
    const base = queue.length > 0 ? queue : allCards;
    return base.filter((c) => {
      if (selectedLang !== "all" && c.language !== selectedLang) return false;
      if (selectedTopic !== "all" && !c.tags?.includes(selectedTopic)) return false;
      if (onlyFavorites && !c.is_favorite) return false;
      return true;
    });
  }, [queue, allCards, selectedLang, selectedTopic, onlyFavorites]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Generate quiz questions on pool changes
  useEffect(() => {
    if (!quizPool || quizPool.length === 0) {
      setQuestions([]);
      return;
    }

    const distractPool = allCards.length >= 4 ? allCards : quizPool;
    const generatedQuestions: QuizQuestion[] = quizPool.map((card) => {
      const correctAnswer = card.back_text;
      const distractors = distractPool
        .filter((c) => c.id !== card.id && c.back_text !== correctAnswer)
        .map((c) => c.back_text);

      const shuffledDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
      while (shuffledDistractors.length < 3) {
        shuffledDistractors.push(`Lựa chọn ${shuffledDistractors.length + 1}`);
      }

      const options = [...shuffledDistractors, correctAnswer].sort(() => 0.5 - Math.random());

      let englishHint = "";
      if (card.language === "ko" || card.language === "zh") {
        englishHint =
          card.front_subtext ||
          card.back_explanation ||
          card.tags?.find((t) => /^[a-zA-Z\s]+$/.test(t)) ||
          "";
      }

      return { card, options, correctAnswer, englishHint };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setQuizCompleted(false);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [quizPool, allCards]);

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        {/* Game Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Filter className="size-4 text-emerald-500" /> Nguồn dữ liệu Quiz riêng:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 font-medium"
            >
              <option value="all">Tất cả tiếng</option>
              <option value="en">🇬🇧 Tiếng Anh</option>
              <option value="ko">🇰🇷 Tiếng Hàn</option>
              <option value="zh">🇨🇳 Tiếng Trung</option>
            </select>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 font-medium"
            >
              <option value="all">Tất cả chủ đề</option>
              {availableTopics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <Button
              variant={onlyFavorites ? "default" : "outline"}
              size="sm"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className="h-8 text-xs gap-1"
            >
              ⭐ Yêu Thích
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-10 text-center bg-surface/40">
          <HelpCircle className="size-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-display text-base font-bold text-foreground">Không Tìm Thấy Thẻ Cho Bộ Lọc Này</h3>
          <p className="mt-1 text-xs text-muted-foreground">Hãy thay đổi bộ lọc hoặc chọn tất cả chủ đề để bắt đầu Quiz.</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
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

  // Completion Screen
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
        <h2 className="font-display text-2xl font-extrabold text-foreground">Hoàn Thành Bài Quiz!</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-background p-3 text-center">
            <span className="text-[10px] text-muted-foreground uppercase">Điểm</span>
            <p className="font-display text-lg font-bold text-emerald-600">{score} / {questions.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-3 text-center">
            <span className="text-[10px] text-muted-foreground uppercase">Chính Xác</span>
            <p className="font-display text-lg font-bold text-teal-600">{accuracy}%</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-3 text-center">
            <span className="text-[10px] text-muted-foreground uppercase">Streak</span>
            <p className="font-display text-lg font-bold text-amber-500 flex items-center justify-center gap-1">
              <Flame className="size-3.5 fill-amber-500" /> {bestStreak}
            </p>
          </div>
        </div>
        <Button onClick={handleRestart} className="w-full gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-6">
          <RotateCcw className="size-4" /> Làm Lại Bài Quiz
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Game Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Filter className="size-4 text-emerald-500" /> Nguồn Quiz ({questions.length} thẻ):
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 font-medium"
          >
            <option value="all">Tất cả tiếng</option>
            <option value="en">🇬🇧 Anh</option>
            <option value="ko">🇰🇷 Hàn</option>
            <option value="zh">🇨🇳 Trung</option>
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 font-medium max-w-[130px] truncate"
          >
            <option value="all">Tất cả chủ đề</option>
            {availableTopics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <Button
            variant={onlyFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className="h-8 text-xs gap-1"
          >
            ⭐ Yêu Thích
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
        </span>
        {streak > 1 && (
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Flame className="size-3.5 fill-amber-500" /> Streak {streak}🔥
          </span>
        )}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%` }}
        />
      </div>

      {/* Question Card Box */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            {currentCard.language === "en" ? "🇬🇧 Tiếng Anh" : currentCard.language === "ko" ? "🇰🇷 Tiếng Hàn" : "🇨🇳 Tiếng Trung"}
          </span>

          <button
            onClick={() => speak(currentCard.front_text, currentCard.language, currentCard.audio_url)}
            className="flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-emerald-600"
          >
            <Volume2 className="size-4 text-emerald-500" /> Nghe Phát Âm
          </button>
        </div>

        <div className="text-center py-3 space-y-2">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
            {currentCard.front_text}
          </h2>

          {(currentCard.language === "ko" || currentCard.language === "zh") && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              <Globe className="size-3.5 text-emerald-500" /> Gợi Ý Tiếng Anh: <span className="font-mono italic text-foreground">{currentQ.englishHint || currentCard.front_subtext || "English meaning"}</span>
            </div>
          )}
        </div>

        {/* 4 Choices */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let buttonStyle = "border-border bg-background hover:border-emerald-500/50 text-foreground";
            if (isAnswered) {
              if (isCorrect) {
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
                onClick={() => handleSelectOption(option)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition-all shadow-2xs active:scale-98",
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

        {isAnswered && (
          <Button
            onClick={handleNext}
            className="w-full py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md"
          >
            <span>{isLastQuestion ? "Xem Kết Quả" : "Câu Tiếp Theo"}</span>
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  Filter,
  Wand2,
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
  questionType: "foreign_to_vn" | "vn_to_foreign"; // bidirectional
  questionText: string; // what's shown as the question
  questionLang: string; // language of questionText
}

interface FlashcardQuizEngineProps {
  queue: Flashcard[];
  allCards: Flashcard[]; // ALL cards in system for distractor pool
  aiItems?: any[];
  onOpenAutoGenForGame?: () => void;
}

export function FlashcardQuizEngine({
  queue,
  allCards,
  aiItems,
  onOpenAutoGenForGame,
}: FlashcardQuizEngineProps) {
  const { speak, stop } = useSpeech();

  // Game Filters
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  const availableTopics = useMemo(() => {
    const tags = queue.flatMap((c) => c.tags || []);
    return Array.from(new Set(tags)).filter(Boolean);
  }, [queue]);

  const quizPool = useMemo(() => {
    return queue.filter((c) => {
      if (selectedLang !== "all" && c.language !== selectedLang) return false;
      if (selectedTopic !== "all" && !c.tags?.includes(selectedTopic)) return false;
      return true;
    });
  }, [queue, selectedLang, selectedTopic]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Use ALL cards from system as distractor pool for harder questions
  const distractorPool = useMemo(() => {
    // Use allCards (ALL cards in the system), fallback to quizPool only if necessary
    return allCards.length >= 6 ? allCards : quizPool;
  }, [allCards, quizPool]);

  useEffect(() => {
    if (!quizPool || quizPool.length === 0) {
      setQuestions([]);
      return;
    }

    // Shuffle the quiz pool so question direction varies
    const shuffledPool = [...quizPool].sort(() => 0.5 - Math.random());

    const generatedQuestions: QuizQuestion[] = shuffledPool.map((card, i) => {
      // Alternate question directions: 50% chance of VN→Foreign, 50% Foreign→VN
      const useVnToForeign = Math.random() > 0.5;

      let questionText: string;
      let correctAnswer: string;
      let questionType: "foreign_to_vn" | "vn_to_foreign";
      let questionLang: string;

      if (useVnToForeign) {
        // Show Vietnamese meaning, user picks the foreign word
        questionText = card.back_text;
        correctAnswer = card.front_text;
        questionType = "vn_to_foreign";
        questionLang = "vi";
      } else {
        // Show foreign word, user picks the Vietnamese meaning
        questionText = card.front_text;
        correctAnswer = card.back_text;
        questionType = "foreign_to_vn";
        questionLang = card.language;
      }

      // Build distractors from ALL cards in system (not just quiz deck)
      const distractors = distractorPool
        .filter((c) => c.id !== card.id)
        .map((c) => (questionType === "vn_to_foreign" ? c.front_text : c.back_text))
        .filter((d) => d && d !== correctAnswer && d.trim().length > 0);

      // Deduplicate
      const uniqueDistractors = Array.from(new Set(distractors));
      const shuffledDistractors = uniqueDistractors.sort(() => 0.5 - Math.random()).slice(0, 3);

      // Pad if not enough
      while (shuffledDistractors.length < 3) {
        shuffledDistractors.push(`Đáp án ${shuffledDistractors.length + 1}`);
      }

      const options = [...shuffledDistractors, correctAnswer].sort(() => 0.5 - Math.random());

      return { card, options, correctAnswer, questionType, questionText, questionLang };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setQuizCompleted(false);
    setSelectedOption(null);
    setIsAnswered(false);
  }, [quizPool, distractorPool]);

  // Stop audio when unmounting
  useEffect(() => {
    return () => stop();
  }, [stop]);

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3.5 text-xs shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Filter className="size-4 text-emerald-500" /> Bộ lọc Quiz:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 font-medium">
              <option value="all">Tất cả tiếng</option>
              <option value="en">🇬🇧 Tiếng Anh</option>
              <option value="ko">🇰🇷 Tiếng Hàn</option>
              <option value="zh">🇨🇳 Tiếng Trung</option>
            </select>
            {onOpenAutoGenForGame && (
              <Button size="sm" onClick={onOpenAutoGenForGame}
                className="h-8 text-xs gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-md active:scale-95">
                <Wand2 className="size-3.5" /> 🤖 AI Tạo Tự Động
              </Button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-emerald-500/30 bg-surface/80 p-8 text-center shadow-xl backdrop-blur-md space-y-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto border border-emerald-500/30 shadow-md">
            <HelpCircle className="size-8 animate-pulse" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">Chưa Có Thẻ Cho Trò Quiz</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Bấm "🤖 AI Tạo Tự Động" để AI tạo ngay bộ thẻ Quiz riêng biệt. Câu hỏi sẽ đa dạng theo cả hai chiều: ngoại ngữ→tiếng Việt và tiếng Việt→ngoại ngữ!
          </p>
          {onOpenAutoGenForGame && (
            <Button onClick={onOpenAutoGenForGame}
              className="py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-bold text-xs gap-2 shadow-lg hover:opacity-95 active:scale-95">
              <Wand2 className="size-4" /> 🤖 AI Tạo Tự Động Quiz
            </Button>
          )}
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

  if (quizCompleted) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-3xl border border-emerald-500/30 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
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
        <Button onClick={handleRestart} className="w-full gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-bold shadow-lg">
          <RotateCcw className="size-4" /> Làm Lại Bài Quiz
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Filter Bar - Single AI button only */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3 text-xs shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Filter className="size-4 text-emerald-500" /> Quiz ({questions.length} thẻ):
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 font-medium">
            <option value="all">Tất cả tiếng</option>
            <option value="en">🇬🇧 Anh</option>
            <option value="ko">🇰🇷 Hàn</option>
            <option value="zh">🇨🇳 Trung</option>
          </select>
          {onOpenAutoGenForGame && (
            <Button size="sm" onClick={onOpenAutoGenForGame}
              className="h-8 text-xs gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-md active:scale-95">
              <Wand2 className="size-3.5" /> 🤖 AI Tạo Tự Động
            </Button>
          )}
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
        {/* Direction badge */}
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
        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%` }} />
      </div>

      {/* Question Card Box */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide border border-emerald-500/20">
            {currentQ.questionType === "vn_to_foreign"
              ? "🇻🇳 Tiếng Việt → " + (currentCard.language === "en" ? "🇬🇧 Anh" : currentCard.language === "ko" ? "🇰🇷 Hàn" : "🇨🇳 Trung")
              : currentCard.language === "en" ? "🇬🇧 Tiếng Anh" : currentCard.language === "ko" ? "🇰🇷 Tiếng Hàn" : "🇨🇳 Tiếng Trung"}
          </span>
          {currentQ.questionType === "foreign_to_vn" && (
            <button
              onClick={() => speak(currentCard.front_text, currentCard.language, currentCard.audio_url)}
              className="flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-emerald-600 active:scale-90">
              <Volume2 className="size-4 text-emerald-500" /> Nghe Phát Âm
            </button>
          )}
        </div>

        <div className="text-center py-3 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {currentQ.questionType === "vn_to_foreign" ? "Từ tiếng Việt: Chọn từ ngoại ngữ đúng" : "Từ ngoại ngữ: Chọn nghĩa tiếng Việt đúng"}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
            {currentQ.questionText}
          </h2>
        </div>

        {/* 4 Choices */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let buttonStyle = "border-border bg-background hover:border-emerald-500/50 text-foreground";
            if (isAnswered) {
              if (isCorrect) buttonStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-600 font-bold shadow-md";
              else if (isSelected) buttonStyle = "border-rose-500 bg-rose-500/20 text-rose-500 font-bold shadow-md";
              else buttonStyle = "border-border/40 bg-background/50 text-muted-foreground opacity-50";
            }

            return (
              <button key={idx} disabled={isAnswered} onClick={() => handleSelectOption(option)}
                className={cn("flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition-all shadow-2xs active:scale-98", buttonStyle)}>
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
          <Button onClick={handleNext}
            className="w-full py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg active:scale-98">
            <span>{isLastQuestion ? "Xem Kết Quả" : "Câu Tiếp Theo"}</span>
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

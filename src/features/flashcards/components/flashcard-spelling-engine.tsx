"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  Flame,
  KeyRound,
  HelpCircle,
  Filter,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flashcard } from "../types";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";

interface FlashcardSpellingEngineProps {
  queue: Flashcard[];
  allCards?: Flashcard[]; // All vocab in system for harder hints
  aiItems?: any[];
  onOpenAutoGenForGame?: () => void;
}

export function FlashcardSpellingEngine({
  queue,
  allCards,
  aiItems,
  onOpenAutoGenForGame,
}: FlashcardSpellingEngineProps) {
  const { speak, stop } = useSpeech();

  const [selectedLang, setSelectedLang] = useState<string>("all");

  const spellingPool = useMemo(() => {
    return queue.filter((c) => {
      if (selectedLang !== "all" && c.language !== selectedLang) return false;
      return true;
    });
  }, [queue, selectedLang]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0=none, 1=length+type, 2=first char only
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentCard = spellingPool[currentIndex];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  useEffect(() => {
    setUserInput("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setHintLevel(0);
    if (inputRef.current) inputRef.current.focus();
  }, [currentIndex, spellingPool]);

  if (spellingPool.length === 0 || !currentCard) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3 text-xs shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Filter className="size-4 text-emerald-500" /> Nguồn Luyện Viết:
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

        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-emerald-500/30 bg-surface/80 p-8 text-center shadow-xl backdrop-blur-md space-y-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto border border-emerald-500/30 shadow-md">
            <KeyRound className="size-8 animate-pulse" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">Chưa Có Thẻ Để Ôn Viết</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Bấm "🤖 AI Tạo Tự Động" để AI trích xuất thẻ luyện viết chính tả riêng biệt cho bạn!
          </p>
          {onOpenAutoGenForGame && (
            <Button onClick={onOpenAutoGenForGame}
              className="py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-bold text-xs gap-2 shadow-lg hover:opacity-95 active:scale-95">
              <Wand2 className="size-4" /> 🤖 AI Tạo Tự Động Luyện Viết
            </Button>
          )}
        </div>
      </div>
    );
  }

  const cleanAnswer = currentCard.front_text.trim().toLowerCase();

  // Smart hint – reveals progressively harder, never the full word
  const getHintText = () => {
    const word = currentCard.front_text;
    const len = word.length;
    const lang = currentCard.language;
    const langLabel = lang === "en" ? "Tiếng Anh" : lang === "ko" ? "Tiếng Hàn" : "Tiếng Trung";

    if (hintLevel === 0) {
      return `Từ ${langLabel} · ${len} ký tự`;
    }
    if (hintLevel === 1) {
      // Show first letter + underscores (e.g. "h _ _ _ _")
      const firstChar = word[0];
      const blanks = Array(len - 1).fill("_").join(" ");
      return `${firstChar} ${blanks}`;
    }
    if (hintLevel >= 2) {
      // Show first + last letter (e.g. "h _ _ _ d")
      if (len <= 2) return word[0] + "…";
      const firstChar = word[0];
      const lastChar = word[word.length - 1];
      const middle = Array(len - 2).fill("_").join(" ");
      return `${firstChar} ${middle} ${lastChar}`;
    }
    return "";
  };

  const handleShowHint = () => {
    setShowHint(true);
    setHintLevel((l) => Math.min(l + 1, 2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered) {
      handleNext();
      return;
    }
    if (!userInput.trim()) return;
    const userAns = userInput.trim().toLowerCase();
    const correct = userAns === cleanAnswer;
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
    if (currentIndex < spellingPool.length - 1) {
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
    setUserInput("");
    setIsAnswered(false);
  };

  if (completed) {
    const accuracy = Math.round((score / spellingPool.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-3xl border border-emerald-500/30 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 mx-auto border border-emerald-500/30">
          <Trophy className="size-10" />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">Hoàn Thành Luyện Viết!</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Đúng</span>
            <p className="font-display text-2xl font-bold text-emerald-600">{score} / {spellingPool.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Chính Xác</span>
            <p className="font-display text-2xl font-bold text-teal-600">{accuracy}%</p>
          </div>
        </div>
        <Button onClick={handleRestart} className="w-full gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-6 font-bold shadow-lg">
          <RotateCcw className="size-4" /> Luyện Lại
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Single top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3 text-xs shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Filter className="size-4 text-emerald-500" /> Chính Tả ({spellingPool.length} thẻ):
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
          <span>Thẻ {currentIndex + 1} / {spellingPool.length}</span>
        </span>
        {streak > 1 && (
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Flame className="size-3.5 fill-amber-500" /> Streak {streak}🔥
          </span>
        )}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / spellingPool.length) * 100)}%` }} />
      </div>

      {/* Spelling Card */}
      <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 text-center">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 uppercase border border-emerald-500/20">
            {currentCard.language === "en" ? "🇬🇧 Tiếng Anh" : currentCard.language === "ko" ? "🇰🇷 Tiếng Hàn" : "🇨🇳 Tiếng Trung"}
          </span>
          <button onClick={() => speak(currentCard.front_text, currentCard.language, currentCard.audio_url)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:text-emerald-600 active:scale-90">
            <Volume2 className="size-4 text-emerald-500" /> Nghe từ
          </button>
        </div>

        {/* Question: show meaning, user must type the foreign word */}
        <div className="py-4 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gõ lại từ ngoại ngữ theo nghĩa tiếng Việt:</span>
          <h2 className="font-display text-3xl font-extrabold text-foreground">{currentCard.back_text}</h2>
          {/* Hide back_explanation - would give it away */}
        </div>

        {/* Progressive Hint (not revealing the word upfront) */}
        {showHint && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400 font-mono flex items-center justify-center gap-2">
            <HelpCircle className="size-3.5 shrink-0" />
            <span>{getHintText()}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input ref={inputRef} type="text" value={userInput}
            onChange={(e) => setUserInput(e.target.value)} disabled={isAnswered}
            placeholder="Gõ chính tả từ vựng..."
            className={`w-full rounded-2xl border bg-background px-4 py-3.5 text-center text-lg font-bold outline-none transition-all ${
              isAnswered
                ? isCorrect
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                  : "border-rose-500 bg-rose-500/10 text-rose-600"
                : "border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            }`}
          />

          <div className="flex gap-2">
            {!isAnswered && (
              <Button type="button" variant="outline" onClick={handleShowHint}
                className="gap-1 text-xs active:scale-95">
                <HelpCircle className="size-3.5" />
                {hintLevel === 0 ? "Gợi Ý" : hintLevel === 1 ? "Thêm Gợi Ý" : "Hết Gợi Ý"}
              </Button>
            )}
            <Button type="submit" disabled={!isAnswered && !userInput.trim()}
              className="flex-1 py-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg active:scale-98">
              {isAnswered ? (
                <span className="flex items-center gap-2">Tiếp Theo <ArrowRight className="size-4" /></span>
              ) : "Kiểm Tra Đáp Án"}
            </Button>
          </div>
        </form>

        {isAnswered && (
          <div className="pt-2 text-xs font-bold">
            {isCorrect ? (
              <span className="text-emerald-500 flex items-center justify-center gap-1">
                <CheckCircle2 className="size-4" /> Đúng rồi! Chính tả hoàn hảo.
              </span>
            ) : (
              <span className="text-rose-500 flex items-center justify-center gap-1">
                <XCircle className="size-4" /> Chưa chính xác. Đáp án đúng: <strong className="font-mono text-sm underline ml-1">{currentCard.front_text}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

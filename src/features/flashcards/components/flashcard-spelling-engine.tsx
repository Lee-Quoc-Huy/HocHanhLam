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
  Plus,
  Wand2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flashcard } from "../types";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";

interface FlashcardSpellingEngineProps {
  queue: Flashcard[];
  aiItems?: any[];
  onOpenCreateCardForGame?: () => void;
  onOpenAutoGenForGame?: () => void;
  onDeleteCard?: (id: string) => void;
}

export function FlashcardSpellingEngine({
  queue,
  aiItems,
  onOpenCreateCardForGame,
  onOpenAutoGenForGame,
  onDeleteCard,
}: FlashcardSpellingEngineProps) {
  const { speak } = useSpeech();

  // Custom Game Filters
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const availableTopics = useMemo(() => {
    const tags = queue.flatMap((c) => c.tags || []);
    return Array.from(new Set(tags)).filter(Boolean);
  }, [queue]);

  const spellingPool = useMemo(() => {
    return queue.filter((c) => {
      if (selectedLang !== "all" && c.language !== selectedLang) return false;
      if (selectedTopic !== "all" && !c.tags?.includes(selectedTopic)) return false;
      if (onlyFavorites && !c.is_favorite) return false;
      return true;
    });
  }, [queue, selectedLang, selectedTopic, onlyFavorites]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentCard = spellingPool[currentIndex];

  useEffect(() => {
    setUserInput("");
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, spellingPool]);

  if (spellingPool.length === 0 || !currentCard) {
    return (
      <div className="space-y-4">
        {/* Game Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Filter className="size-4 text-emerald-500" /> Nguồn dữ liệu Luyện Viết riêng:
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
            {onOpenAutoGenForGame && (
              <Button size="sm" onClick={onOpenAutoGenForGame} className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
                <Wand2 className="size-3.5" /> Tạo Tự Động
              </Button>
            )}
            {onOpenCreateCardForGame && (
              <Button size="sm" onClick={onOpenCreateCardForGame} className="h-8 text-xs gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl">
                <Plus className="size-3.5" /> + Thẻ Viết
              </Button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-10 text-center bg-surface/40">
          <KeyRound className="size-8 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-display text-base font-bold text-foreground">Chưa Có Thẻ Để Ôn Viết Với Bộ Lọc Này</h3>
          <p className="mt-1 text-xs text-muted-foreground">Thử chọn tất cả chủ đề để bắt đầu luyện chính tả.</p>
        </div>
      </div>
    );
  }

  const cleanAnswer = currentCard.front_text.trim().toLowerCase();

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-3xl border border-emerald-500/30 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl space-y-6"
      >
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
        <Button onClick={handleRestart} className="w-full gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-6">
          <RotateCcw className="size-4" /> Luyện Lại
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Game Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Filter className="size-4 text-emerald-500" /> Nguồn Luyện Viết ({spellingPool.length} thẻ):
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
          {onOpenAutoGenForGame && (
            <Button size="sm" onClick={onOpenAutoGenForGame} className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
              <Wand2 className="size-3.5" /> Tạo Tự Động
            </Button>
          )}
          {onOpenCreateCardForGame && (
            <Button size="sm" onClick={onOpenCreateCardForGame} className="h-8 text-xs gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl">
              <Plus className="size-3.5" /> + Thẻ Viết
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
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / spellingPool.length) * 100)}%` }}
        />
      </div>

      {/* Main Spelling Card */}
      <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6 text-center">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 uppercase">
            {currentCard.language === "en" ? "🇬🇧 Tiếng Anh" : currentCard.language === "ko" ? "🇰🇷 Tiếng Hàn" : "🇨🇳 Tiếng Trung"}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => speak(currentCard.front_text, currentCard.language, currentCard.audio_url)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:text-emerald-600"
            >
              <Volume2 className="size-4 text-emerald-500" /> Nghe từ
            </button>
            {onDeleteCard && (
              <button
                onClick={() => onDeleteCard(currentCard.id)}
                className="rounded-full bg-background border border-border p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Xóa thẻ này khỏi Supabase"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Meaning Prompt */}
        <div className="py-4 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Viết lại từ theo nghĩa bên dưới:</span>
          <h2 className="font-display text-3xl font-extrabold text-foreground">{currentCard.back_text}</h2>
          {currentCard.back_explanation && (
            <p className="text-xs text-muted-foreground">{currentCard.back_explanation}</p>
          )}
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-600 font-mono">
            Gợi ý: Bắt đầu bằng <strong>"{currentCard.front_text.slice(0, 2)}"</strong> ({currentCard.front_text.length} ký tự)
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isAnswered}
              placeholder="Gõ chính tả từ vựng..."
              className={`w-full rounded-2xl border bg-background px-4 py-3.5 text-center text-lg font-bold outline-none transition-all ${
                isAnswered
                  ? isCorrect
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-rose-500 bg-rose-500/10 text-rose-600"
                  : "border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              }`}
            />
          </div>

          <div className="flex gap-2">
            {!isAnswered && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowHint(true)}
                className="gap-1 text-xs"
              >
                <HelpCircle className="size-3.5" /> Gợi Ý
              </Button>
            )}

            <Button
              type="submit"
              disabled={!isAnswered && !userInput.trim()}
              className="flex-1 py-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold"
            >
              {isAnswered ? (
                <span className="flex items-center gap-2">Tiếp Theo <ArrowRight className="size-4" /></span>
              ) : (
                "Kiểm Tra Đáp Án"
              )}
            </Button>
          </div>
        </form>

        {/* Feedback Msg */}
        {isAnswered && (
          <div className="pt-2 text-xs font-bold">
            {isCorrect ? (
              <span className="text-emerald-500 flex items-center justify-center gap-1">
                <CheckCircle2 className="size-4" /> Đúng rồi! Chính tả hoàn hảo.
              </span>
            ) : (
              <span className="text-rose-500 flex items-center justify-center gap-1">
                <XCircle className="size-4" /> Chưa chính xác. Đáp án đúng: <strong className="font-mono text-sm underline">{currentCard.front_text}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Volume2,
  Star,
  RotateCw,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Flashcard } from "../types";
import { getSRSPreview, SRSRating } from "../lib/srs-algorithm";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";

interface FlashcardReviewEngineProps {
  queue: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (rating: SRSRating) => Promise<void>;
  onToggleFavorite: (id: string) => void;
  onPrevCard?: () => void;
  onNextCard?: () => void;
  onOpenAutoGenForGame?: () => void;
}

export function FlashcardReviewEngine({
  queue,
  currentIndex,
  isFlipped,
  onFlip,
  onRate,
  onToggleFavorite,
  onPrevCard,
  onNextCard,
  onOpenAutoGenForGame,
}: FlashcardReviewEngineProps) {
  const { speak } = useSpeech();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Framer motion drag gesture values for mobile swipe
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const swipeLeftOpacity = useTransform(x, [-150, -20], [1, 0]);
  const swipeRightOpacity = useTransform(x, [20, 150], [0, 1]);

  const currentCard = queue[currentIndex];

  // Bind desktop keyboard shortcuts safely
  useKeyboardShortcuts({
    enabled: !!currentCard && !isSubmitting,
    isFlipped,
    onFlip,
    onRate: async (rating) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      await onRate(rating);
      setIsSubmitting(false);
    },
  });

  if (queue.length === 0 || !currentCard) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl border border-dashed border-emerald-500/30 bg-surface/80 p-8 sm:p-10 text-center shadow-xl backdrop-blur-md space-y-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-500 mx-auto border border-emerald-500/30 shadow-md">
            <Layers className="size-8 animate-pulse" />
          </div>
          <h3 className="font-display text-xl font-extrabold text-foreground">
            Chưa Có Thẻ Trò Lật Thẻ SRS
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Bấm "🤖 AI Tạo Tự Động" bên dưới để AI tự động trích xuất bộ thẻ riêng biệt cho trò lật thẻ này!
          </p>

          {onOpenAutoGenForGame && (
            <Button
              onClick={onOpenAutoGenForGame}
              className="py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-bold text-xs gap-2 shadow-lg hover:opacity-95 active:scale-95"
            >
              <Wand2 className="size-4" /> 🤖 AI Tạo Tự Động Cho Lật Thẻ
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Pre-calculate SM-2 rating interval previews
  const previews = getSRSPreview(
    currentCard.repetition,
    currentCard.interval,
    currentCard.ease_factor
  );

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -120) {
      handleRatingClick("again");
    } else if (info.offset.x > 120) {
      handleRatingClick("good");
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onFlip();
  };

  const handleRatingClick = async (rating: SRSRating) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRate(rating);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <div className="mx-auto max-w-xl space-y-4 sm:space-y-6">
      {/* Action Bar: AI Auto Generate & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3 text-xs shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          {onPrevCard && (
            <Button
              variant="outline"
              size="icon"
              onClick={onPrevCard}
              className="size-7 rounded-lg active:scale-90"
              title="Thẻ trước đó"
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Thẻ {currentIndex + 1} / {queue.length}</span>
          </span>
          {onNextCard && (
            <Button
              variant="outline"
              size="icon"
              onClick={onNextCard}
              className="size-7 rounded-lg active:scale-90"
              title="Thẻ tiếp theo"
            >
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>

        {onOpenAutoGenForGame && (
          <Button
            size="sm"
            onClick={onOpenAutoGenForGame}
            className="h-8 text-xs gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md active:scale-95"
          >
            <Wand2 className="size-3.5" /> 🤖 AI Tạo Tự Động
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* 3D Motion Card Container */}
      <motion.div
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
        className="group relative min-h-[360px] sm:min-h-[380px] w-full cursor-pointer rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 flex flex-col justify-between overflow-hidden"
      >
        {/* Visual Swipe Indicators */}
        <motion.div
          style={{ opacity: swipeLeftOpacity }}
          className="pointer-events-none absolute left-4 top-4 z-20 rounded-xl bg-rose-500/90 px-3 py-1.5 text-xs font-bold text-white shadow-md flex items-center gap-1"
        >
          <ArrowLeft className="size-4" /> ÔN LẠI (Vuốt Trái)
        </motion.div>

        <motion.div
          style={{ opacity: swipeRightOpacity }}
          className="pointer-events-none absolute right-4 top-4 z-20 rounded-xl bg-emerald-500/90 px-3 py-1.5 text-xs font-bold text-white shadow-md flex items-center gap-1"
        >
          TỐT (Vuốt Phải) <ArrowRight className="size-4" />
        </motion.div>

        {/* Card Header */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide border border-emerald-500/20">
            {currentCard.language === "en"
              ? "🇬🇧 Tiếng Anh"
              : currentCard.language === "ko"
              ? "🇰🇷 Tiếng Hàn"
              : "🇨🇳 Tiếng Trung"}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => speak(currentCard.front_text, currentCard.language, currentCard.audio_url)}
              className="rounded-xl bg-background border border-border p-2 text-muted-foreground hover:text-emerald-600 transition-colors active:scale-90"
              title="Phát âm"
            >
              <Volume2 className="size-4" />
            </button>

            <button
              onClick={() => onToggleFavorite(currentCard.id)}
              className="rounded-xl bg-background border border-border p-2 text-muted-foreground hover:text-amber-500 transition-colors active:scale-90"
              title="Yêu thích"
            >
              <Star
                className={`size-4 ${
                  currentCard.is_favorite ? "fill-amber-400 text-amber-400" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card Body: Front or Back */}
        <div className="my-auto text-center py-6">
          {!isFlipped ? (
            /* FRONT */
            <div className="space-y-3 animate-in fade-in">
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                {currentCard.front_text}
              </h2>
              {currentCard.front_subtext && (
                <p className="font-mono text-base sm:text-lg text-emerald-600 dark:text-emerald-400 font-medium">
                  [{currentCard.front_subtext}]
                </p>
              )}
              <p className="text-xs text-muted-foreground pt-3 flex items-center justify-center gap-1">
                <RotateCw className="size-3" /> Nhấp vào đây hoặc bấm Space để lật đáp án
              </p>
            </div>
          ) : (
            /* BACK */
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {currentCard.back_text}
                </h3>
                {currentCard.back_explanation && (
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed font-mono">
                    {currentCard.back_explanation}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer tags */}
        <div className="flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
          <div className="flex flex-wrap gap-1">
            {currentCard.tags?.map((t) => (
              <span key={t} className="rounded bg-muted px-1.5 py-0.5 font-medium text-[10px]">
                #{t}
              </span>
            ))}
          </div>
          <span className="font-mono text-[10px]">EF: {currentCard.ease_factor}</span>
        </div>
      </motion.div>

      {/* SRS Rating Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in fade-in">
          {/* Again */}
          <Button
            onClick={() => handleRatingClick("again")}
            disabled={isSubmitting}
            className="flex flex-col items-center py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-md active:scale-95"
          >
            <span className="font-bold text-xs sm:text-sm">Ôn Lại (1)</span>
            <span className="text-[10px] opacity-90 font-mono mt-0.5">{previews.again.formattedInterval}</span>
          </Button>

          {/* Hard */}
          <Button
            onClick={() => handleRatingClick("hard")}
            disabled={isSubmitting}
            className="flex flex-col items-center py-5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-md active:scale-95"
          >
            <span className="font-bold text-xs sm:text-sm">Khó (2)</span>
            <span className="text-[10px] opacity-90 font-mono mt-0.5">{previews.hard.formattedInterval}</span>
          </Button>

          {/* Good */}
          <Button
            onClick={() => handleRatingClick("good")}
            disabled={isSubmitting}
            className="flex flex-col items-center py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md active:scale-95"
          >
            <span className="font-bold text-xs sm:text-sm">Tốt (3)</span>
            <span className="text-[10px] opacity-90 font-mono mt-0.5">{previews.good.formattedInterval}</span>
          </Button>

          {/* Easy */}
          <Button
            onClick={() => handleRatingClick("easy")}
            disabled={isSubmitting}
            className="flex flex-col items-center py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md active:scale-95"
          >
            <span className="font-bold text-xs sm:text-sm">Dễ (4)</span>
            <span className="text-[10px] opacity-90 font-mono mt-0.5">{previews.easy.formattedInterval}</span>
          </Button>
        </div>
      ) : (
        <Button
          onClick={onFlip}
          size="lg"
          className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-lg active:scale-98"
        >
          Lật Mặt Đáp Án (Hoặc Nhấp Vào Thẻ)
        </Button>
      )}
    </div>
  );
}

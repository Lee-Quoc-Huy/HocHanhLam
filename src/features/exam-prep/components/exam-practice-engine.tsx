"use client";

import { useState, useEffect, useRef } from "react";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
  Headphones,
  Eye,
  EyeOff,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ExamPaper, ExamResult } from "../types";
import { calculateExamResult, saveExamResult } from "../lib/exam-service";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";
import { cn } from "@/lib/utils/cn";

interface ExamPracticeEngineProps {
  paper: ExamPaper;
  isMockMode?: boolean;
  onRestart: () => void;
}

export function ExamPracticeEngine({ paper, isMockMode = false, onRestart }: ExamPracticeEngineProps) {
  const { speak, stop } = useSpeech();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  // Toggle state for Passage & Audio Script (hidden upfront by default to simulate real exam)
  const [showPassage, setShowPassage] = useState(false);
  const [showAudioScript, setShowAudioScript] = useState(false);

  // Reset toggles when moving to next/prev question
  useEffect(() => {
    setShowPassage(false);
    setShowAudioScript(false);
  }, [currentIdx]);

  // Timer state for Mock Test mode
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(paper.durationMinutes * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio playing state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    return () => {
      stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stop]);

  // Countdown timer for Mock Mode
  useEffect(() => {
    if (!isMockMode || isSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isMockMode, isSubmitted]);

  const currentQ = paper.questions[currentIdx];
  if (!currentQ) return null;

  const handleSelectAnswer = (optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.number]: optionIdx,
    }));
  };

  const handleSubmitExam = () => {
    if (isSubmitted) return;
    stop();
    const timeSpent = paper.durationMinutes * 60 - timeLeftSeconds;
    const res = calculateExamResult(paper, userAnswers, Math.max(10, timeSpent));
    setResult(res);
    saveExamResult(res);
    setIsSubmitted(true);
  };

  const playQuestionAudio = () => {
    const textToSpeak = currentQ.audioScript || currentQ.questionText;
    setIsPlayingAudio(true);
    speak(textToSpeak, paper.language, currentQ.audioUrl);
    setTimeout(() => setIsPlayingAudio(false), 4000);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Submission Result Screen
  if (isSubmitted && result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-2xl rounded-3xl border border-indigo-500/30 bg-surface/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6"
      >
        <div className="text-center space-y-3">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent text-indigo-600 mx-auto border border-indigo-500/30 shadow-md">
            <Award className="size-10 text-indigo-500" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-foreground">Kết Quả Đề Thi {paper.title}</h2>
          <p className="text-xs text-muted-foreground">Phân tích & chấm điểm tự động bằng AI</p>
        </div>

        {/* Score Overview Cards */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Tổng Điểm</span>
            <p className="font-display text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {result.score} / {result.maxScore}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Tỷ Lệ Đạt</span>
            <p className={`font-display text-2xl font-extrabold ${result.passed ? "text-emerald-600" : "text-rose-600"}`}>
              {result.percentage}%
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Kết Quả</span>
            <p className={`font-display text-lg font-bold mt-1 ${result.passed ? "text-emerald-600" : "text-rose-500"}`}>
              {result.passed ? "🎉 ĐẠT (PASS)" : "⚠️ CHƯA ĐẠT"}
            </p>
          </div>
        </div>

        {/* AI Evaluation */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400 text-sm">
            <Sparkles className="size-4" /> Đánh Giá Từ AI Examiner:
          </div>

          {result.aiEvaluation.strengths.length > 0 && (
            <div>
              <span className="font-bold text-emerald-600">✓ Điểm mạnh:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                {result.aiEvaluation.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {result.aiEvaluation.weaknesses.length > 0 && (
            <div>
              <span className="font-bold text-amber-600">⚠️ Cần cải thiện:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                {result.aiEvaluation.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="italic text-foreground border-t border-indigo-500/20 pt-2 mt-2">
            💡 Lời khuyên: {result.aiEvaluation.recommendations}
          </p>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4 pt-2">
          <h3 className="font-display text-base font-bold text-foreground">Chi Tiết Lời Giải Đề Thi</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 no-scrollbar">
            {paper.questions.map((q) => {
              const userAns = userAnswers[q.number];
              const isRight = userAns === q.correctAnswerIndex;
              return (
                <div key={q.id} className={`p-4 rounded-2xl border text-xs space-y-2 ${isRight ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>Câu {q.number}: {q.questionText}</span>
                    <span className={isRight ? "text-emerald-600" : "text-rose-500"}>
                      {isRight ? "✓ Đúng" : "✕ Sai"}
                    </span>
                  </div>
                  {q.passageText && <p className="text-muted-foreground italic font-mono bg-background p-2 rounded-lg">{q.passageText}</p>}
                  {q.audioScript && <p className="text-purple-600 dark:text-purple-300 italic font-mono bg-purple-500/10 p-2 rounded-lg">🎧 Script: &ldquo;{q.audioScript}&rdquo;</p>}
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`p-1.5 rounded-lg ${i === q.correctAnswerIndex ? "bg-emerald-500/20 font-bold text-emerald-700 dark:text-emerald-300" : i === userAns ? "bg-rose-500/20 text-rose-600" : "text-muted-foreground"}`}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-foreground font-medium pt-1 border-t border-border/50">💡 Lời giải: {q.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>

        <Button onClick={onRestart} className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
          <RotateCcw className="size-4" /> Thử Đề Khác
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Top Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3.5 text-xs shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <BookOpen className="size-4 text-indigo-500" />
          <span>{paper.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {isMockMode && (
            <div className={`flex items-center gap-1 font-mono font-bold text-xs px-3 py-1 rounded-full border ${timeLeftSeconds <= 300 ? "bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse" : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"}`}>
              <Clock className="size-3.5" /> {formatTimer(timeLeftSeconds)}
            </div>
          )}

          <Button onClick={handleSubmitExam} size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
            <Check className="size-3.5" /> Nộp Bài Thi
          </Button>
        </div>
      </div>

      {/* Main Question Sheet */}
      <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        {/* Header Badges & Audio Trigger */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 uppercase border border-indigo-500/20 flex items-center gap-1.5">
            {currentQ.section === "listening" ? <Headphones className="size-3.5" /> : <FileText className="size-3.5" />}
            {(currentQ.section || "CÂU HỎI").toUpperCase()} · Câu {currentQ.number} / {paper.questions.length}
          </span>

          {/* Audio Button for Listening Questions */}
          {(currentQ.section === "listening" || currentQ.audioScript) && (
            <Button
              onClick={playQuestionAudio}
              size="sm"
              className={cn(
                "h-8 text-xs gap-1.5 rounded-full font-bold shadow-sm transition-all",
                isPlayingAudio ? "bg-amber-500 text-white animate-pulse" : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
              )}
            >
              <Volume2 className="size-4" />
              <span>{isPlayingAudio ? "Đang phát..." : "Nghe Âm Thanh Audio"}</span>
            </Button>
          )}
        </div>

        {/* Toggle Reading Passage (Hidden upfront to simulate real exam) */}
        {currentQ.passageText && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPassage((prev) => !prev)}
              className="gap-1.5 text-xs font-bold rounded-xl border-dashed border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 active:scale-95"
            >
              {showPassage ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              <span>{showPassage ? "Ẩn Đoạn Văn Bài Đọc ✕" : "📖 Xem Gợi Ý Đoạn Văn Bài Đọc"}</span>
            </Button>

            {showPassage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-indigo-500/30 bg-background/90 p-4 text-xs sm:text-sm font-medium text-foreground leading-relaxed space-y-1 shadow-inner"
              >
                <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  📖 Nội dung bài đọc:
                </span>
                <p className="italic font-mono leading-relaxed pt-1 text-foreground">{currentQ.passageText}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Toggle Audio Script (Hidden upfront to simulate real exam listening) */}
        {currentQ.audioScript && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAudioScript((prev) => !prev)}
              className="gap-1.5 text-xs font-bold rounded-xl border-dashed border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 active:scale-95"
            >
              <HelpCircle className="size-3.5" />
              <span>{showAudioScript ? "Ẩn Lời Thoại Audio ✕" : "💡 Gợi Ý Lời Thoại (Audio Script)"}</span>
            </Button>

            {showAudioScript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-700 dark:text-purple-300 font-mono leading-relaxed shadow-inner"
              >
                <span className="font-bold block text-[10px] uppercase text-purple-600 dark:text-purple-400 mb-1">
                  🎧 Lời thoại nghe (Audio Script):
                </span>
                &ldquo;{currentQ.audioScript}&rdquo;
              </motion.div>
            )}
          </div>
        )}

        {/* Question Text */}
        <div className="py-2 space-y-1">
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
            {currentQ.number}. {currentQ.questionText}
          </h2>
        </div>

        {/* Options */}
        <div className="grid gap-3 sm:grid-cols-2">
          {currentQ.options.map((opt, idx) => {
            const isSelected = userAnswers[currentQ.number] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4 text-left text-xs sm:text-sm font-medium transition-all shadow-2xs active:scale-98",
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/20 font-bold text-indigo-600 dark:text-indigo-400 shadow-md"
                    : "border-border bg-background hover:border-indigo-500/40 text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold font-mono ${isSelected ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground"}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>
                {isSelected && <CheckCircle2 className="size-5 text-indigo-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Question Navigation Bar */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            className="gap-1.5 text-xs rounded-xl"
          >
            <ArrowLeft className="size-4" /> Câu Trước
          </Button>

          {/* Question Grid Quick Jump */}
          <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-xs no-scrollbar">
            {paper.questions.map((q, idx) => {
              const isAns = userAnswers[q.number] !== undefined;
              const isCurr = currentIdx === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`size-7 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    isCurr
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-500"
                      : isAns
                      ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {q.number}
                </button>
              );
            })}
          </div>

          <Button
            disabled={currentIdx === paper.questions.length - 1}
            onClick={() => setCurrentIdx((i) => Math.min(paper.questions.length - 1, i + 1))}
            className="gap-1.5 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            <span>Câu Sau</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

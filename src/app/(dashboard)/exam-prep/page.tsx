"use client";

import { useState, useEffect, useRef } from "react";
import { useLibrary } from "@/features/library/hooks/use-library";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Play,
  CheckCircle2,
  XCircle,
  Trophy,
  RefreshCw,
  Loader2,
  Volume2,
  ChevronRight,
  BookOpen,
  Headphones,
  FileText,
  PenTool,
  Mic,
  Layers,
  Sparkles,
  Timer,
  ShieldCheck,
  Zap,
  Clock,
  AlertTriangle,
  FolderKanban,
  Eye,
  Check,
  X,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ExamType = "TOPIK" | "TOEIC" | "IELTS" | "HSK";
export type PracticeMode = "practice" | "real_exam";
export type ExamFormat =
  | "all"
  | "vocab-grammar"
  | "listening"
  | "reading"
  | "writing"
  | "speaking";

export type QuestionType =
  | "multiple-choice"
  | "fill-blank"
  | "listening"
  | "reading-comprehension"
  | "sentence-order"
  | "speaking-prompt";

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  passage?: string;
  choices?: Choice[];
  answer: string;
  audioUrl?: string;
  explanation?: string;
}

interface GenerateResponse {
  sessionId: string;
  questions: Question[];
}

// ─── Đầy đủ cấp độ & Quy chuẩn thi thật ─────────────────────────────────────
const EXAM_CONFIG: Record<
  ExamType,
  {
    name: string;
    lang: string;
    description: string;
    levels: {
      id: string;
      name: string;
      desc: string;
      realQuestions: number;
      realMinutes: number;
      maxScore: number;
      scoreType: string;
    }[];
    gradient: string;
    badge: string;
  }
> = {
  TOPIK: {
    name: "TOPIK",
    lang: "Tiếng Hàn (한국어)",
    description: "Kỳ thi Năng lực Tiếng Hàn chính thức (TOPIK I, TOPIK II & Speaking)",
    levels: [
      {
        id: "TOPIK I - Cấp 1",
        name: "TOPIK I - Cấp 1",
        desc: "30 Nghe + 40 Đọc (70 câu)",
        realQuestions: 70,
        realMinutes: 100,
        maxScore: 200,
        scoreType: "TOPIK Score (Đạt từ 80 điểm)",
      },
      {
        id: "TOPIK I - Cấp 2",
        name: "TOPIK I - Cấp 2",
        desc: "30 Nghe + 40 Đọc (70 câu)",
        realQuestions: 70,
        realMinutes: 100,
        maxScore: 200,
        scoreType: "TOPIK Score (Đạt từ 140 điểm)",
      },
      {
        id: "TOPIK II - Cấp 3",
        name: "TOPIK II - Cấp 3",
        desc: "50 Nghe + 4 Viết + 50 Đọc (104 câu)",
        realQuestions: 104,
        realMinutes: 180,
        maxScore: 300,
        scoreType: "TOPIK Score (Đạt từ 120 điểm)",
      },
      {
        id: "TOPIK II - Cấp 4",
        name: "TOPIK II - Cấp 4",
        desc: "50 Nghe + 4 Viết + 50 Đọc (104 câu)",
        realQuestions: 104,
        realMinutes: 180,
        maxScore: 300,
        scoreType: "TOPIK Score (Đạt từ 150 điểm)",
      },
      {
        id: "TOPIK II - Cấp 5",
        name: "TOPIK II - Cấp 5",
        desc: "50 Nghe + 4 Viết + 50 Đọc (104 câu)",
        realQuestions: 104,
        realMinutes: 180,
        maxScore: 300,
        scoreType: "TOPIK Score (Đạt từ 190 điểm)",
      },
      {
        id: "TOPIK II - Cấp 6",
        name: "TOPIK II - Cấp 6",
        desc: "50 Nghe + 4 Viết + 50 Đọc (104 câu)",
        realQuestions: 104,
        realMinutes: 180,
        maxScore: 300,
        scoreType: "TOPIK Score (Đạt từ 230 điểm)",
      },
      {
        id: "TOPIK Speaking",
        name: "TOPIK Speaking",
        desc: "6 câu nói chuẩn TOPIK 말하기",
        realQuestions: 6,
        realMinutes: 30,
        maxScore: 200,
        scoreType: "TOPIK Speaking Score",
      },
    ],
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  TOEIC: {
    name: "TOEIC",
    lang: "Tiếng Anh (English)",
    description: "Bài thi Tiếng Anh giao tiếp quốc tế (Listening & Reading)",
    levels: [
      {
        id: "Target 250 - 400",
        name: "Target 250 - 400",
        desc: "100 Nghe + 100 Đọc (200 câu)",
        realQuestions: 200,
        realMinutes: 120,
        maxScore: 990,
        scoreType: "TOEIC Score (Target 400)",
      },
      {
        id: "Target 405 - 600",
        name: "Target 405 - 600",
        desc: "100 Nghe + 100 Đọc (200 câu)",
        realQuestions: 200,
        realMinutes: 120,
        maxScore: 990,
        scoreType: "TOEIC Score (Target 600)",
      },
      {
        id: "Target 605 - 780",
        name: "Target 605 - 780",
        desc: "100 Nghe + 100 Đọc (200 câu)",
        realQuestions: 200,
        realMinutes: 120,
        maxScore: 990,
        scoreType: "TOEIC Score (Target 780)",
      },
      {
        id: "Target 785 - 900",
        name: "Target 785 - 900",
        desc: "100 Nghe + 100 Đọc (200 câu)",
        realQuestions: 200,
        realMinutes: 120,
        maxScore: 990,
        scoreType: "TOEIC Score (Target 900)",
      },
      {
        id: "Target 905 - 990",
        name: "Target 905 - 990",
        desc: "100 Nghe + 100 Đọc (200 câu)",
        realQuestions: 200,
        realMinutes: 120,
        maxScore: 990,
        scoreType: "TOEIC Score (Target Max 990)",
      },
      {
        id: "TOEIC Speaking & Writing",
        name: "Speaking & Writing",
        desc: "11 câu Nói + 8 câu Viết",
        realQuestions: 19,
        realMinutes: 80,
        maxScore: 400,
        scoreType: "TOEIC S&W Score",
      },
    ],
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  IELTS: {
    name: "IELTS",
    lang: "Tiếng Anh (English Academic)",
    description: "Hệ thống kiểm tra Anh ngữ quốc tế (Band 4.0 - 9.0)",
    levels: [
      {
        id: "Band 4.0 - 4.5",
        name: "Band 4.0 - 4.5",
        desc: "40 Nghe + 40 Đọc + 2 Viết (82 câu/task)",
        realQuestions: 82,
        realMinutes: 150,
        maxScore: 9.0,
        scoreType: "IELTS Overall Band Score",
      },
      {
        id: "Band 5.0 - 5.5",
        name: "Band 5.0 - 5.5",
        desc: "40 Nghe + 40 Đọc + 2 Viết (82 câu/task)",
        realQuestions: 82,
        realMinutes: 150,
        maxScore: 9.0,
        scoreType: "IELTS Overall Band Score",
      },
      {
        id: "Band 6.0 - 6.5",
        name: "Band 6.0 - 6.5",
        desc: "40 Nghe + 40 Đọc + 2 Viết (82 câu/task)",
        realQuestions: 82,
        realMinutes: 150,
        maxScore: 9.0,
        scoreType: "IELTS Overall Band Score",
      },
      {
        id: "Band 7.0 - 7.5",
        name: "Band 7.0 - 7.5",
        desc: "40 Nghe + 40 Đọc + 2 Viết (82 câu/task)",
        realQuestions: 82,
        realMinutes: 150,
        maxScore: 9.0,
        scoreType: "IELTS Overall Band Score",
      },
      {
        id: "Band 8.0 - 9.0",
        name: "Band 8.0 - 9.0",
        desc: "40 Nghe + 40 Đọc + 2 Viết (82 câu/task)",
        realQuestions: 82,
        realMinutes: 150,
        maxScore: 9.0,
        scoreType: "IELTS Overall Band Score",
      },
    ],
    gradient: "from-amber-500 via-orange-600 to-red-600",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  HSK: {
    name: "HSK",
    lang: "Tiếng Trung (中文)",
    description: "Kỳ thi Kiểm tra Hán ngữ Quốc tế (HSK 1-9 & HSKK)",
    levels: [
      {
        id: "HSK 1",
        name: "HSK 1",
        desc: "20 Nghe + 20 Đọc (40 câu)",
        realQuestions: 40,
        realMinutes: 40,
        maxScore: 200,
        scoreType: "HSK 1 Score (Đạt 120đ)",
      },
      {
        id: "HSK 2",
        name: "HSK 2",
        desc: "35 Nghe + 25 Đọc (60 câu)",
        realQuestions: 60,
        realMinutes: 55,
        maxScore: 200,
        scoreType: "HSK 2 Score (Đạt 120đ)",
      },
      {
        id: "HSK 3",
        name: "HSK 3",
        desc: "40 Nghe + 30 Đọc + 10 Viết (80 câu)",
        realQuestions: 80,
        realMinutes: 90,
        maxScore: 300,
        scoreType: "HSK 3 Score (Đạt 180đ)",
      },
      {
        id: "HSK 4",
        name: "HSK 4",
        desc: "45 Nghe + 40 Đọc + 15 Viết (100 câu)",
        realQuestions: 100,
        realMinutes: 105,
        maxScore: 300,
        scoreType: "HSK 4 Score (Đạt 180đ)",
      },
      {
        id: "HSK 5",
        name: "HSK 5",
        desc: "45 Nghe + 45 Đọc + 10 Viết (100 câu)",
        realQuestions: 100,
        realMinutes: 125,
        maxScore: 300,
        scoreType: "HSK 5 Score (Đạt 180đ)",
      },
      {
        id: "HSK 6",
        name: "HSK 6",
        desc: "50 Nghe + 50 Đọc + 1 Viết (101 câu)",
        realQuestions: 101,
        realMinutes: 140,
        maxScore: 300,
        scoreType: "HSK 6 Score (Đạt 180đ)",
      },
      {
        id: "HSK 7-9",
        name: "HSK 7-9",
        desc: "Nghe, Đọc, Viết, Dịch, Nói (98 câu)",
        realQuestions: 98,
        realMinutes: 210,
        maxScore: 300,
        scoreType: "HSK 7-9 Score",
      },
      {
        id: "HSKK Sơ Cấp",
        name: "HSKK Sơ Cấp",
        desc: "27 câu khẩu ngữ",
        realQuestions: 27,
        realMinutes: 20,
        maxScore: 100,
        scoreType: "HSKK Score (Đạt 60đ)",
      },
      {
        id: "HSKK Trung Cấp",
        name: "HSKK Trung Cấp",
        desc: "14 câu khẩu ngữ",
        realQuestions: 14,
        realMinutes: 23,
        maxScore: 100,
        scoreType: "HSKK Score (Đạt 60đ)",
      },
      {
        id: "HSKK Cao Cấp",
        name: "HSKK Cao Cấp",
        desc: "6 câu khẩu ngữ",
        realQuestions: 6,
        realMinutes: 25,
        maxScore: 100,
        scoreType: "HSKK Score (Đạt 60đ)",
      },
    ],
    gradient: "from-rose-600 via-red-600 to-pink-600",
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

const FORMAT_OPTIONS: { id: ExamFormat; label: string; icon: any; desc: string }[] = [
  {
    id: "all",
    label: "Đề Trộn Tổng Hợp",
    icon: Layers,
    desc: "Kết hợp đa dạng tất cả các loại hình thức thi",
  },
  {
    id: "vocab-grammar",
    label: "Từ Vựng & Ngữ Pháp",
    icon: BookOpen,
    desc: "Trắc nghiệm & điền từ chuyên sâu",
  },
  {
    id: "listening",
    label: "Nghe Hiểu (Listening)",
    icon: Headphones,
    desc: "Nghe file âm thanh audio & chọn/điền đáp án",
  },
  {
    id: "reading",
    label: "Đọc Hiểu (Reading)",
    icon: FileText,
    desc: "Đọc đoạn văn bản & trả lời câu hỏi",
  },
  {
    id: "writing",
    label: "Viết & Sắp Xếp Câu",
    icon: PenTool,
    desc: "Sắp xếp từ xáo trộn & hoàn thành câu",
  },
  {
    id: "speaking",
    label: "Thi Nói & Khẩu Ngữ",
    icon: Mic,
    desc: "Luyện phát âm & thi nói theo chủ đề",
  },
];

// ─── Exam Selector Component ───────────────────────────────────────────────────
function ExamSelector({
  exam,
  level,
  format,
  mode,
  practiceQuestionCount,
  setExam,
  setLevel,
  setFormat,
  setMode,
  setPracticeQuestionCount,
}: {
  exam: ExamType;
  level: string;
  format: ExamFormat;
  mode: PracticeMode;
  practiceQuestionCount: number;
  setExam: (e: ExamType) => void;
  setLevel: (l: string) => void;
  setFormat: (f: ExamFormat) => void;
  setMode: (m: PracticeMode) => void;
  setPracticeQuestionCount: (c: number) => void;
}) {
  const exams: ExamType[] = ["TOPIK", "TOEIC", "IELTS", "HSK"];
  const currentConfig = EXAM_CONFIG[exam];
  const currentLevelObj = (currentConfig.levels.find((l) => l.id === level) ?? currentConfig.levels[0])!;

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs (Chế Độ Ôn Tập vs Chế Độ Thi Thật) */}
      <div className="flex rounded-2xl bg-muted/60 p-1.5 border border-border">
        <button
          type="button"
          onClick={() => setMode("practice")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all ${
            mode === "practice"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-4" />
          📘 Chế Độ Ôn Tập
        </button>
        <button
          type="button"
          onClick={() => setMode("real_exam")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all ${
            mode === "real_exam"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="size-4" />
          🏆 Chế Độ Thi Thật
        </button>
      </div>

      {/* 1. Chọn Chứng Chỉ */}
      <div>
        <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          1. Chọn Kỳ Thi Chứng Chỉ:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {exams.map((e) => {
            const isSelected = exam === e;
            const cfg = EXAM_CONFIG[e];
            return (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setExam(e);
                  setLevel(cfg.levels[0]?.id ?? "");
                }}
                className={`group relative flex flex-col items-start justify-between rounded-2xl border p-3.5 sm:p-4 text-left transition-all ${
                  isSelected
                    ? `${cfg.badge} border-2 scale-[1.02] shadow-md ring-2 ring-primary/20`
                    : "border-border bg-background hover:border-border/80 hover:bg-muted/50"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-display text-base sm:text-lg font-extrabold">{e}</span>
                  {isSelected && (
                    <Sparkles className="size-4 animate-pulse text-primary" />
                  )}
                </div>
                <span className="mt-1 line-clamp-1 text-[11px] opacity-80 font-medium">
                  {cfg.lang}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Chọn Cấp Độ / Band Score */}
      <div>
        <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          2. Chọn Cấp Độ Thi ({currentConfig.name}):
        </label>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {currentConfig.levels.map((lvl) => {
            const isSelected = level === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevel(lvl.id)}
                className={`flex flex-col items-start rounded-xl border px-3.5 py-2 sm:px-4 sm:py-2.5 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-xs font-bold">{lvl.name}</span>
                <span className="text-[10px] opacity-70 font-normal">{lvl.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Practice: Số câu hỏi tùy chọn */}
      {mode === "practice" && (
        <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              3. Chọn Số Lượng Câu Hỏi Ôn Tập:
            </label>
            <div className="flex flex-wrap gap-2">
              {[10, 15, 20, 30, 40].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPracticeQuestionCount(c)}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                    practiceQuestionCount === c
                      ? "border-primary bg-primary text-white shadow-xs"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {c} câu
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              4. Chọn Dạng Bài / Kỹ Năng:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {FORMAT_OPTIONS.map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setFormat(fmt.id)}
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-xs">{fmt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mode Real Exam: Thông tin Quy chuẩn bài thi thật */}
      {mode === "real_exam" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs sm:text-sm">
            <Clock className="size-5 shrink-0" />
            <span>Quy Chuẩn Bài Thi Thật: {exam} - {currentLevelObj.name}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-xl border border-purple-500/20 bg-background/80 p-3">
              <span className="block text-[11px] text-muted-foreground">Tổng số câu hỏi:</span>
              <span className="font-extrabold text-foreground text-xs sm:text-sm">{currentLevelObj.realQuestions} câu chuẩn</span>
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-background/80 p-3">
              <span className="block text-[11px] text-muted-foreground">Thời gian đếm ngược:</span>
              <span className="font-extrabold text-foreground text-xs sm:text-sm">{currentLevelObj.realMinutes} phút</span>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-purple-500/20 bg-background/80 p-3">
              <span className="block text-[11px] text-muted-foreground">Thang điểm tính:</span>
              <span className="font-extrabold text-foreground text-xs sm:text-sm">{currentLevelObj.scoreType}</span>
            </div>
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-300 opacity-90 leading-normal">
            ⚡ <b>Tính năng Thi Thật:</b> Đề thi được AI tự động trích lọc & trộn đề thông minh từ các file Đề Thi trong Thư Viện + Ngân hàng đề thi AI. Đồng hồ đếm ngược sinh động, tự nộp bài khi hết giờ!
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Practice & Real Exam Active Session Component ─────────────────────────────
function ActiveExamSession({
  questions,
  mode,
  realMinutes,
  onFinish,
}: {
  questions: Question[];
  mode: PracticeMode;
  realMinutes: number;
  onFinish: (score: number, userAnswers: Record<number, string>, isTimeout?: boolean) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(realMinutes * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  // Track which question index we have auto-played audio for (avoid double-play)
  const audioPlayedRef = useRef<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // ─── Countdown Timer (Real Exam Mode) ──────────────────────────────────────
  useEffect(() => {
    if (mode !== "real_exam" || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          handleTimeUpSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, submitted]);

  // ─── Auto-Play Listening Audio When Question Changes ───────────────────────
  useEffect(() => {
    const q = questions[current];
    if (!q || submitted) return;

    // Only auto-play if this question has audio AND we haven't played it yet
    if (q.audioUrl && !audioPlayedRef.current.has(current)) {
      audioPlayedRef.current.add(current);

      // For YouTube iframes: reload with autoplay=1
      if (iframeRef.current && (q.audioUrl.includes("youtube.com") || q.audioUrl.includes("youtu.be"))) {
        let videoId = "";
        if (q.audioUrl.includes("youtu.be/")) {
          videoId = q.audioUrl.split("youtu.be/")[1]?.split("?")[0] || "";
        } else if (q.audioUrl.includes("v=")) {
          videoId = q.audioUrl.split("v=")[1]?.split("&")[0] || "";
        }
        if (videoId) {
          iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        }
      }

      // For MP3/audio files: call .play() on the audio element
      if (audioRef.current && !q.audioUrl.includes("youtube") && !q.audioUrl.includes("youtu.be")) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise
            .then(() => setIsAudioPlaying(true))
            .catch(() => {
              // Browser blocked auto-play — user must tap manually
              setIsAudioPlaying(false);
            });
        }
      }
    }
  }, [current, questions, submitted]);

  const handleTimeUpSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    questions.forEach((q, idx) => {
      const userAns = (answers[idx] || "").trim().toLowerCase();
      const correctAns = q.answer.trim().toLowerCase();
      if (userAns === correctAns || (q.type === "speaking-prompt" && userAns.length > 3)) {
        correct += 1;
      }
    });
    onFinish(correct, answers, true);
  };

  const handleSelectAnswer = (ans: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [current]: ans }));
  };

  const calculateFinalScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const userAns = (answers[idx] || "").trim().toLowerCase();
      const correctAns = q.answer.trim().toLowerCase();
      if (userAns === correctAns || (q.type === "speaking-prompt" && userAns.length > 3)) {
        correct += 1;
      }
    });
    setSubmitted(true);
    onFinish(correct, answers, false);
  };

  const q = questions[current];
  if (!q) return null;
  const isLast = current === questions.length - 1;
  const currentAnswer = answers[current] || "";

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isLowTime = timeLeft < 300 && mode === "real_exam";

  // Determine if this is a listening question with audio
  const isListeningQuestion = q.type === "listening" && q.audioUrl;
  const isYoutubeAudio = q.audioUrl && (q.audioUrl.includes("youtube.com") || q.audioUrl.includes("youtu.be"));

  // Build YouTube embed URL
  const buildYouTubeEmbed = (url: string, autoplay = false) => {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0] || "";
    }
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0`
      : url;
  };

  // Fallback choices for multiple-choice questions if choices array is omitted by AI
  const displayChoices =
    q.choices && q.choices.length > 0
      ? q.choices
      : [
          { id: "a", text: "Phương án A" },
          { id: "b", text: "Phương án B" },
          { id: "c", text: "Phương án C" },
          { id: "d", text: "Phương án D" },
        ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
        className="mt-4 sm:mt-6 rounded-3xl border border-border bg-surface p-4 sm:p-8 shadow-md"
      >
        {/* Real Exam Header with Timer */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-bold text-xs sm:text-sm text-foreground">
              Câu {current + 1} / {questions.length}
            </span>
            <span className="rounded-full border border-border px-2.5 py-0.5 font-semibold uppercase tracking-wider bg-muted/60 text-foreground text-[10px] sm:text-[11px]">
              {q.type === "multiple-choice"
                ? "Trắc nghiệm"
                : q.type === "fill-blank"
                ? "Điền chỗ trống"
                : q.type === "listening"
                ? "Nghe hiểu Audio"
                : q.type === "reading-comprehension"
                ? "Đọc hiểu đoạn văn"
                : q.type === "sentence-order"
                ? "Sắp xếp câu"
                : "Thi nói / Khẩu ngữ"}
            </span>
            {/* Auto-playing indicator */}
            {q.audioUrl && isAudioPlaying && (
              <span className="flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 animate-pulse">
                <Volume2 className="size-3" /> Đang phát...
              </span>
            )}
          </div>

          {mode === "real_exam" && (
            <div
              className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 sm:px-4 sm:py-2 font-mono text-xs sm:text-sm font-extrabold transition-all ${
                isLowTime
                  ? "border-rose-500 bg-rose-500/10 text-rose-600 animate-pulse"
                  : "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300"
              }`}
            >
              <Timer className="size-4" />
              <span>Thời Gian: {formattedTime}</span>
            </div>
          )}
        </div>

        {/* Time up banner */}
        {isTimeUp && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-600">
            <AlertTriangle className="size-5 shrink-0" />
            <span>HẾT GIỜ BÀI THI THẬT! Hệ thống đã tự động nộp bài thi.</span>
          </div>
        )}

        {/* Reading Passage if available */}
        {q.passage && (
          <div className="mb-5 rounded-2xl border border-border bg-muted/40 p-4 text-xs sm:text-sm leading-relaxed font-serif text-foreground/90 max-h-64 overflow-y-auto">
            <span className="block mb-1 text-[11px] font-bold text-primary uppercase font-sans">📄 Đoạn văn bài đọc hiểu / Đề bài:</span>
            {q.passage}
          </div>
        )}

        {/* Question Prompt */}
        <p className="mb-5 text-sm sm:text-base font-semibold leading-relaxed text-foreground">
          {q.prompt}
        </p>

        {/* Audio / YouTube Player — Auto-plays when navigating to a listening question */}
        {q.audioUrl && (
          <div className="mb-5">
            {isYoutubeAudio ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                    <Volume2 className="size-4 animate-pulse" /> 🎧 Bài Nghe (YouTube) — Tự động phát:
                  </span>
                  <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                    Bấm ▶ nếu không tự phát
                  </span>
                </div>
                <iframe
                  ref={iframeRef}
                  key={`yt-${current}`}
                  src={buildYouTubeEmbed(q.audioUrl, true)}
                  title="YouTube Listening Audio"
                  className="w-full aspect-video rounded-2xl border border-rose-500/30 shadow-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Volume2 className="size-4 animate-bounce" /> 🎧 Bài Nghe (Audio MP3) — Tự động phát:
                  </span>
                  <span className="rounded-full bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Bấm ▶ nếu không tự phát
                  </span>
                </div>
                <audio
                  ref={audioRef}
                  key={`audio-${current}`}
                  src={q.audioUrl}
                  controls
                  autoPlay
                  onPlay={() => setIsAudioPlaying(true)}
                  onPause={() => setIsAudioPlaying(false)}
                  onEnded={() => setIsAudioPlaying(false)}
                  className="w-full rounded-xl border border-primary/30 bg-muted/40 p-2 shadow-xs"
                />
              </div>
            )}
          </div>
        )}

        {/* Multiple Choice Options (Supports multiple-choice & reading-comprehension) */}
        {(q.type === "multiple-choice" || q.type === "reading-comprehension") && (
          <div className="space-y-2.5">
            {displayChoices.map((c) => {
              const isSelected = currentAnswer.toLowerCase() === c.id.toLowerCase();
              const isAnswerChoice = c.id.toLowerCase() === q.answer.toLowerCase();
              let cls =
                "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-sm text-left transition-all font-medium ";
              if (!submitted) {
                cls += isSelected
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs ring-2 ring-primary/20"
                  : "border-border bg-background text-foreground hover:bg-muted";
              } else {
                if (isAnswerChoice)
                  cls += "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold";
                else if (isSelected && !isAnswerChoice)
                  cls += "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold";
                else cls += "border-border bg-background opacity-50";
              }
              return (
                <button
                  key={c.id}
                  disabled={submitted}
                  onClick={() => handleSelectAnswer(c.id)}
                  className={cls}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold uppercase">
                    {c.id}
                  </span>
                  <span>{c.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Fill-in-the-blank & Sentence Order */}
        {(q.type === "fill-blank" || q.type === "sentence-order" || q.type === "listening") && (
          <input
            disabled={submitted}
            value={currentAnswer}
            onChange={(e) => handleSelectAnswer(e.target.value)}
            placeholder="Nhập câu trả lời của bạn vào đây..."
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm outline-none focus:border-primary transition-colors"
          />
        )}

        {/* Speaking Prompt Input */}
        {q.type === "speaking-prompt" && (
          <textarea
            rows={3}
            disabled={submitted}
            value={currentAnswer}
            onChange={(e) => handleSelectAnswer(e.target.value)}
            placeholder="Nhập câu trả lời bài thi nói của bạn bằng ngôn ngữ thi..."
            className="w-full rounded-2xl border border-border bg-background p-3 sm:p-4 text-xs sm:text-sm outline-none focus:border-primary"
          />
        )}

        {/* Question Navigation & Submit */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={current === 0}
              onClick={() => {
                setIsAudioPlaying(false);
                if (audioRef.current) audioRef.current.pause();
                setCurrent((c) => Math.max(0, c - 1));
              }}
              className="rounded-xl h-9 text-xs sm:text-sm"
            >
              Câu Trước
            </Button>
            <Button
              variant="outline"
              disabled={isLast}
              onClick={() => {
                setIsAudioPlaying(false);
                if (audioRef.current) audioRef.current.pause();
                setCurrent((c) => Math.min(questions.length - 1, c + 1));
              }}
              className="rounded-xl h-9 text-xs sm:text-sm"
            >
              Câu Sau
            </Button>
          </div>

          <div className="flex gap-2">
            {!isLast ? (
              <Button
                onClick={() => {
                  setIsAudioPlaying(false);
                  if (audioRef.current) audioRef.current.pause();
                  setCurrent((c) => c + 1);
                }}
                className="bg-primary text-white hover:bg-primary/90 font-bold rounded-xl h-9 text-xs sm:text-sm"
              >
                Tiếp Theo <ChevronRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button
                onClick={calculateFinalScore}
                disabled={submitted}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl h-9 text-xs sm:text-sm shadow-md hover:opacity-90"
              >
                🏆 Nộp Bài Thi
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Exam Review Component (Xem Lại Kết Quả & Lời Giải Chi Tiết) ─────────────
function ExamReviewList({
  questions,
  userAnswers,
  onBack,
}: {
  questions: Question[];
  userAnswers: Record<number, string>;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} className="rounded-xl h-9 text-xs sm:text-sm gap-2">
            <ArrowLeft className="size-4" /> Quay Lại Bảng Điểm
          </Button>
          <h2 className="text-base sm:text-xl font-extrabold text-foreground">
            👁️ Xem Lại Chi Tiết Bài Thi & Lời Giải AI
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const userAns = (userAnswers[idx] || "").trim().toLowerCase();
          const correctAns = q.answer.trim().toLowerCase();
          const isCorrect = userAns === correctAns || (q.type === "speaking-prompt" && userAns.length > 3);

          const displayChoices =
            q.choices && q.choices.length > 0
              ? q.choices
              : [
                  { id: "a", text: "Phương án A" },
                  { id: "b", text: "Phương án B" },
                  { id: "c", text: "Phương án C" },
                  { id: "d", text: "Phương án D" },
                ];

          return (
            <div
              key={q.id || idx}
              className={`rounded-3xl border p-5 sm:p-7 space-y-4 bg-surface shadow-xs transition-all ${
                isCorrect ? "border-emerald-500/40 bg-emerald-500/5" : "border-rose-500/40 bg-rose-500/5"
              }`}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-foreground">
                    Câu {idx + 1}:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold ${
                      isCorrect
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isCorrect ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                    {isCorrect ? "Đúng" : "Sai"}
                  </span>
                </div>

                <span className="text-[11px] text-muted-foreground font-medium uppercase">
                  {q.type}
                </span>
              </div>

              {q.passage && (
                <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs sm:text-sm leading-relaxed font-serif text-foreground/90 max-h-60 overflow-y-auto">
                  <span className="block mb-1 text-[11px] font-bold text-primary font-sans">📄 Đoạn văn bài đọc:</span>
                  {q.passage}
                </div>
              )}

              <p className="text-xs sm:text-sm font-bold text-foreground leading-relaxed">{q.prompt}</p>

              {/* Options Breakdown */}
              {(q.type === "multiple-choice" || q.type === "reading-comprehension") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {displayChoices.map((c) => {
                    const isUserChoice = userAns === c.id.toLowerCase();
                    const isRightChoice = correctAns === c.id.toLowerCase();

                    let optionCls = "flex items-center gap-2.5 rounded-2xl border p-3 text-xs font-medium ";
                    if (isRightChoice) {
                      optionCls += "border-emerald-500 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/30";
                    } else if (isUserChoice && !isRightChoice) {
                      optionCls += "border-rose-500 bg-rose-500/20 text-rose-800 dark:text-rose-300 font-bold line-through";
                    } else {
                      optionCls += "border-border bg-background/60 text-muted-foreground opacity-70";
                    }

                    return (
                      <div key={c.id} className={optionCls}>
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-bold uppercase">
                          {c.id}
                        </span>
                        <span>{c.text}</span>
                        {isRightChoice && <Check className="ml-auto size-4 text-emerald-600 shrink-0" />}
                        {isUserChoice && !isRightChoice && <X className="ml-auto size-4 text-rose-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Free text answers */}
              {q.type !== "multiple-choice" && q.type !== "reading-comprehension" && (
                <div className="space-y-2 text-xs">
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                    <span className="font-bold text-rose-600">Câu trả lời của bạn: </span>
                    <span>{userAns || "(Chưa trả lời)"}</span>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <span className="font-bold text-emerald-600">Đáp án chuẩn: </span>
                    <span>{q.answer}</span>
                  </div>
                </div>
              )}

              {/* Explanation Box */}
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300">
                  <HelpCircle className="size-4 shrink-0" />
                  <span>💡 Lời Giải Chi Tiết & Từ Vựng Chìa Khóa AI:</span>
                </div>
                <p className="text-purple-950 dark:text-purple-200 leading-relaxed">
                  {q.explanation || `Đáp án chính xác là [${q.answer.toUpperCase()}]. Hãy ôn tập từ vựng & cấu trúc tương ứng trong bài học.`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={onBack} className="bg-primary text-white font-bold rounded-xl h-10 text-xs sm:text-sm px-6">
          Quay Lại Bảng Kết Quả
        </Button>
      </div>
    </div>
  );
}

// ─── Result Modal Component ────────────────────────────────────────────────────
function RealExamResultModal({
  score,
  total,
  exam,
  level,
  mode,
  onRetry,
  onRefresh,
  onOpenReview,
}: {
  score: number;
  total: number;
  exam: ExamType;
  level: string;
  mode: PracticeMode;
  onRetry: () => void;
  onRefresh: () => void;
  onOpenReview: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const cfg = EXAM_CONFIG[exam];
  const levelObj = (cfg.levels.find((l) => l.id === level) ?? cfg.levels[0])!;

  let scaledScoreText = "";
  if (exam === "TOEIC") {
    const scoreVal = Math.round((score / total) * 990);
    scaledScoreText = `Điểm TOEIC quy đổi: ${scoreVal} / 990 điểm`;
  } else if (exam === "TOPIK") {
    const scoreVal = Math.round((score / total) * levelObj.maxScore);
    scaledScoreText = `Điểm TOPIK quy đổi: ${scoreVal} / ${levelObj.maxScore} điểm`;
  } else if (exam === "IELTS") {
    const band = (Math.round((score / total) * 9 * 2) / 2).toFixed(1);
    scaledScoreText = `IELTS Estimated Band: ${band} / 9.0`;
  } else if (exam === "HSK") {
    const scoreVal = Math.round((score / total) * levelObj.maxScore);
    scaledScoreText = `Điểm HSK quy đổi: ${scoreVal} / ${levelObj.maxScore} điểm`;
  }

  const passed = pct >= 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-6 rounded-3xl border border-border bg-surface p-6 sm:p-8 text-center shadow-xl space-y-5"
    >
      <div
        className={`mx-auto flex size-20 items-center justify-center rounded-full ${
          passed ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"
        }`}
      >
        <Trophy className="size-10" />
      </div>

      <div>
        <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
          {mode === "real_exam" ? "KẾT QUẢ BÀI THI THẬT QUỐC TẾ" : "KẾT QUẢ ÔN TẬP"}
        </span>
        <h2 className="text-xl sm:text-3xl font-extrabold text-foreground mt-2">
          {passed ? "HOÀN THÀNH XUẤT SẮC! 🎉" : "CỐ GẮNG RÈN LUYỆN LẦN SAU! 💪"}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Kỳ thi <span className="font-bold text-foreground">{exam}</span> — {level}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
        <div className="text-sm sm:text-base font-extrabold text-primary">{scaledScoreText}</div>
        <div className="text-xs text-muted-foreground">
          Trả lời đúng <span className="font-bold text-foreground">{score}/{total}</span> câu ({pct}%)
        </div>
      </div>

      <div className="mx-auto h-3 w-full max-w-xs overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full ${passed ? "bg-emerald-500" : "bg-rose-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Button onClick={onOpenReview} className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl h-10 text-xs sm:text-sm shadow-md hover:opacity-95">
          <Eye className="size-4" />
          Xem Lại Kết Quả & Lời Giải Chi Tiết
        </Button>
        <Button variant="outline" onClick={onRetry} className="font-bold rounded-xl h-10 text-xs sm:text-sm">
          Làm Lại Đề Này
        </Button>
        <Button onClick={onRefresh} className="gap-2 bg-primary text-white hover:bg-primary/90 font-bold rounded-xl h-10 text-xs sm:text-sm">
          <RefreshCw className="size-4" />
          Tạo Đề Mới (AI)
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ExamPrepPage() {
  const { items, getFilesByTag } = useLibrary();

  const [exam, setExam] = useState<ExamType>("TOPIK");
  const [level, setLevel] = useState<string>("TOPIK I - Cấp 1");
  const [format, setFormat] = useState<ExamFormat>("all");
  const [mode, setMode] = useState<PracticeMode>("practice");
  const [practiceQuestionCount, setPracticeQuestionCount] = useState<number>(10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [examSections, setExamSections] = useState<{ label: string; sectionKey: string; count: number; type: string }[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState<"ai" | "library" | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const currentCfg = EXAM_CONFIG[exam];
  const currentLevelObj = currentCfg.levels.find((l) => l.id === level) || currentCfg.levels[0];

  const startPractice = async (source: "ai" | "library") => {
    setLoading(true);
    setLoadingSource(source);
    setError(null);
    setScore(null);
    setIsReviewing(false);
    setQuestions([]);
    setExamSections([]);
    setUserAnswers({});
    setLoadingStep("");

    const targetCount =
      mode === "real_exam" ? currentLevelObj!.realQuestions : practiceQuestionCount;

    try {
      const activeLibraryItems = items.filter((i: any) => !i.is_trashed);
      const matchingOrAll = activeLibraryItems.filter(
        (i: any) =>
          i.tags?.some((t: string) => t.toUpperCase().includes(exam.toUpperCase())) ||
          i.exam_category?.toUpperCase() === exam.toUpperCase() ||
          i.item_type === "exam_paper" ||
          i.item_type === "document" ||
          i.item_type === "note" ||
          i.item_type === "audio"
      );
      const targetList = matchingOrAll.length > 0 ? matchingOrAll : activeLibraryItems;

      // Group active items into categories (including combined reading + listening answer files)
      const group1_exam = targetList.filter((i: any) => i.tags?.includes("FULL_EXAM") || i.exam_paper_type === "full_exam" || i.item_type === "exam_paper");
      const group2_reading = targetList.filter((i: any) => i.tags?.includes("READING_ANSWER") || i.tags?.includes("COMBO_ANSWER") || i.exam_paper_type === "reading_answer" || i.exam_paper_type === "combo_answer");
      const group3_listening = targetList.filter((i: any) => i.tags?.includes("LISTENING_ANSWER") || i.tags?.includes("COMBO_ANSWER") || i.exam_paper_type === "listening_answer" || i.exam_paper_type === "combo_answer");
      const group2_3_combo = targetList.filter((i: any) => i.tags?.includes("COMBO_ANSWER") || i.exam_paper_type === "combo_answer");
      const group4_writing = targetList.filter((i: any) => i.tags?.includes("WRITING_ANSWER") || i.exam_paper_type === "writing_answer");
      const group5_audio = targetList.filter((i: any) => i.tags?.includes("AUDIO_ATTACHMENT") || i.exam_paper_type === "audio_attachment" || i.item_type === "audio" || i.file_url?.includes("youtube") || i.file_url?.includes("youtu.be"));

      const fileUrls = targetList
        .map((f: any) => f.file_url)
        .filter(Boolean) as string[];

      // Format structured prompt context for AI with categories
      let libraryContext = `PHÂN LOẠI CÁC NHÓM TÀI LIỆU THƯ VIỆN CHO KỲ THI ${exam} (${level}):\n\n`;

      libraryContext += `=== 1. ĐỀ THI (Exam Papers - ${group1_exam.length} tệp) ===\n`;
      group1_exam.slice(0, 5).forEach((item: any, idx: number) => {
        libraryContext += `[Đề ${idx + 1}] ${item.title} | File: ${item.file_url || "Không có URL"}\nNội dung/Text: ${(item.content_text || "").slice(0, 1000)}\n\n`;
      });

      if (group2_3_combo.length > 0) {
        libraryContext += `=== 2&3. ĐÁP ÁN ĐỌC + NGHE GỘP CHUNG (Combined Reading & Listening Answer Keys - ${group2_3_combo.length} tệp) ===\nChú ý: Tệp này chứa CẢ ĐÁP ÁN ĐỌC VÀ TRANSCRIPT/ĐÁP ÁN NGHE GỘP CHUNG. AI đọc và trích đáp án cho cả 2 phần!\n`;
        group2_3_combo.slice(0, 5).forEach((item: any, idx: number) => {
          libraryContext += `[Đáp án Gộp ${idx + 1}] ${item.title}\nNội dung: ${(item.content_text || "").slice(0, 1500)}\n\n`;
        });
      }

      libraryContext += `=== 2. ĐÁP ÁN ĐỌC (Reading Answer Keys - ${group2_reading.length} tệp) ===\n`;
      group2_reading.slice(0, 5).forEach((item: any, idx: number) => {
        libraryContext += `[Đáp án Đọc ${idx + 1}] ${item.title}\nNội dung/Text: ${(item.content_text || "").slice(0, 1000)}\n\n`;
      });

      libraryContext += `=== 3. ĐÁP ÁN NGHE & TRANSCRIPT (Listening Answer Keys - ${group3_listening.length} tệp) ===\n`;
      group3_listening.slice(0, 5).forEach((item: any, idx: number) => {
        libraryContext += `[Đáp án Nghe ${idx + 1}] ${item.title}\nNội dung/Transcript: ${(item.content_text || "").slice(0, 1000)}\n\n`;
      });

      libraryContext += `=== 4. ĐÁP ÁN VIẾT (Writing Model Answers - ${group4_writing.length} tệp) ===\n`;
      group4_writing.slice(0, 3).forEach((item: any, idx: number) => {
        libraryContext += `[Đáp án Viết ${idx + 1}] ${item.title}\nNội dung/Bài mẫu: ${(item.content_text || "").slice(0, 1000)}\n\n`;
      });

      libraryContext += `=== 5. FILE NGHE & LINK YOUTUBE (Audio Attachments - ${group5_audio.length} tệp) ===\n`;
      group5_audio.slice(0, 5).forEach((item: any, idx: number) => {
        libraryContext += `[Audio ${idx + 1}] ${item.title} | Audio/Youtube URL: ${item.file_url || "Không có URL"}\n\n`;
      });

      // Show loading step info
      if (mode === "real_exam") {
        setLoadingStep(`⏳ AI đang biên soạn đề thi ${exam} ${level} theo đúng cấu trúc thật...`);
      } else {
        setLoadingStep(`⏳ AI đang tạo ${targetCount} câu hỏi ôn tập...`);
      }

      const res = await fetch("/api/generate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam,
          level,
          format,
          mode,
          source,
          questionCount: targetCount,
          fileUrls,
          libraryContext,
          libraryItems: targetList.slice(0, 15).map((i: any) => ({
            id: i.id,
            title: i.title,
            file_url: i.file_url,
            item_type: i.item_type,
            content_text: i.content_text,
            exam_paper_type: i.exam_paper_type,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error ?? `Lỗi hệ thống (${res.status})`);
      }

      const data = await res.json();
      setQuestions(data.questions ?? []);
      setSessionId(data.sessionId ?? null);
      if (data.sections && data.sections.length > 0) {
        setExamSections(data.sections);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
      setLoadingSource(null);
      setLoadingStep("");
    }
  };

  const handleFinish = (finalScore: number, answers: Record<number, string>) => {
    setScore(finalScore);
    setUserAnswers(answers);
  };

  const handleRetry = () => {
    setScore(null);
    setIsReviewing(false);
    setUserAnswers({});
    startPractice("ai");
  };

  const handleRefresh = () => {
    setScore(null);
    setIsReviewing(false);
    setQuestions([]);
    setUserAnswers({});
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner Header - Cinema Glassmorphism Style */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${currentCfg.gradient} p-6 sm:p-8 text-white shadow-2xl`}
      >
        <div className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner">
              <GraduationCap className="size-7 sm:size-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-white uppercase backdrop-blur-md border border-white/20">
                  3 Môn Ngôn Ngữ • 4 Kỳ Thi Quốc Tế
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-3xl font-extrabold text-white mt-1">
                Luyện Thi Chứng Chỉ Quốc Tế
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl leading-relaxed">
                TOPIK (Hàn) • TOEIC & IELTS (Anh) • HSK (Trung) — Chế độ Ôn tập tự do & Thi Thật chuẩn số câu, đếm giờ real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Lựa Chọn */}
      {score === null && questions.length === 0 && (
        <div className="rounded-3xl border border-border bg-surface p-4 sm:p-8 shadow-sm space-y-6">
          <ExamSelector
            exam={exam}
            level={level}
            format={format}
            mode={mode}
            practiceQuestionCount={practiceQuestionCount}
            setExam={(e) => {
              setExam(e);
              setLevel(EXAM_CONFIG[e].levels[0]?.id ?? "");
            }}
            setLevel={setLevel}
            setFormat={setFormat}
            setMode={setMode}
            setPracticeQuestionCount={setPracticeQuestionCount}
          />

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs sm:text-sm text-rose-700 dark:text-rose-300 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* 2 NÚT TẠO ĐỀ CẠNH NHAU (Tạo AI vs Trộn Từ Thư Viện) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Nút 1: Tạo AI hoàn toàn / trên mạng */}
            <Button
              onClick={() => startPractice("ai")}
              disabled={loading}
              className={`w-full gap-2.5 py-6 text-xs sm:text-sm font-extrabold rounded-2xl bg-gradient-to-r ${currentCfg.gradient} text-white shadow-lg hover:opacity-95 transition-all`}
            >
              {loading && loadingSource === "ai" ? (
                <>
                  <Loader2 className="size-4 sm:size-5 animate-spin" />
                  Đang khởi tạo bài AI ({exam})...
                </>
              ) : mode === "real_exam" ? (
                <>
                  <ShieldCheck className="size-4 sm:size-5" />
                  🏆 Tạo Đề Thi AI Quốc Tế
                </>
              ) : (
                <>
                  <Sparkles className="size-4 sm:size-5" />
                  ✨ Tạo Bài Ôn AI Tự Động
                </>
              )}
            </Button>

            {/* Nút 2: Trộn từ Thư Viện người dùng */}
            <Button
              onClick={() => startPractice("library")}
              disabled={loading}
              variant="outline"
              className="w-full gap-2.5 py-6 text-xs sm:text-sm font-extrabold rounded-2xl border-2 border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 shadow-sm transition-all"
            >
              {loading && loadingSource === "library" ? (
                <>
                  <Loader2 className="size-4 sm:size-5 animate-spin" />
                  Đang quét & trộn đề từ Thư viện...
                </>
              ) : (
                <>
                  <FolderKanban className="size-4 sm:size-5 text-purple-600 dark:text-purple-400" />
                  📚 Tạo & Trộn Đề Từ Thư Viện
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-surface p-8 shadow-md text-center space-y-4"
        >
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
          <div>
            <p className="font-extrabold text-foreground text-sm sm:text-base">
              {loadingSource === "library" ? "📚 Quét & Trộn Đề Từ Thư Viện..." : "🤖 AI đang biên soạn đề thi..."}
            </p>
            {loadingStep && (
              <p className="text-xs text-muted-foreground mt-2 animate-pulse">{loadingStep}</p>
            )}
            {mode === "real_exam" && (
              <div className="mt-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-700 dark:text-purple-300">
                ⚡ Đang tạo đề thi <b>{exam} {level}</b> với đúng cấu trúc: {currentLevelObj?.desc}<br />
                <span className="opacity-75">AI sẽ tạo từng phần riêng lẻ và ghép lại. Vui lòng chờ 20-40 giây...</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Section Summary Bar (shown when exam is active) */}
      {questions.length > 0 && score === null && examSections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-muted/40 px-4 py-3 flex flex-wrap gap-3 items-center"
        >
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cấu Trúc Đề:</span>
          {examSections.map((sec, i) => {
            const sectionTypeIcon =
              sec.type === "listening" ? "🎧" :
              sec.type === "reading-comprehension" ? "📖" :
              sec.type === "writing" ? "✍️" :
              sec.type === "speaking-prompt" ? "🎤" : "📝";
            const sectionColor =
              sec.type === "listening" ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300" :
              sec.type === "reading-comprehension" ? "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300" :
              sec.type === "writing" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" :
              "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300";
            return (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${sectionColor}`}
              >
                {sectionTypeIcon} {sec.sectionKey}: <b>{sec.count} câu</b>
              </span>
            );
          })}
          <span className="ml-auto text-xs font-extrabold text-foreground">
            Tổng: {questions.length} câu
          </span>
        </motion.div>
      )}

      {/* Phần Thi Đang Chạy */}
      {questions.length > 0 && score === null && (
        <ActiveExamSession
          questions={questions}
          mode={mode}
          realMinutes={currentLevelObj!.realMinutes}
          onFinish={handleFinish}
        />
      )}

      {/* Hiển Thị Bảng Kết Quả Điểm Số */}
      {score !== null && !isReviewing && (
        <RealExamResultModal
          score={score}
          total={questions.length || 10}
          exam={exam}
          level={level}
          mode={mode}
          onRetry={handleRetry}
          onRefresh={handleRefresh}
          onOpenReview={() => setIsReviewing(true)}
        />
      )}

      {/* Hiển Thị Xem Lại Chi Tiết Kết Quả & Lời Giải AI */}
      {score !== null && isReviewing && (
        <ExamReviewList
          questions={questions}
          userAnswers={userAnswers}
          onBack={() => setIsReviewing(false)}
        />
      )}
    </div>
  );
}

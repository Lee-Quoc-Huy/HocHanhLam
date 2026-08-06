"use client";

import { useState, useEffect } from "react";
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

// ─── Đầy đủ cấp độ & Quy chuẩn thi thật (Số câu chuẩn & Thời gian thi) ───────
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
  const currentLevelObj = currentConfig.levels.find((l) => l.id === level) || currentConfig.levels[0];

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs (Ôn tập vs Thi Thật) */}
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
          📘 Chế Độ Ôn Tập (Tùy Chọn Số Câu)
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
          🏆 Chế Độ Thi Thật (Chuẩn Đếm Giờ)
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
                  setLevel(cfg.levels[0].id);
                }}
                className={`group relative flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? `${cfg.badge} border-2 scale-[1.02] shadow-md ring-2 ring-primary/20`
                    : "border-border bg-background hover:border-border/80 hover:bg-muted/50"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-display text-lg font-extrabold">{e}</span>
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
        <div className="flex flex-wrap gap-2.5">
          {currentConfig.levels.map((lvl) => {
            const isSelected = level === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevel(lvl.id)}
                className={`flex flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-all ${
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
                  className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
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
          className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5 space-y-3"
        >
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
            <Clock className="size-5" />
            <span>Quy Chuẩn Bài Thi Thật: {exam} - {currentLevelObj.name}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-purple-500/20 bg-background/80 p-3">
              <span className="block text-[11px] text-muted-foreground">Tổng số câu hỏi:</span>
              <span className="font-extrabold text-foreground text-sm">{currentLevelObj.realQuestions} câu chuẩn</span>
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-background/80 p-3">
              <span className="block text-[11px] text-muted-foreground">Thời gian đếm ngược:</span>
              <span className="font-extrabold text-foreground text-sm">{currentLevelObj.realMinutes} phút</span>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-purple-500/20 bg-background/80 p-3">
              <span className="block text-[11px] text-muted-foreground">Thang điểm tính:</span>
              <span className="font-extrabold text-foreground text-sm">{currentLevelObj.scoreType}</span>
            </div>
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-300 opacity-90">
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
  onFinish: (score: number, isTimeout?: boolean) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(realMinutes * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Countdown timer effect for Real Exam
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
  }, [mode, submitted]);

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
    onFinish(correct, true);
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
    onFinish(correct, false);
  };

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const currentAnswer = answers[current] || "";

  // Format timer
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isLowTime = timeLeft < 300 && mode === "real_exam"; // under 5 min

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
        className="mt-6 rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-md"
      >
        {/* Real Exam Header with Timer */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-foreground">
              Câu {current + 1} / {questions.length}
            </span>
            <span className="rounded-full border border-border px-3 py-1 font-semibold uppercase tracking-wider bg-muted/60 text-foreground text-[11px]">
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
          </div>

          {mode === "real_exam" && (
            <div
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 font-mono text-sm font-extrabold transition-all ${
                isLowTime
                  ? "border-rose-500 bg-rose-500/10 text-rose-600 animate-pulse"
                  : "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300"
              }`}
            >
              <Timer className="size-4" />
              <span>Thời Gian Còn Lại: {formattedTime}</span>
            </div>
          )}
        </div>

        {/* Time up banner */}
        {isTimeUp && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-600">
            <AlertTriangle className="size-5 shrink-0" />
            <span>HẾT GIỜ BÀI THI THẬT! Hệ thống đã tự động thu bài và khóa quyền làm bài.</span>
          </div>
        )}

        {/* Reading Passage if available */}
        {q.passage && (
          <div className="mb-5 rounded-2xl border border-border bg-muted/40 p-5 text-sm leading-relaxed font-serif text-foreground/90 max-h-56 overflow-y-auto">
            <span className="block mb-1 text-xs font-bold text-primary uppercase font-sans">📄 Đoạn văn bài đọc:</span>
            {q.passage}
          </div>
        )}

        {/* Question Prompt */}
        <p className="mb-5 text-base sm:text-lg font-semibold leading-relaxed text-foreground">
          {q.prompt}
        </p>

        {/* Audio Player */}
        {q.audioUrl && (
          <button
            type="button"
            className="mb-5 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/20 transition-all"
            onClick={() => new Audio(q.audioUrl).play()}
          >
            <Volume2 className="size-4 animate-bounce" />
            Phát âm thanh bài nghe (Audio)
          </button>
        )}

        {/* Multiple Choice Options */}
        {q.type === "multiple-choice" && q.choices && (
          <div className="space-y-2.5">
            {q.choices.map((c) => {
              const isSelected = currentAnswer === c.id;
              const isAnswerChoice = c.id === q.answer;
              let cls =
                "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm text-left transition-all font-medium ";
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
            className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors"
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
            className="w-full rounded-2xl border border-border bg-background p-4 text-sm outline-none focus:border-primary"
          />
        )}

        {/* Question Navigation & Submit */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="rounded-xl"
            >
              Câu Trước
            </Button>
            <Button
              variant="outline"
              disabled={isLast}
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              className="rounded-xl"
            >
              Câu Sau
            </Button>
          </div>

          <div className="flex gap-2">
            {!isLast ? (
              <Button
                onClick={() => setCurrent((c) => c + 1)}
                className="bg-primary text-white hover:bg-primary/90 font-bold rounded-xl"
              >
                Tiếp Theo <ChevronRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button
                onClick={calculateFinalScore}
                disabled={submitted}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-md hover:opacity-90"
              >
                🏆 Nộp Bài Thi Thật
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Result Modal Component (Scaled Score chuẩn thi thật) ─────────────────────
function RealExamResultModal({
  score,
  total,
  exam,
  level,
  mode,
  onRetry,
  onRefresh,
}: {
  score: number;
  total: number;
  exam: ExamType;
  level: string;
  mode: PracticeMode;
  onRetry: () => void;
  onRefresh: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const cfg = EXAM_CONFIG[exam];
  const levelObj = cfg.levels.find((l) => l.id === level) || cfg.levels[0];

  // Tính điểm quy đổi (Scaled Score)
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
      className="mt-6 rounded-3xl border border-border bg-surface p-8 text-center shadow-xl space-y-5"
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-2">
          {passed ? "CHÚC MỪNG BẠN ĐÃ ĐẠT KẾT QUẢ RẤT TỐT! 🎉" : "CỐ GẮNG RÈN LUYỆN LẦN SAU! 💪"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Kỳ thi <span className="font-bold text-foreground">{exam}</span> — {level}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
        <div className="text-base font-extrabold text-primary">{scaledScoreText}</div>
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

      <div className="flex justify-center gap-3 pt-2">
        <Button variant="outline" onClick={onRetry} className="font-bold rounded-xl">
          Làm Lại Đề Này
        </Button>
        <Button onClick={onRefresh} className="gap-2 bg-primary text-white hover:bg-primary/90 font-bold rounded-xl">
          <RefreshCw className="size-4" />
          Tạo Đề Mới (AI)
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ExamPrepPage() {
  const { getFilesByTag } = useLibrary();

  const [exam, setExam] = useState<ExamType>("TOPIK");
  const [level, setLevel] = useState<string>("TOPIK I - Cấp 1");
  const [format, setFormat] = useState<ExamFormat>("all");
  const [mode, setMode] = useState<PracticeMode>("practice");
  const [practiceQuestionCount, setPracticeQuestionCount] = useState<number>(10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCfg = EXAM_CONFIG[exam];
  const currentLevelObj = currentCfg.levels.find((l) => l.id === level) || currentCfg.levels[0];

  const startPractice = async () => {
    setLoading(true);
    setError(null);
    setScore(null);
    setQuestions([]);

    const targetCount =
      mode === "real_exam" ? currentLevelObj.realQuestions : practiceQuestionCount;

    try {
      const files = getFilesByTag([exam, level]);
      const fileUrls = files
        .map((f: any) => f.file_url)
        .filter(Boolean) as string[];

      const res = await fetch("/api/generate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam,
          level,
          format,
          mode,
          questionCount: targetCount,
          fileUrls,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error ?? `Lỗi hệ thống (${res.status})`);
      }

      const data: GenerateResponse = await res.json();
      setQuestions(data.questions);
      setSessionId(data.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = (finalScore: number) => {
    setScore(finalScore);
    setQuestions([]);
  };

  const handleRetry = () => {
    setScore(null);
    startPractice();
  };

  const handleRefresh = () => {
    setScore(null);
    setQuestions([]);
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${currentCfg.gradient} p-8 text-white shadow-xl`}
      >
        <div className="absolute -right-12 -top-12 size-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <GraduationCap className="size-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white uppercase backdrop-blur-sm">
                  Ôn Tập Tùy Chọn & Thi Thật Chuẩn Quốc Tế
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Luyện Thi Chứng Chỉ Quốc Tế
              </h1>
              <p className="text-sm text-white/80 mt-1 max-w-xl">
                TOPIK (Hàn) • TOEIC & IELTS (Anh) • HSK (Trung) — Chế độ Ôn tập tự do & Bài Thi Thật chuẩn số câu, thời gian đếm ngược do AI trộn đề từ Thư viện.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form lựa chọn */}
      {score === null && questions.length === 0 && (
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
          <ExamSelector
            exam={exam}
            level={level}
            format={format}
            mode={mode}
            practiceQuestionCount={practiceQuestionCount}
            setExam={(e) => {
              setExam(e);
              setLevel(EXAM_CONFIG[e].levels[0].id);
            }}
            setLevel={setLevel}
            setFormat={setFormat}
            setMode={setMode}
            setPracticeQuestionCount={setPracticeQuestionCount}
          />

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 font-medium">
              ⚠️ {error}
            </div>
          )}

          <Button
            onClick={startPractice}
            disabled={loading}
            className={`w-full gap-2.5 py-6 text-base font-extrabold rounded-2xl bg-gradient-to-r ${currentCfg.gradient} text-white shadow-lg hover:opacity-95 transition-all`}
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Đang trích lọc đề & khởi tạo ({exam} - {level})...
              </>
            ) : mode === "real_exam" ? (
              <>
                <ShieldCheck className="size-5" />
                Bắt Đầu Thi Thật ({currentLevelObj.realQuestions} câu / {currentLevelObj.realMinutes} phút đếm ngược)
              </>
            ) : (
              <>
                <Play className="size-5 fill-current" />
                Tạo Bài Ôn Tập ({practiceQuestionCount} câu)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Phần thi đang chạy */}
      {questions.length > 0 && score === null && (
        <ActiveExamSession
          questions={questions}
          mode={mode}
          realMinutes={currentLevelObj.realMinutes}
          onFinish={handleFinish}
        />
      )}

      {/* Hiển thị kết quả */}
      {score !== null && (
        <RealExamResultModal
          score={score}
          total={questions.length || 10}
          exam={exam}
          level={level}
          mode={mode}
          onRetry={handleRetry}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}

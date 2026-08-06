"use client";

import { useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ExamType = "TOPIK" | "TOEIC" | "IELTS" | "HSK";
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

// ─── Đầy đủ cấp độ cho 4 loại kỳ thi (3 Ngôn ngữ: Hàn - Anh - Trung) ────────
const EXAM_CONFIG: Record<
  ExamType,
  {
    name: string;
    lang: string;
    description: string;
    levels: { id: string; name: string; desc: string }[];
    gradient: string;
    badge: string;
  }
> = {
  TOPIK: {
    name: "TOPIK",
    lang: "Tiếng Hàn (한국어)",
    description: "Kỳ thi Năng lực Tiếng Hàn (TOPIK I, TOPIK II & Speaking)",
    levels: [
      { id: "TOPIK I - Cấp 1", name: "TOPIK I - Cấp 1", desc: "Sơ cấp 1 (Nhập môn)" },
      { id: "TOPIK I - Cấp 2", name: "TOPIK I - Cấp 2", desc: "Sơ cấp 2 (Giao tiếp cơ bản)" },
      { id: "TOPIK II - Cấp 3", name: "TOPIK II - Cấp 3", desc: "Trung cấp 1 (Học tập/Đi làm)" },
      { id: "TOPIK II - Cấp 4", name: "TOPIK II - Cấp 4", desc: "Trung cấp 2 (Du học ĐH)" },
      { id: "TOPIK II - Cấp 5", name: "TOPIK II - Cấp 5", desc: "Cao cấp 1 (Chuyên môn)" },
      { id: "TOPIK II - Cấp 6", name: "TOPIK II - Cấp 6", desc: "Cao cấp 2 (Master)" },
      { id: "TOPIK Speaking", name: "TOPIK Speaking", desc: "Thi nói Tiếng Hàn" },
    ],
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  TOEIC: {
    name: "TOEIC",
    lang: "Tiếng Anh (English)",
    description: "Bài thi Tiếng Anh giao tiếp quốc tế (Part 1-7 & Speaking/Writing)",
    levels: [
      { id: "Target 250 - 400", name: "Target 250 - 400", desc: "Sơ cấp / Nền tảng" },
      { id: "Target 405 - 600", name: "Target 405 - 600", desc: "Chuẩn tốt nghiệp ĐH" },
      { id: "Target 605 - 780", name: "Target 605 - 780", desc: "Đi làm công ty đa quốc gia" },
      { id: "Target 785 - 900", name: "Target 785 - 900", desc: "Thành thạo công việc" },
      { id: "Target 905 - 990", name: "Target 905 - 990", desc: "Xuất sắc / Chuyên gia" },
      { id: "TOEIC Speaking & Writing", name: "Speaking & Writing", desc: "Thi Nói & Viết TOEIC" },
    ],
    gradient: "from-emerald-600 via-teal-600 to-cyan-600",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  IELTS: {
    name: "IELTS",
    lang: "Tiếng Anh (English Academic)",
    description: "Hệ thống kiểm tra Anh ngữ quốc tế (Band 4.0 - 9.0)",
    levels: [
      { id: "Band 4.0 - 4.5", name: "Band 4.0 - 4.5", desc: "Foundation / Cơ bản" },
      { id: "Band 5.0 - 5.5", name: "Band 5.0 - 5.5", desc: "Modest User" },
      { id: "Band 6.0 - 6.5", name: "Band 6.0 - 6.5", desc: "Competent User (Du học)" },
      { id: "Band 7.0 - 7.5", name: "Band 7.0 - 7.5", desc: "Good User (Định cư)" },
      { id: "Band 8.0 - 9.0", name: "Band 8.0 - 9.0", desc: "Expert / Master User" },
    ],
    gradient: "from-amber-500 via-orange-600 to-red-600",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  HSK: {
    name: "HSK",
    lang: "Tiếng Trung (中文)",
    description: "Kỳ thi Kiểm tra Hán ngữ Quốc tế (HSK 1-9 & HSKK Khẩu ngữ)",
    levels: [
      { id: "HSK 1", name: "HSK 1", desc: "150 từ vựng sơ cấp 1" },
      { id: "HSK 2", name: "HSK 2", desc: "300 từ vựng sơ cấp 2" },
      { id: "HSK 3", name: "HSK 3", desc: "600 từ vựng trung cấp 1" },
      { id: "HSK 4", name: "HSK 4", desc: "1200 từ vựng (Du học TQ)" },
      { id: "HSK 5", name: "HSK 5", desc: "2500 từ vựng cao cấp 1" },
      { id: "HSK 6", name: "HSK 6", desc: "5000+ từ vựng cao cấp 2" },
      { id: "HSK 7-9", name: "HSK 7-9", desc: "Chuyên gia Hán ngữ" },
      { id: "HSKK Sơ Cấp", name: "HSKK Sơ Cấp", desc: "Thi nói HSKK Sơ cấp" },
      { id: "HSKK Trung Cấp", name: "HSKK Trung Cấp", desc: "Thi nói HSKK Trung cấp" },
      { id: "HSKK Cao Cấp", name: "HSKK Cao Cấp", desc: "Thi nói HSKK Cao cấp" },
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
  setExam,
  setLevel,
  setFormat,
}: {
  exam: ExamType;
  level: string;
  format: ExamFormat;
  setExam: (e: ExamType) => void;
  setLevel: (l: string) => void;
  setFormat: (f: ExamFormat) => void;
}) {
  const exams: ExamType[] = ["TOPIK", "TOEIC", "IELTS", "HSK"];
  const currentConfig = EXAM_CONFIG[exam];

  return (
    <div className="space-y-6">
      {/* 1. Chọn Chứng Chỉ */}
      <div>
        <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          1. Chọn Kỳ Thi Chứng Chỉ (4 Loại):
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
          2. Chọn Cấp Độ Thi ({currentConfig.name} - Đầy đủ cấp độ):
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

      {/* 3. Chọn Hình Thức / Dạng Bài Thi */}
      <div>
        <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          3. Chọn Dạng Bài / Kỹ Năng Thi:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FORMAT_OPTIONS.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = format === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setFormat(fmt.id)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className={`mt-0.5 rounded-lg p-2 ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">{fmt.label}</div>
                  <div className="text-[10px] opacity-70 font-normal line-clamp-1">{fmt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Practice Session Component ────────────────────────────────────────────────
function PracticeSession({
  questions,
  onFinish,
}: {
  questions: Question[];
  onFinish: (score: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const checkAnswer = () => {
    const userAnswer =
      q.type === "fill-blank" || q.type === "sentence-order" || q.type === "speaking-prompt"
        ? fillAnswer.trim().toLowerCase()
        : selected ?? "";
    const correct = q.answer.trim().toLowerCase();

    if (userAnswer === correct || (q.type === "speaking-prompt" && fillAnswer.trim().length > 3)) {
      setCorrectCount((c) => c + 1);
    }
    setSubmitted(true);
  };

  const nextQuestion = () => {
    if (isLast) {
      onFinish(correctCount + (submitted && (selected === q.answer || fillAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()) ? 1 : 0));
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setFillAnswer("");
      setSubmitted(false);
    }
  };

  const userAnswer =
    q.type === "fill-blank" || q.type === "sentence-order" || q.type === "speaking-prompt"
      ? fillAnswer.trim().toLowerCase()
      : selected?.toLowerCase() ?? "";
  const isCorrect = submitted && (userAnswer === q.answer.trim().toLowerCase() || (q.type === "speaking-prompt" && fillAnswer.trim().length > 3));

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
        className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        {/* Progress */}
        <div className="mb-5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-bold">
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
              : "Luyện thi nói / Khẩu ngữ"}
          </span>
        </div>
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Đoạn văn đọc hiểu nếu có */}
        {q.passage && (
          <div className="mb-5 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-relaxed font-serif text-foreground/90 max-h-48 overflow-y-auto">
            <span className="block mb-1 text-xs font-bold text-primary uppercase font-sans">📄 Đoạn văn bài đọc:</span>
            {q.passage}
          </div>
        )}

        {/* Nội dung câu hỏi */}
        <p className="mb-5 text-base font-semibold leading-relaxed text-foreground">
          {q.prompt}
        </p>

        {/* Nút nghe Audio nếu là câu bài nghe */}
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

        {/* Các lựa chọn trắc nghiệm */}
        {q.type === "multiple-choice" && q.choices && (
          <div className="space-y-2.5">
            {q.choices.map((c) => {
              const isSelected = selected === c.id;
              const isAnswerChoice = c.id === q.answer;
              let cls =
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-sm text-left transition-all font-medium ";
              if (!submitted) {
                cls += isSelected
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
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
                  onClick={() => setSelected(c.id)}
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

        {/* Nhập câu trả lời điền từ / sắp xếp câu */}
        {(q.type === "fill-blank" || q.type === "sentence-order" || q.type === "listening") && (
          <input
            disabled={submitted}
            value={fillAnswer}
            onChange={(e) => setFillAnswer(e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${
              submitted
                ? isCorrect
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                  : "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold"
                : "border-border bg-background text-foreground focus:border-primary"
            }`}
          />
        )}

        {/* Nhập phần thi nói / phát âm */}
        {q.type === "speaking-prompt" && (
          <div className="space-y-3">
            <textarea
              rows={3}
              disabled={submitted}
              value={fillAnswer}
              onChange={(e) => setFillAnswer(e.target.value)}
              placeholder="Nhập nội dung bài nói của bạn bằng ngôn ngữ thi..."
              className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Nhận xét & Kết quả từng câu */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${
              isCorrect
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="mt-0.5 size-5 shrink-0 text-rose-500" />
            )}
            <div className="space-y-1">
              <span className="font-bold block">
                {isCorrect ? "Chính Xác! 🎉" : `Chưa chính xác. Đáp án chuẩn: ${q.answer}`}
              </span>
              {q.explanation && (
                <span className="block text-xs opacity-90 leading-normal">
                  💡 {q.explanation}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Nút hành động */}
        <div className="mt-6 flex justify-end gap-2">
          {!submitted ? (
            <Button
              onClick={checkAnswer}
              disabled={
                (q.type === "multiple-choice" && !selected) ||
                ((q.type !== "multiple-choice") && !fillAnswer.trim())
              }
              className="bg-primary text-white hover:bg-primary/90 font-bold px-6"
            >
              Kiểm tra
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="bg-primary text-white hover:bg-primary/90 font-bold px-6">
              {isLast ? "Xem kết quả" : "Câu tiếp theo"}
              <ChevronRight className="ml-1.5 size-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Result Modal Component ────────────────────────────────────────────────────
function ResultModal({
  score,
  total,
  exam,
  level,
  onRetry,
  onRefresh,
}: {
  score: number;
  total: number;
  exam: ExamType;
  level: string;
  onRetry: () => void;
  onRefresh: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm"
    >
      <div
        className={`mx-auto mb-4 flex size-20 items-center justify-center rounded-full ${
          passed ? "bg-emerald-500/15" : "bg-rose-500/15"
        }`}
      >
        <Trophy
          className={`size-10 ${
            passed ? "text-emerald-500" : "text-rose-500"
          }`}
        />
      </div>

      <h2 className="mb-1 text-2xl font-bold text-foreground">
        {passed ? "Hoàn Thành Xuất Sắc! 🎉" : "Cố Lên Lần Sau! 💪"}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Kỳ thi <span className="font-bold text-foreground">{exam}</span> — {level}
        <br />
        Kết quả: <span className="font-bold text-foreground">{score}/{total}</span> câu đúng ({pct}%)
      </p>

      <div className="mx-auto mb-6 h-3 w-full max-w-xs overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full ${passed ? "bg-emerald-500" : "bg-rose-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onRetry} className="font-bold">
          Thi lại đề này
        </Button>
        <Button onClick={onRefresh} className="gap-2 bg-primary text-white hover:bg-primary/90 font-bold">
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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPractice = async () => {
    setLoading(true);
    setError(null);
    setScore(null);
    setQuestions([]);

    try {
      const files = getFilesByTag([exam, level]);
      const fileUrls = files
        .map((f: any) => f.file_url)
        .filter(Boolean) as string[];

      const res = await fetch("/api/generate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam, level, format, fileUrls }),
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

  const currentCfg = EXAM_CONFIG[exam];

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
                  3 Môn Ngôn Ngữ • 4 Loại Kỳ Thi
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Ôn Thi Chứng Chỉ Quốc Tế
              </h1>
              <p className="text-sm text-white/80 mt-1 max-w-xl">
                TOPIK (Hàn) • TOEIC & IELTS (Anh) • HSK (Trung) — Đầy đủ tất cả cấp độ và hình thức thi do AI tạo từ tài nguyên thư viện của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form lựa chọn */}
      {score === null && questions.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
          <ExamSelector
            exam={exam}
            level={level}
            format={format}
            setExam={(e) => {
              setExam(e);
              setLevel(EXAM_CONFIG[e].levels[0].id);
            }}
            setLevel={setLevel}
            setFormat={setFormat}
          />

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              ⚠️ {error}
            </div>
          )}

          <Button
            onClick={startPractice}
            disabled={loading}
            className={`w-full gap-2.5 py-6 text-base font-extrabold bg-gradient-to-r ${currentCfg.gradient} text-white shadow-lg hover:opacity-95 transition-all`}
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Đang tạo đề thi AI ({exam} - {level})...
              </>
            ) : (
              <>
                <Play className="size-5 fill-current" />
                Bắt Đầu Tạo Đề Thi Với Multi-AI
              </>
            )}
          </Button>
        </div>
      )}

      {/* Phần thi đang chạy */}
      {questions.length > 0 && score === null && (
        <PracticeSession questions={questions} onFinish={handleFinish} />
      )}

      {/* Hiển thị kết quả */}
      {score !== null && (
        <ResultModal
          score={score}
          total={questions.length || 10}
          exam={exam}
          level={level}
          onRetry={handleRetry}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}

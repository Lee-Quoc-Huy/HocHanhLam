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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type ExamType = "TOPIK" | "TOEIC" | "HSK";
type QuestionType = "multiple-choice" | "fill-blank" | "listening";

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  choices?: Choice[];
  answer: string;
  audioUrl?: string;
  explanation?: string;
}

interface GenerateResponse {
  sessionId: string;
  questions: Question[];
}

// ─── Level options per exam ───────────────────────────────────────────────────
const LEVELS: Record<ExamType, string[]> = {
  TOPIK: ["I", "II"],
  TOEIC: ["Listening", "Reading"],
  HSK: ["1", "2", "3", "4", "5", "6"],
};

const EXAM_COLORS: Record<ExamType, string> = {
  TOPIK: "from-blue-600 to-indigo-600",
  TOEIC: "from-emerald-600 to-teal-600",
  HSK: "from-rose-600 to-pink-600",
};

const EXAM_BADGES: Record<ExamType, string> = {
  TOPIK: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  TOEIC: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  HSK: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

// ─── Exam Selector Component ───────────────────────────────────────────────────
function ExamSelector({
  exam,
  level,
  setExam,
  setLevel,
}: {
  exam: ExamType;
  level: string;
  setExam: (e: ExamType) => void;
  setLevel: (l: string) => void;
}) {
  const exams: ExamType[] = ["TOPIK", "TOEIC", "HSK"];

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Chọn kỳ thi:</p>
        <div className="flex flex-wrap gap-2">
          {exams.map((e) => (
            <button
              key={e}
              onClick={() => {
                setExam(e);
                setLevel(LEVELS[e][0]);
              }}
              className={`rounded-xl border px-5 py-2 text-sm font-bold transition-all ${
                exam === e
                  ? `${EXAM_BADGES[e]} border scale-105 shadow`
                  : "border-border bg-surface text-muted-foreground hover:bg-muted"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Chọn cấp độ:</p>
        <div className="flex flex-wrap gap-2">
          {LEVELS[exam].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-lg border px-4 py-1.5 text-xs font-medium transition-all ${
                level === l
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface text-muted-foreground hover:bg-muted"
              }`}
            >
              {l}
            </button>
          ))}
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
      q.type === "fill-blank" ? fillAnswer.trim().toLowerCase() : selected ?? "";
    const correct = q.answer.trim().toLowerCase();
    if (userAnswer === correct) setCorrectCount((c) => c + 1);
    setSubmitted(true);
  };

  const nextQuestion = () => {
    if (isLast) {
      onFinish(correctCount + (submitted && selected === q.answer ? 1 : 0));
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setFillAnswer("");
      setSubmitted(false);
    }
  };

  const userAnswer =
    q.type === "fill-blank" ? fillAnswer.trim().toLowerCase() : selected?.toLowerCase() ?? "";
  const isCorrect = submitted && userAnswer === q.answer.trim().toLowerCase();

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
          <span>
            Câu {current + 1} / {questions.length}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 capitalize">
            {q.type === "multiple-choice"
              ? "Trắc nghiệm"
              : q.type === "fill-blank"
              ? "Điền vào chỗ trống"
              : "Nghe hiểu"}
          </span>
        </div>
        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <p className="mb-5 text-base font-semibold leading-relaxed text-foreground">
          {q.prompt}
        </p>

        {/* Audio button for listening */}
        {q.audioUrl && (
          <button
            className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
            onClick={() => new Audio(q.audioUrl).play()}
          >
            <Volume2 className="size-4" />
            Phát âm thanh
          </button>
        )}

        {/* Multiple choice */}
        {q.type === "multiple-choice" && q.choices && (
          <div className="space-y-2">
            {q.choices.map((c) => {
              const isSelected = selected === c.id;
              const isAnswerChoice = c.id === q.answer;
              let cls =
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm text-left transition-all ";
              if (!submitted) {
                cls += isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted";
              } else {
                if (isAnswerChoice)
                  cls += "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
                else if (isSelected && !isAnswerChoice)
                  cls += "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400";
                else cls += "border-border bg-background opacity-50";
              }
              return (
                <button
                  key={c.id}
                  disabled={submitted}
                  onClick={() => setSelected(c.id)}
                  className={cls}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                    {c.id.toUpperCase()}
                  </span>
                  {c.text}
                </button>
              );
            })}
          </div>
        )}

        {/* Fill-in-the-blank */}
        {q.type === "fill-blank" && (
          <input
            disabled={submitted}
            value={fillAnswer}
            onChange={(e) => setFillAnswer(e.target.value)}
            placeholder="Nhập câu trả lời..."
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${
              submitted
                ? isCorrect
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                : "border-border bg-background text-foreground focus:border-primary"
            }`}
          />
        )}

        {/* Listening: treat as fill-blank */}
        {q.type === "listening" && (
          <input
            disabled={submitted}
            value={fillAnswer}
            onChange={(e) => setFillAnswer(e.target.value)}
            placeholder="Nghe và điền câu trả lời..."
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${
              submitted
                ? isCorrect
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                : "border-border bg-background text-foreground focus:border-primary"
            }`}
          />
        )}

        {/* Feedback */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
              isCorrect
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0" />
            )}
            <span>
              {isCorrect
                ? "Chính xác! 🎉"
                : `Chưa đúng. Đáp án: ${q.answer}`}
              {q.explanation && (
                <span className="block mt-1 opacity-80">{q.explanation}</span>
              )}
            </span>
          </motion.div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          {!submitted ? (
            <Button
              onClick={checkAnswer}
              disabled={
                (q.type === "multiple-choice" && !selected) ||
                ((q.type === "fill-blank" || q.type === "listening") && !fillAnswer.trim())
              }
              className="bg-primary text-white hover:bg-primary/90"
            >
              Kiểm tra
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="bg-primary text-white hover:bg-primary/90">
              {isLast ? "Xem kết quả" : "Câu tiếp theo"}
              <ChevronRight className="ml-1 size-4" />
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
        {passed ? "Xuất sắc! 🎉" : "Cố lên! 💪"}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {exam} {level} — Bạn trả lời đúng{" "}
        <span className="font-bold text-foreground">{score}/{total}</span> câu ({pct}%)
      </p>

      {/* Score bar */}
      <div className="mx-auto mb-6 h-3 w-full max-w-xs overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full ${passed ? "bg-emerald-500" : "bg-rose-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onRetry}>
          Làm lại
        </Button>
        <Button onClick={onRefresh} className="gap-2 bg-primary text-white hover:bg-primary/90">
          <RefreshCw className="size-4" />
          Bài mới
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ExamPrepPage() {
  const { getFilesByTag } = useLibrary();

  const [exam, setExam] = useState<ExamType>("TOPIK");
  const [level, setLevel] = useState<string>("I");
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
        body: JSON.stringify({ exam, level, fileUrls }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error ?? `Lỗi ${res.status}`);
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
      {/* Page Header */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${EXAM_COLORS[exam]} p-6 text-white shadow-lg`}
      >
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Ôn Thi Chứng Chỉ</h1>
            <p className="text-sm text-white/80">
              TOPIK • TOEIC • HSK — Luyện đề AI cá nhân hoá từ tài liệu của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Selector Card */}
      {score === null && questions.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <ExamSelector
            exam={exam}
            level={level}
            setExam={(e) => {
              setExam(e);
              setLevel(LEVELS[e][0]);
            }}
            setLevel={setLevel}
          />

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              ⚠️ {error}
            </div>
          )}

          <Button
            onClick={startPractice}
            disabled={loading}
            className={`mt-6 w-full gap-2 bg-gradient-to-r ${EXAM_COLORS[exam]} text-white hover:opacity-90`}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang tạo bài ôn tập...
              </>
            ) : (
              <>
                <Play className="size-4" />
                Tạo Bài Ôn Tập với AI
              </>
            )}
          </Button>
        </div>
      )}

      {/* Practice Session */}
      {questions.length > 0 && score === null && (
        <PracticeSession questions={questions} onFinish={handleFinish} />
      )}

      {/* Result */}
      {score !== null && (
        <ResultModal
          score={score}
          total={10}
          exam={exam}
          level={level}
          onRetry={handleRetry}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}

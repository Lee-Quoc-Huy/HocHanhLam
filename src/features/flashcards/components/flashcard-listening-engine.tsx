"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Headphones,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Flame,
  Wand2,
  Loader2,
  Filter,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flashcard } from "../types";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";
import { vocabularyService } from "@/features/vocabulary/api/vocabulary-service";
import { grammarService } from "@/features/grammar/api/grammar-service";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface ListeningSentenceItem {
  id: string;
  fullSentence: string;
  sentenceWithBlank: string;
  missingWord: string;
  vietnameseTranslation: string;
  options: string[];
}

interface FlashcardListeningEngineProps {
  queue: Flashcard[];
}

export function FlashcardListeningEngine({ queue }: FlashcardListeningEngineProps) {
  const { speak } = useSpeech();
  const [listenMode, setListenMode] = useState<"pick" | "write" | "ai_dictation">("ai_dictation");
  const [selectedLang, setSelectedLang] = useState<"en" | "ko" | "zh">("en");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // AI Sentence Listening Dictation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSentences, setAiSentences] = useState<ListeningSentenceItem[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Standard Flashcard Listening State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  // Filter queue for standard modes
  const filteredQueue = useMemo(() => {
    return queue.filter((c) => {
      if (c.language !== selectedLang) return false;
      if (selectedTopic !== "all" && !c.tags?.includes(selectedTopic)) return false;
      return true;
    });
  }, [queue, selectedLang, selectedTopic]);

  // Current Card for Standard Mode
  const currentCard = filteredQueue[currentIndex] || queue[0];

  // Auto Generate AI Dictation Sentences on demand
  const handleGenerateAiDictation = async () => {
    setIsGeneratingAi(true);
    try {
      const [words, grammar] = await Promise.all([
        vocabularyService.fetchVocabulary(),
        grammarService.fetchGrammar(),
      ]);

      const filteredWords = (words || []).filter((w) => w.language === selectedLang);
      const filteredGrammar = (grammar || []).filter((g) => g.language === selectedLang);

      const res = await fetch("/api/ai/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "listening",
          language: selectedLang,
          topic: selectedTopic !== "all" ? selectedTopic : undefined,
          words: filteredWords.slice(0, 15).map((w) => ({ word: w.word, meaning: w.vietnamese })),
          grammar: filteredGrammar.slice(0, 10).map((g) => ({ title: g.title, meaning: g.meaning })),
        }),
      });

      if (!res.ok) throw new Error("AI không thể khởi tạo bài luyện nghe.");

      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setAiSentences(data.items);
        setCurrentIndex(0);
        setScore(0);
        setStreak(0);
        setCompleted(false);
        setIsAnswered(false);
        setUserInput("");
        setSelectedOption(null);
        toast.success(`Đã tạo thành công ${data.items.length} câu luyện nghe AI!`);

        // Play audio for the first sentence
        playSentenceAudio(data.items[0].fullSentence, selectedLang);
      } else {
        toast.error("Không có câu nào được tạo.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tạo câu luyện nghe AI.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Helper to play full sentence via proxy TTS API
  const playSentenceAudio = (text: string, lang: string) => {
    if (!text) return;
    setIsPlayingAudio(true);
    const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`;
    const audio = new Audio(audioUrl);
    audio.play().catch(() => {
      speak(text, lang as any);
    }).finally(() => {
      audio.onended = () => setIsPlayingAudio(false);
    });
  };

  // Initialize Standard Card audio & options
  useEffect(() => {
    if (listenMode === "ai_dictation") return;
    if (!currentCard) return;

    speak(currentCard.front_text, currentCard.language, currentCard.audio_url);

    const distractors = queue
      .filter((c) => c.id !== currentCard.id && c.front_text !== currentCard.front_text)
      .map((c) => c.front_text);

    const shuffled = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
    while (shuffled.length < 3) {
      shuffled.push(`Đáp án ${shuffled.length + 1}`);
    }

    setOptions([...shuffled, currentCard.front_text].sort(() => 0.5 - Math.random()));
    setUserInput("");
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentIndex, currentCard, listenMode, queue]);

  const currentAiSentence = aiSentences[currentIndex];

  const handleAiAnswerSubmit = (chosenWord: string) => {
    if (isAnswered || !currentAiSentence) return;
    setSelectedOption(chosenWord);
    setIsAnswered(true);

    const correct = chosenWord.trim().toLowerCase() === currentAiSentence.missingWord.trim().toLowerCase();
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextAiQuestion = () => {
    if (currentIndex < aiSentences.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsAnswered(false);
      setSelectedOption(null);
      setUserInput("");
      playSentenceAudio(aiSentences[nextIdx].fullSentence, selectedLang);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCompleted(false);
    setIsAnswered(false);
    setSelectedOption(null);
    setUserInput("");
  };

  if (completed) {
    const total = listenMode === "ai_dictation" ? aiSentences.length : filteredQueue.length;
    const accuracy = Math.round((score / Math.max(1, total)) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg rounded-3xl border border-purple-500/30 bg-surface/90 p-8 text-center shadow-2xl backdrop-blur-xl space-y-6"
      >
        <div className="flex size-20 items-center justify-center rounded-3xl bg-purple-500/10 text-purple-500 mx-auto border border-purple-500/30">
          <Trophy className="size-10" />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">Hoàn Thành Bài Luyện Nghe AI!</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Điểm Số</span>
            <p className="font-display text-2xl font-bold text-purple-600">{score} / {total}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Chính Xác</span>
            <p className="font-display text-2xl font-bold text-teal-600">{accuracy}%</p>
          </div>
        </div>
        <Button onClick={handleRestart} className="w-full gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white py-6">
          <RotateCcw className="size-4" /> Luyện Lại
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* Game Filter & Mode Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface/80 p-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Filter className="size-4 text-purple-500" /> Ngôn Ngữ:
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as any)}
            className="h-8 rounded-lg border border-border bg-background px-2 font-medium"
          >
            <option value="en">🇬🇧 Tiếng Anh</option>
            <option value="ko">🇰🇷 Tiếng Hàn</option>
            <option value="zh">🇨🇳 Tiếng Trung</option>
          </select>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl border border-border bg-background p-0.5 font-semibold">
          <button
            onClick={() => setListenMode("ai_dictation")}
            className={cn("px-3 py-1.5 rounded-lg transition-all flex items-center gap-1", listenMode === "ai_dictation" ? "bg-purple-600 text-white" : "text-muted-foreground")}
          >
            <Wand2 className="size-3.5" /> AI Nghe & Điền Câu
          </button>
          <button
            onClick={() => setListenMode("pick")}
            className={cn("px-3 py-1.5 rounded-lg transition-all", listenMode === "pick" ? "bg-purple-600 text-white" : "text-muted-foreground")}
          >
            Nghe & Chọn Từ
          </button>
        </div>
      </div>

      {/* MODE 1: AI SMART DICTATION SENTENCE LISTENING (REQ 3) */}
      {listenMode === "ai_dictation" ? (
        aiSentences.length === 0 ? (
          <div className="rounded-3xl border border-purple-500/30 bg-surface/90 p-8 text-center shadow-xl space-y-5">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 mx-auto border border-purple-500/20">
              <Headphones className="size-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Trò Chơi AI Luyện Nghe & Điền Câu</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              AI sẽ tự động tổng hợp từ vựng & ngữ pháp trên web để tạo câu chuẩn. Bạn sẽ nghe giọng phát âm full câu và chọn từ khuyết [ ___ ]!
            </p>

            <Button
              onClick={handleGenerateAiDictation}
              disabled={isGeneratingAi}
              className="py-6 px-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm gap-2 shadow-lg hover:opacity-95"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> AI Đang Tạo Bài Luyện Nghe...
                </>
              ) : (
                <>
                  <Wand2 className="size-5" /> 🤖 AI Tạo 10 Câu Luyện Nghe Mới
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl border border-purple-500/30 bg-surface/90 p-6 sm:p-8 text-center shadow-xl backdrop-blur-md space-y-6">
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-purple-600 font-bold">
                <Headphones className="size-4" /> AI Dictation {currentIndex + 1} / {aiSentences.length}
              </span>
              <Button variant="ghost" size="sm" onClick={handleGenerateAiDictation} disabled={isGeneratingAi} className="h-7 text-[11px] gap-1 text-purple-600">
                <Wand2 className="size-3" /> Đổi Bài AI
              </Button>
            </div>

            {/* Big Audio Trigger */}
            <div className="py-4 space-y-3">
              <Button
                onClick={() => playSentenceAudio(currentAiSentence.fullSentence, selectedLang)}
                size="lg"
                className={cn(
                  "size-24 rounded-full text-white shadow-xl hover:scale-105 transition-transform mx-auto flex flex-col items-center justify-center gap-1",
                  isPlayingAudio ? "bg-amber-500 animate-pulse" : "bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600"
                )}
              >
                <Volume2 className="size-8" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{isPlayingAudio ? "Đang phát..." : "Nghe Cả Câu"}</span>
              </Button>

              <div className="rounded-2xl border border-border bg-background/90 p-5 text-lg font-bold text-foreground leading-relaxed">
                {currentAiSentence.sentenceWithBlank}
              </div>

              {isAnswered && (
                <p className="text-xs text-muted-foreground italic">
                  Dịch nghĩa: "{currentAiSentence.vietnameseTranslation}"
                </p>
              )}
            </div>

            {/* 4 Choices Grid */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {currentAiSentence.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrectOpt = opt.trim().toLowerCase() === currentAiSentence.missingWord.trim().toLowerCase();

                let buttonStyle = "border-border bg-background text-foreground hover:border-purple-500/50";
                if (isAnswered) {
                  if (isCorrectOpt) {
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
                    onClick={() => handleAiAnswerSubmit(opt)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition-all shadow-2xs active:scale-98",
                      buttonStyle
                    )}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrectOpt && <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />}
                    {isAnswered && isSelected && !isCorrectOpt && <XCircle className="size-5 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback / Next button */}
            {isAnswered && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold">
                  {isCorrect ? (
                    <span className="text-emerald-500 flex items-center justify-center gap-1">
                      <CheckCircle2 className="size-4" /> Chính xác! Câu hoàn chỉnh: <strong>"{currentAiSentence.fullSentence}"</strong>
                    </span>
                  ) : (
                    <span className="text-rose-500 flex items-center justify-center gap-1">
                      <XCircle className="size-4" /> Từ đúng là: <strong className="font-mono text-sm underline">{currentAiSentence.missingWord}</strong>
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleNextAiQuestion}
                  className="w-full py-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 shadow-md"
                >
                  <span>{currentIndex < aiSentences.length - 1 ? "Câu Tiếp Theo" : "Xem Kết Quả"}</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )
      ) : (
        /* MODE 2: STANDARD LISTEN & PICK WORD */
        <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 text-center shadow-xl backdrop-blur-md space-y-6">
          <div className="py-6 space-y-4">
            <Button
              onClick={() => speak(currentCard.front_text, currentCard.language, currentCard.audio_url)}
              size="lg"
              className="size-24 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600 text-white shadow-xl hover:scale-105 transition-transform mx-auto flex flex-col items-center justify-center gap-1"
            >
              <Volume2 className="size-8 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Nghe Âm Thanh</span>
            </Button>
            <p className="text-xs text-muted-foreground">Bấm vào loa để nghe rõ phát âm từ vựng.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            {options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isRight = opt === currentCard.front_text;

              let buttonStyle = "border-border bg-background text-foreground hover:border-purple-500/50";
              if (isAnswered) {
                if (isRight) {
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
                  onClick={() => {
                    setSelectedOption(opt);
                    setIsAnswered(true);
                    const right = opt === currentCard.front_text;
                    setIsCorrect(right);
                    if (right) setScore((s) => s + 1);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition-all shadow-2xs active:scale-98",
                    buttonStyle
                  )}
                >
                  <span>{opt}</span>
                  {isAnswered && isRight && <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />}
                  {isAnswered && isSelected && !isRight && <XCircle className="size-5 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <Button
              onClick={() => {
                if (currentIndex < filteredQueue.length - 1) {
                  setCurrentIndex((i) => i + 1);
                  setIsAnswered(false);
                } else {
                  setCompleted(true);
                }
              }}
              className="w-full py-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 shadow-md"
            >
              <span>Tiếp Theo</span>
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

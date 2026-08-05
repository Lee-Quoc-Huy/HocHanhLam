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
  Plus,
  Trash2,
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
  aiCustomItems?: ListeningSentenceItem[];
  onOpenCreateCardForGame?: () => void;
  onOpenAutoGenForGame?: () => void;
  onDeleteCard?: (id: string) => void;
}

export function FlashcardListeningEngine({
  queue,
  aiCustomItems,
  onOpenCreateCardForGame,
  onOpenAutoGenForGame,
  onDeleteCard,
}: FlashcardListeningEngineProps) {
  const { speak } = useSpeech();
  const [listenMode, setListenMode] = useState<"ai_dictation" | "pick">("ai_dictation");
  const [selectedLang, setSelectedLang] = useState<"en" | "ko" | "zh">("en");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // AI Listening Dictation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSentences, setAiSentences] = useState<ListeningSentenceItem[]>(aiCustomItems || []);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Dedicated cards filter for Listening game mode
  const gameCards = useMemo(() => {
    return queue.filter((c) => {
      if (c.game_mode && c.game_mode !== "listening") return false;
      if (c.language !== selectedLang) return false;
      if (selectedTopic !== "all" && !c.tags?.includes(selectedTopic)) return false;
      return true;
    });
  }, [queue, selectedLang, selectedTopic]);

  // Standard Listening Pick Word State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  // Update AI items if provided via AI Agent
  useEffect(() => {
    if (aiCustomItems && aiCustomItems.length > 0) {
      setAiSentences(aiCustomItems);
      setListenMode("ai_dictation");
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setCompleted(false);
    }
  }, [aiCustomItems]);

  const currentCard = gameCards[currentIndex] || queue[0];

  // Helper: Play sentence audio via proxy TTS API
  const playSentenceAudio = (text: string, lang: string) => {
    if (!text) return;
    setIsPlayingAudio(true);
    const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`;
    const audio = new Audio(audioUrl);
    audio
      .play()
      .catch(() => {
        speak(text, lang as any);
      })
      .finally(() => {
        audio.onended = () => setIsPlayingAudio(false);
      });
  };

  // Generate options when card changes in "Nghe & chọn từ" mode
  useEffect(() => {
    if (listenMode !== "pick" || !currentCard) return;

    // Auto play word audio
    speak(currentCard.front_text, currentCard.language, currentCard.audio_url);

    const distractors = queue
      .filter((c) => c.id !== currentCard.id && c.front_text !== currentCard.front_text)
      .map((c) => c.front_text);

    const shuffled = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
    while (shuffled.length < 3) {
      shuffled.push(`Lựa chọn ${shuffled.length + 1}`);
    }

    setOptions([...shuffled, currentCard.front_text].sort(() => 0.5 - Math.random()));
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentIndex, currentCard, listenMode, queue]);

  // AI Sentence Generator handler
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

      if (!res.ok) throw new Error("AI không thể tạo bài nghe.");
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        setAiSentences(data.items);
        setCurrentIndex(0);
        setScore(0);
        setStreak(0);
        setCompleted(false);
        setIsAnswered(false);
        setSelectedOption(null);
        toast.success(`🤖 AI đã tạo ${data.items.length} câu nghe hoàn chỉnh!`);
        playSentenceAudio(data.items[0].fullSentence, selectedLang);
      } else {
        toast.error("Không tạo được bài nghe AI.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tạo bài nghe AI.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

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
      playSentenceAudio(aiSentences[nextIdx].fullSentence, selectedLang);
    } else {
      setCompleted(true);
    }
  };

  // Option select handler for "Nghe và chọn từ" mode (FIXED FOR REQ 4)
  const handlePickOption = (opt: string) => {
    if (isAnswered || !currentCard) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const right = opt.trim().toLowerCase() === currentCard.front_text.trim().toLowerCase();
    setIsCorrect(right);

    if (right) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextPickQuestion = () => {
    if (currentIndex < gameCards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsAnswered(false);
      setSelectedOption(null);
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
  };

  if (completed) {
    const total = listenMode === "ai_dictation" ? aiSentences.length : gameCards.length;
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
        <h2 className="font-display text-2xl font-extrabold text-foreground">Hoàn Thành Bài Luyện Nghe!</h2>
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
      {/* Game Filter & Dedicated Creation Bar */}
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

        <div className="flex items-center gap-2">
          {onOpenCreateCardForGame && (
            <Button
              size="sm"
              onClick={onOpenCreateCardForGame}
              className="h-8 text-xs gap-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
            >
              <Plus className="size-3.5" /> + Thẻ Luyện Nghe
            </Button>
          )}

          {/* Submode switcher */}
          <div className="flex rounded-xl border border-border bg-background p-0.5 font-semibold">
            <button
              onClick={() => setListenMode("ai_dictation")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1",
                listenMode === "ai_dictation" ? "bg-purple-600 text-white font-bold" : "text-muted-foreground"
              )}
            >
              <Wand2 className="size-3.5" /> AI Nghe & Điền Câu
            </button>
            <button
              onClick={() => setListenMode("pick")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all",
                listenMode === "pick" ? "bg-purple-600 text-white font-bold" : "text-muted-foreground"
              )}
            >
              Nghe & Chọn Từ
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: AI DICTATION SENTENCE LISTENING (REQ 3) */}
      {listenMode === "ai_dictation" ? (
        aiSentences.length === 0 ? (
          <div className="rounded-3xl border border-purple-500/30 bg-surface/90 p-8 text-center shadow-xl space-y-5">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 mx-auto border border-purple-500/20">
              <Headphones className="size-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">AI Luyện Nghe & Điền Từ Trong Câu</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              AI phát ra âm thanh toàn câu chuẩn ngữ pháp, đục lỗ từ vựng `[ ___ ]` để bạn vừa nghe vừa chọn từ chính xác.
            </p>
            <Button
              onClick={handleGenerateAiDictation}
              disabled={isGeneratingAi}
              className="py-6 px-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm gap-2 shadow-lg hover:opacity-95"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> AI Đang Tạo Bài Nghe...
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

            {/* Play Audio Button */}
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
                  Nghĩa tiếng Việt: "{currentAiSentence.vietnameseTranslation}"
                </p>
              )}
            </div>

            {/* 4 Choices */}
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

            {isAnswered && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold">
                  {isCorrect ? (
                    <span className="text-emerald-500 flex items-center justify-center gap-1">
                      <CheckCircle2 className="size-4" /> Đúng rồi! Câu đúng: <strong>"{currentAiSentence.fullSentence}"</strong>
                    </span>
                  ) : (
                    <span className="text-rose-500 flex items-center justify-center gap-1">
                      <XCircle className="size-4" /> Từ bị thiếu là: <strong className="font-mono text-sm underline">{currentAiSentence.missingWord}</strong>
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
        /* MODE 2: STANDARD LISTEN & PICK WORD (FIXED FOR REQ 4) */
        gameCards.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-10 text-center bg-surface/40 space-y-3">
            <Headphones className="size-8 text-purple-500 mx-auto" />
            <h3 className="font-display text-base font-bold text-foreground">Chưa Có Thẻ Riêng Cho Trò Chơi Luyện Nghe</h3>
            <p className="text-xs text-muted-foreground">Bấm "+ Thẻ Luyện Nghe" ở trên để tạo thẻ lưu riêng cho trò chơi này!</p>
            {onOpenCreateCardForGame && (
              <Button onClick={onOpenCreateCardForGame} className="bg-purple-600 hover:bg-purple-700 text-white gap-1 text-xs rounded-xl">
                <Plus className="size-3.5" /> Thêm Thẻ Luyện Nghe Mới
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 sm:p-8 text-center shadow-xl backdrop-blur-md space-y-6">
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-purple-600 font-bold">
                <Headphones className="size-4" /> Luyện Nghe Từ {currentIndex + 1} / {gameCards.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="uppercase text-[10px] font-bold bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-md">
                  {currentCard?.language}
                </span>
                {onDeleteCard && currentCard && (
                  <button
                    onClick={() => onDeleteCard(currentCard.id)}
                    className="rounded-md bg-background border border-border p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Xóa thẻ này khỏi Supabase"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="py-6 space-y-4">
              <Button
                onClick={() => speak(currentCard.front_text, currentCard.language, currentCard.audio_url)}
                size="lg"
                className="size-24 rounded-full bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-600 text-white shadow-xl hover:scale-105 transition-transform mx-auto flex flex-col items-center justify-center gap-1"
              >
                <Volume2 className="size-8 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Nghe Âm Thanh</span>
              </Button>
              <p className="text-xs text-muted-foreground">Bấm loa để nghe kỹ phát âm từ vựng và chọn đáp án.</p>
            </div>

            {/* 4 Choices */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isRight = opt.trim().toLowerCase() === currentCard.front_text.trim().toLowerCase();

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
                    onClick={() => handlePickOption(opt)}
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
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold">
                  {isCorrect ? (
                    <span className="text-emerald-500 flex items-center justify-center gap-1">
                      <CheckCircle2 className="size-4" /> Chính xác! ({currentCard.front_text} = {currentCard.back_text})
                    </span>
                  ) : (
                    <span className="text-rose-500 flex items-center justify-center gap-1">
                      <XCircle className="size-4" /> Từ đúng là: <strong className="font-mono text-sm underline">{currentCard.front_text}</strong> ({currentCard.back_text})
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleNextPickQuestion}
                  className="w-full py-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 shadow-md"
                >
                  <span>{currentIndex < gameCards.length - 1 ? "Câu Tiếp Theo" : "Xem Kết Quả"}</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

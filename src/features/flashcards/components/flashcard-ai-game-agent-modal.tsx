"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Sparkles, X, Wand2, Loader2, Play, Bot, Zap, Headphones, HelpCircle, PenTool, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import type { GameModeType } from "@/features/flashcards/types";

interface FlashcardAiGameAgentModalProps {
  open: boolean;
  onClose: () => void;
  onLaunchGame: (gameType: GameModeType, gameData: any) => void;
}

export function FlashcardAiGameAgentModal({ open, onClose, onLaunchGame }: FlashcardAiGameAgentModalProps) {
  const [selectedGameType, setSelectedGameType] = useState<GameModeType>("quiz");
  const [language, setLanguage] = useState<"en" | "ko" | "zh">("en");
  const [topic, setTopic] = useState("Daily Communication");
  const [level, setLevel] = useState("intermediate");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateGame = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: selectedGameType,
          language,
          topic: customPrompt.trim() || topic,
          level,
        }),
      });

      if (!res.ok) throw new Error("AI không thể khởi tạo trò chơi.");

      const data = await res.json();
      if (data.items && data.items.length > 0) {
        toast.success(`🤖 AI Agent đã tạo thành công bộ thẻ cho game "${data.gameTitle || "Ôn tập AI"}"!`);
        onLaunchGame(selectedGameType, data);
        onClose();
      } else {
        toast.error("Không tạo được vật phẩm trò chơi nào.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tạo game AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-purple-500/30 bg-surface-raised/95 p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 fade-in max-h-[88vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-teal-500 text-white shadow-md">
                <Bot className="size-6 animate-pulse" />
              </div>
              <div>
                <Dialog.Title className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Trợ Lý AI Agent Tạo Trò Chơi</span>
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">
                  Yêu cầu AI Agent tạo riêng một bộ thẻ trò chơi học tập mới theo đúng ý bạn.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Game Type Picker */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Chọn loại trò chơi AI muốn tạo:</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { id: "review", label: "Lật Thẻ SRS", icon: Clock },
                  { id: "quiz", label: "Quiz VIP", icon: HelpCircle },
                  { id: "listening", label: "Luyện Nghe & Điền", icon: Headphones },
                  { id: "spelling", label: "Chính Tả / Viết", icon: PenTool },
                  { id: "reflex", label: "Tốc Độ Phản Xạ", icon: Zap },
                  { id: "blank", label: "Điền Chỗ Trống", icon: Wand2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedGameType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedGameType(item.id as any)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-center transition-all text-xs font-semibold active:scale-95",
                        isSelected
                          ? "border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="size-5 text-purple-500" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language & Level */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Ngôn ngữ</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
                >
                  <option value="en">🇬🇧 Tiếng Anh</option>
                  <option value="ko">🇰🇷 Tiếng Hàn</option>
                  <option value="zh">🇨🇳 Tiếng Trung</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">Trình độ</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
                >
                  <option value="beginner">Sơ cấp (A1-A2)</option>
                  <option value="intermediate">Trung cấp (B1-B2)</option>
                  <option value="advanced">Nâng cao (C1-C2)</option>
                  <option value="master">Bậc thầy</option>
                </select>
              </div>
            </div>

            {/* Prompt / Topic preset */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Chủ đề hoặc mô tả tùy chỉnh cho AI Agent:</label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ví dụ: Từ vựng phỏng vấn xin việc, IELTS Speaking Part 2, TOPIK 5..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleGenerateGame}
              disabled={isGenerating}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 text-white font-bold shadow-lg hover:opacity-95 gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> AI Agent Đang Khởi Tạo Trò Chơi...
                </>
              ) : (
                <>
                  <Play className="size-5" /> 🤖 AI Agent Khởi Tạo & Lưu Vào Game
                </>
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

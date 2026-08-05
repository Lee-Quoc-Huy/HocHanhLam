"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send, Bot, User, Sparkles, Loader2, Volume2, History, RotateCcw,
  Paperclip, Globe, X, AlignLeft, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiMessage, AgentType, TargetLanguage, ResponseMode } from "../types";
import { AGENT_TEMPLATES } from "../lib/prompt-templates";
import { useSpeech } from "@/features/vocabulary/hooks/use-speech";
import { ExtractionConfirmCard } from "./extraction-confirm-card";
import { cn } from "@/lib/utils/cn";

interface ChatInterfaceProps {
  activeAgent: AgentType;
  targetLanguage: TargetLanguage;
  messages: AiMessage[];
  isStreaming: boolean;
  streamingContent: string;
  responseMode: ResponseMode;
  onSendMessage: (text: string) => Promise<void>;
  onSendAttachment: (file: File) => Promise<void>;
  useWebSearch: boolean;
  onToggleWebSearch: () => void;
  onSetTargetLanguage: (lang: TargetLanguage) => void;
  onSetResponseMode: (mode: ResponseMode) => void;
  onToggleHistoryDrawer: () => void;
  onNewChat: () => void;
}

export function ChatInterface({
  activeAgent,
  targetLanguage,
  messages,
  isStreaming,
  streamingContent,
  responseMode,
  onSendMessage,
  onSendAttachment,
  useWebSearch,
  onToggleWebSearch,
  onSetTargetLanguage,
  onSetResponseMode,
  onToggleHistoryDrawer,
  onNewChat,
}: ChatInterfaceProps) {
  const { speak } = useSpeech();
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isAttaching, setIsAttaching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeTemplate = AGENT_TEMPLATES[activeAgent];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStreaming) return;

    if (pendingFile) {
      const file = pendingFile;
      setPendingFile(null);
      setInput("");
      setIsAttaching(true);
      try {
        await onSendAttachment(file);
      } finally {
        setIsAttaching(false);
      }
      return;
    }

    if (!input.trim()) return;
    const userText = input.trim();
    setInput("");
    await onSendMessage(userText);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[640px] rounded-2xl border border-border/80 bg-surface/90 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border/80 bg-surface-raised/80 px-4 py-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className={`flex size-9 items-center justify-center rounded-xl border ${activeTemplate.badgeColor}`}>
            <Bot className="size-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <span>{activeTemplate.name}</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Online AI
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">{activeTemplate.role}</p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Target Language selector */}
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5 text-xs font-semibold">
            {[
              { id: "en", flag: "🇬🇧" },
              { id: "ko", flag: "🇰🇷" },
              { id: "zh", flag: "🇨🇳" },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => onSetTargetLanguage(lang.id as TargetLanguage)}
                className={`px-2 py-1 rounded-md transition-all ${
                  targetLanguage === lang.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang.flag}
              </button>
            ))}
          </div>

          {/* Response Mode Toggle */}
          <div
            className="flex items-center rounded-lg border border-border bg-background p-0.5 text-xs font-semibold"
            title="Chọn độ dài câu trả lời của AI"
          >
            <button
              onClick={() => onSetResponseMode("short")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md transition-all",
                responseMode === "short"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Trả lời ngắn — đúng trọng tâm, tiết kiệm token"
            >
              <AlignLeft className="size-3" /> Ngắn
            </button>
            <button
              onClick={() => onSetResponseMode("explain")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md transition-all",
                responseMode === "explain"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Giải thích — câu trả lời chi tiết, có ví dụ"
            >
              <BookOpen className="size-3" /> Giải thích
            </button>
          </div>

          <Button
            variant={useWebSearch ? "default" : "outline"}
            size="sm"
            onClick={onToggleWebSearch}
            className={`h-8 gap-1 text-xs ${useWebSearch ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
            title="Bật/tắt tìm kiếm Web"
          >
            <Globe className="size-3.5" /> Web
          </Button>

          <Button variant="outline" size="sm" onClick={onNewChat} className="h-8 gap-1 text-xs">
            <RotateCcw className="size-3" /> Mới
          </Button>

          <Button variant="outline" size="icon" onClick={onToggleHistoryDrawer} className="size-8" title="Lịch sử trò chuyện">
            <History className="size-4" />
          </Button>
        </div>
      </div>

      {/* Response mode indicator */}
      <div className={cn(
        "flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold border-b border-border/40",
        responseMode === "short"
          ? "bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
          : "bg-indigo-500/5 text-indigo-700 dark:text-indigo-400"
      )}>
        {responseMode === "short" ? (
          <><AlignLeft className="size-3" /> Chế độ <strong>Trả lời ngắn</strong> — AI chỉ trả lời đúng trọng tâm, tiết kiệm token.</>
        ) : (
          <><BookOpen className="size-3" /> Chế độ <strong>Giải thích</strong> — AI sẽ phân tích chi tiết và đưa ví dụ đầy đủ.</>
        )}
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-8">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="size-7 animate-pulse" />
            </div>
            <h4 className="font-display text-lg font-bold text-foreground">
              Bắt đầu trò chuyện với {activeTemplate.name}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              {activeTemplate.systemPrompt(targetLanguage === "en" ? "English" : targetLanguage === "ko" ? "Korean" : "Chinese").slice(0, 140)}...
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs sm:text-sm ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role !== "user" && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Bot className="size-4" />
              </div>
            )}

            <div
              className={`relative max-w-[82%] rounded-2xl p-4 shadow-2xs whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs font-medium"
                  : "bg-surface-raised border border-border text-foreground rounded-bl-xs"
              }`}
            >
              {msg.role !== "user" && (
                <button
                  onClick={() => speak(msg.content, targetLanguage)}
                  className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-emerald-600"
                  title="Đọc nội dung"
                >
                  <Volume2 className="size-3.5" />
                </button>
              )}
              {msg.content}

              {msg.role === "user" && msg.metadata?.imageDataUrl && (
                <img
                  src={msg.metadata.imageDataUrl}
                  alt="Ảnh đính kèm"
                  className="mt-2 max-h-56 rounded-lg border border-white/20 object-contain"
                />
              )}

              {msg.role !== "user" && msg.metadata?.extraction && (
                <ExtractionConfirmCard data={msg.metadata.extraction} targetLanguage={targetLanguage} />
              )}
            </div>

            {msg.role === "user" && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <User className="size-4" />
              </div>
            )}
          </div>
        ))}

        {/* Realtime Streaming Response Chunk */}
        {isStreaming && (
          <div className="flex gap-3 text-xs sm:text-sm justify-start">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Bot className="size-4" />
            </div>
            <div className="max-w-[82%] rounded-2xl border border-emerald-500/30 bg-surface-raised p-4 text-foreground shadow-2xs whitespace-pre-wrap leading-relaxed">
              {streamingContent ? (
                <span>
                  {streamingContent}
                  <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse" />
                </span>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-emerald-600" />
                  <span>{activeTemplate.name} đang trả lời...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSubmit} className="border-t border-border bg-surface-raised p-3">
        {pendingFile && (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 text-xs">
            <span className="flex items-center gap-1.5 text-foreground">
              <Paperclip className="size-3.5 text-emerald-600" />
              {pendingFile.name}
            </span>
            <button
              type="button"
              onClick={() => setPendingFile(null)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 focus-within:ring-1 focus-within:ring-emerald-600">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.txt,.md,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || isAttaching}
            className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-emerald-600"
            title="Gửi ảnh hoặc tài liệu"
          >
            <Paperclip className="size-4" />
          </Button>
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              pendingFile
                ? "Ghi chú thêm cho ảnh/tài liệu này (không bắt buộc)…"
                : `Hỏi ${activeTemplate.name}... (Enter để gửi, Shift+Enter để xuống dòng)`
            }
            className="flex-1 bg-transparent p-2 text-xs sm:text-sm outline-none resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={(!input.trim() && !pendingFile) || isStreaming || isAttaching}
            className="size-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm"
          >
            {isAttaching ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

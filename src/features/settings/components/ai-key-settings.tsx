"use client";

import { useState } from "react";
import { Key, Bot, Save, Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserSettings } from "../types";

interface AiKeySettingsProps {
  settings: UserSettings;
  onSave: (updates: Partial<UserSettings>) => Promise<void>;
  onTestKey: (apiKey: string) => Promise<boolean>;
  isTestingKey: boolean;
  isApiKeyValid: boolean | null;
  saveMessage: string | null;
}

const AI_MODELS = [
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro (Mặc Định Học Hành Lắm)", provider: "Google DeepMind" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash (Tốc Độ Cao)", provider: "Google DeepMind" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (Chuyên Gia Sửa Ngữ Pháp)", provider: "Anthropic" },
  { id: "openai/gpt-4o", name: "GPT-4o (Đa Năng & Hội Thoại)", provider: "OpenAI" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (Suy Luận Ngôn Ngữ Sâu)", provider: "DeepSeek" },
];

export function AiKeySettings({
  settings,
  onSave,
  onTestKey,
  isTestingKey,
  isApiKeyValid,
  saveMessage,
}: AiKeySettingsProps) {
  const [apiKey, setApiKey] = useState(settings.api_key);
  const [preferredModel, setPreferredModel] = useState(settings.preferred_ai_model);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      api_key: apiKey,
      preferred_ai_model: preferredModel,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" /> {saveMessage}
        </div>
      )}

      {/* OpenRouter API Key Input */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xs backdrop-blur-md space-y-4">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Key className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Cấu Hình OpenRouter API Key Trực Tiếp</span>
        </h3>

        <p className="text-xs text-muted-foreground">
          Nhập OpenRouter API Key cá nhân để mở khóa toàn bộ 8 Trợ Lý AI Agent không giới hạn lượt hỏi.
        </p>

        <div className="space-y-2 text-xs">
          <label className="font-bold text-foreground">API Key (sk-or-v1-...):</label>
          <div className="flex items-center gap-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="font-mono bg-background"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => onTestKey(apiKey)}
              disabled={isTestingKey || !apiKey.trim()}
              className="gap-1.5 shrink-0 text-xs"
            >
              {isTestingKey ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-amber-500" />}
              <span>Kiểm Tra Kết Nối</span>
            </Button>
          </div>

          {isApiKeyValid === true && (
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="size-4" /> API Key hợp lệ và sẵn sàng kết nối OpenRouter!
            </p>
          )}

          {isApiKeyValid === false && (
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <XCircle className="size-4" /> API Key không hợp lệ hoặc đã hết hạn ngạch.
            </p>
          )}
        </div>
      </div>

      {/* Connected AI Models Selector */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xs backdrop-blur-md space-y-4">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Bot className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Chọn Mô Hình AI Đã Kết Nối (Connected AI Models)</span>
        </h3>

        <div className="space-y-2 text-xs">
          {AI_MODELS.map((model) => {
            const isSelected = preferredModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => setPreferredModel(model.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-500/10 text-emerald-600 font-bold shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div>
                  <p className="font-bold text-foreground">{model.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">Nhà cung cấp: {model.provider}</p>
                </div>

                {isSelected && <CheckCircle2 className="size-5 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6">
          <Save className="size-4" /> Lưu Cấu Hình AI
        </Button>
      </div>
    </form>
  );
}

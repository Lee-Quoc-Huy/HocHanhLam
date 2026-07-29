"use client";

import { useState } from "react";
import { User, Target, Globe, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserSettings } from "../types";

interface ProfileSettingsProps {
  settings: UserSettings;
  onSave: (updates: Partial<UserSettings>) => Promise<void>;
  saveMessage: string | null;
}

export function ProfileSettings({ settings, onSave, saveMessage }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(settings.full_name);
  const [avatarUrl, setAvatarUrl] = useState(settings.avatar_url);
  const [bio, setBio] = useState(settings.bio);
  const [goalMins, setGoalMins] = useState(settings.learning_goal_mins);
  const [targetWords, setTargetWords] = useState(settings.daily_words_target);
  const [targetLangs, setTargetLangs] = useState<string[]>(settings.target_languages);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      full_name: fullName,
      avatar_url: avatarUrl,
      bio,
      learning_goal_mins: Number(goalMins),
      daily_words_target: Number(targetWords),
      target_languages: targetLangs,
    });
  };

  const toggleLanguage = (lang: string) => {
    if (targetLangs.includes(lang)) {
      if (targetLangs.length > 1) {
        setTargetLangs(targetLangs.filter((l) => l !== lang));
      }
    } else {
      setTargetLangs([...targetLangs, lang]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" /> {saveMessage}
        </div>
      )}

      {/* User Information */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xs backdrop-blur-md space-y-4">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <User className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Thông Tin Cá Nhân & Hồ Sơ</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">Họ và Tên:</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập tên hiển thị..."
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">Đường dẫn ảnh đại diện (Avatar URL):</label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-foreground">Tiểu sử (Bio):</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Giới thiệu bản thân và mục tiêu học tập..."
            className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none"
          />
        </div>
      </div>

      {/* Learning Goal & Language Preferences */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xs backdrop-blur-md space-y-4">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Target className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Mục Tiêu Học Tập & Ngôn Ngữ Đích</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">Thời gian học mỗi ngày (Phút):</label>
            <select
              value={goalMins}
              onChange={(e) => setGoalMins(Number(e.target.value))}
              className="w-full h-10 rounded-xl border border-border bg-background px-3 outline-none"
            >
              <option value={15}>⏱️ 15 phút / ngày (Nhẹ nhàng)</option>
              <option value={30}>⏱️ 30 phút / ngày (Khuyến nghị)</option>
              <option value={60}>⏱️ 60 phút / ngày (Chuyên sâu)</option>
              <option value={90}>⏱️ 90 phút / ngày (Cấp tốc)</option>
            </select>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-foreground">Chỉ tiêu từ vựng mới mỗi ngày:</label>
            <select
              value={targetWords}
              onChange={(e) => setTargetWords(Number(e.target.value))}
              className="w-full h-10 rounded-xl border border-border bg-background px-3 outline-none"
            >
              <option value={5}>🎯 5 từ vựng / ngày</option>
              <option value={10}>🎯 10 từ vựng / ngày</option>
              <option value={20}>🎯 20 từ vựng / ngày</option>
              <option value={50}>🎯 50 từ vựng / ngày</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <label className="font-bold text-foreground flex items-center gap-1.5">
            <Globe className="size-4 text-blue-500" />
            <span>Ngôn Ngữ Học Đang Theo Đuổi:</span>
          </label>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "en", label: "🇬🇧 Tiếng Anh (English)" },
              { id: "ko", label: "🇰🇷 Tiếng Hàn (Korean)" },
              { id: "zh", label: "🇨🇳 Tiếng Trung (Chinese)" },
            ].map((lang) => {
              const isSelected = targetLangs.includes(lang.id);
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => toggleLanguage(lang.id)}
                  className={`rounded-full border px-4 py-1.5 font-bold transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6">
          <Save className="size-4" /> Lưu Hồ Sơ & Mục Tiêu
        </Button>
      </div>
    </form>
  );
}

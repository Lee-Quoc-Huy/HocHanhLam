"use client";

import { Palette, Bell, Save, Moon, Sun, Monitor, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserSettings } from "../types";
import { useState } from "react";

interface ThemeNotificationsSettingsProps {
  settings: UserSettings;
  onSave: (updates: Partial<UserSettings>) => Promise<void>;
  saveMessage: string | null;
}

export function ThemeNotificationsSettings({ settings, onSave, saveMessage }: ThemeNotificationsSettingsProps) {
  const [theme, setTheme] = useState(settings.theme);
  const [interfaceLang, setInterfaceLang] = useState(settings.interface_language);
  const [emailNotif, setEmailNotif] = useState(settings.email_notifications);
  const [pushNotif, setPushNotif] = useState(settings.push_reminders);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      theme,
      interface_language: interfaceLang,
      email_notifications: emailNotif,
      push_reminders: pushNotif,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" /> {saveMessage}
        </div>
      )}

      {/* Theme & Interface */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xs backdrop-blur-md space-y-4">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Palette className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Giao Diện & Chế Độ Màu</span>
        </h3>

        <div className="space-y-2 text-xs">
          <label className="font-bold text-foreground">Chọn Chế Độ Giao Diện (Theme):</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light", label: "Giao Diện Sáng", icon: Sun },
              { id: "dark", label: "Giao Diện Tối", icon: Moon },
              { id: "system", label: "Theo Hệ Thống", icon: Monitor },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={`p-4 rounded-2xl border font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-600 shadow-xs"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-foreground">Ngôn Ngữ Giao Diện Web:</label>
          <select
            value={interfaceLang}
            onChange={(e) => setInterfaceLang(e.target.value as any)}
            className="w-full h-10 rounded-xl border border-border bg-background px-3 outline-none"
          >
            <option value="vi">🇻🇳 Tiếng Việt (100% Việt Hóa)</option>
            <option value="en">🇬🇧 English</option>
            <option value="ko">🇰🇷 한국어</option>
            <option value="zh">🇨🇳 中文</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xs backdrop-blur-md space-y-4">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Bell className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Cài Đặt Thông Báo & Nhắc Nhở Học Tập</span>
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background cursor-pointer">
            <div>
              <p className="font-bold text-foreground">Nhắc Nhở Học Tập Hàng Ngày (Push Reminders)</p>
              <p className="text-[11px] text-muted-foreground">Nhận thông báo nhắc nhở khi đến giờ ôn tập thẻ SRS hàng ngày.</p>
            </div>
            <input
              type="checkbox"
              checked={pushNotif}
              onChange={(e) => setPushNotif(e.target.checked)}
              className="size-4 accent-emerald-600"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background cursor-pointer">
            <div>
              <p className="font-bold text-foreground">Báo Báo Bằng Email (Email Digest)</p>
              <p className="text-[11px] text-muted-foreground">Gửi báo cáo tổng kết chuỗi ngày học và điểm XP qua email hàng tuần.</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotif}
              onChange={(e) => setEmailNotif(e.target.checked)}
              className="size-4 accent-emerald-600"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6">
          <Save className="size-4" /> Lưu Cài Đặt Giao Diện
        </Button>
      </div>
    </form>
  );
}

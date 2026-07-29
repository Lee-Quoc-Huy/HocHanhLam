"use client";

import { User, Palette, Key, ShieldCheck, Trophy, BarChart3 } from "lucide-react";
import { SettingsTab } from "../types";

interface SettingsNavTabsProps {
  activeTab: SettingsTab;
  onSelectTab: (tab: SettingsTab) => void;
}

const TABS: { id: SettingsTab; label: string; icon: any }[] = [
  { id: "profile", label: "Hồ Sơ & Mục Tiêu", icon: User },
  { id: "theme_notifications", label: "Giao Diện & Thông Báo", icon: Palette },
  { id: "ai_key", label: "Cấu Hình AI & API Key", icon: Key },
  { id: "backup_security", label: "Sao Lưu & Bảo Mật", icon: ShieldCheck },
  { id: "achievements", label: "Huy Chương & Danh Hiệu", icon: Trophy },
  { id: "analytics", label: "Thống Kê Chi Tiết", icon: BarChart3 },
];

export function SettingsNavTabs({ activeTab, onSelectTab }: SettingsNavTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border text-xs font-semibold">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all shrink-0 ${
              isActive
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

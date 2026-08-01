import { createClient } from "@/lib/supabase/client";
import type {
  UserSettings,
  AchievementItem,
  StudyAnalytics,
  BackupPayload,
} from "../types";

const STORAGE_SETTINGS_KEY = "linguaverse_user_settings";

export const DEFAULT_SETTINGS: UserSettings = {
  id: "user-set-1",
  full_name: "",
  avatar_url: "",
  bio: "",
  learning_goal_mins: 30,
  daily_words_target: 10,
  theme: "system",
  interface_language: "vi",
  target_languages: ["en", "ko", "zh"],
  api_key: "",
  preferred_ai_model: "google/gemini-2.5-pro",
  email_notifications: true,
  push_reminders: true,
  two_factor_enabled: false,
  updated_at: new Date().toISOString(),
};

// Achievement catalog — the definitions (title/description/icon) are fixed
// app content, but unlock state used to be faked as already-earned progress.
// Every achievement now starts locked; real unlock tracking needs a
// Supabase table (e.g. `user_achievements`) which doesn't exist yet.
export const MOCK_ACHIEVEMENTS: AchievementItem[] = [
  { id: "a1", achievement_key: "first_step", title: "Khởi Đầu Đam Mê", description: "Hoàn thành bài học từ vựng đầu tiên", icon: "footprints", isUnlocked: false },
  { id: "a2", achievement_key: "streak_7", title: "Bền Bỉ 7 Ngày", description: "Duy trì chuỗi học liên tục 7 ngày", icon: "flame", isUnlocked: false },
  { id: "a3", achievement_key: "vocab_master", title: "Bậc Thầy Từ Vựng", description: "Lưu trữ trên 50 từ vựng vào kho cá nhân", icon: "book-open", isUnlocked: false },
  { id: "a4", achievement_key: "ai_pioneer", title: "Tiên Phong Trí Tuệ AI", description: "Hỏi đáp với cả 8 trợ lý AI Agent", icon: "bot", isUnlocked: false },
  { id: "a5", achievement_key: "srs_champion", title: "Nhà Vô Địch Thẻ SRS", description: "Đạt độ chính xác SRS trên 90%", icon: "award", isUnlocked: false },
];

// No `study_analytics` table exists in Supabase yet, so this used to render
// a fixed set of fake numbers and a fake weekly chart as if they were the
// user's real study history. Zeroed out until a real analytics table backs it.
export const MOCK_ANALYTICS: StudyAnalytics = {
  totalStudyHours: 0,
  totalWordsLearned: 0,
  srsRetentionRate: 0,
  gamesWon: 0,
  aiInteractionsCount: 0,
  weeklyMetrics: [],
};

class SettingsService {
  private getLocalSettings(): UserSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  private setLocalSettings(settings: UserSettings) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Localstorage error saving settings:", e);
    }
  }

  // Fetch Settings
  async fetchSettings(): Promise<UserSettings> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("user_settings").select("*").single();
      if (error || !data) return this.getLocalSettings();

      const settings: UserSettings = {
        id: data.id,
        user_id: data.user_id,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        bio: data.bio,
        learning_goal_mins: data.learning_goal_mins,
        daily_words_target: data.daily_words_target,
        theme: data.theme,
        interface_language: data.interface_language,
        target_languages: data.target_languages,
        api_key: data.api_key,
        preferred_ai_model: data.preferred_ai_model,
        email_notifications: data.email_notifications,
        push_reminders: data.push_reminders,
        two_factor_enabled: data.two_factor_enabled,
        updated_at: data.updated_at,
      };
      this.setLocalSettings(settings);
      return settings;
    } catch {
      return this.getLocalSettings();
    }
  }

  // Update Settings
  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    const current = this.getLocalSettings();
    const updated: UserSettings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase.from("user_settings").upsert([(updated as unknown) as any]);
    } catch {
      // Offline fallback
    }

    this.setLocalSettings(updated);
    return updated;
  }

  // Test OpenRouter API Key Connection
  async testApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey.trim()) return false;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Generate System JSON Backup File
  generateBackupJSON(): BackupPayload {
    const settings = this.getLocalSettings();
    return {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      settings,
      vocabulary: [],
      grammar: [],
      flashcards: [],
      libraryItems: [],
    };
  }

  // Export Backup File Download
  downloadBackupFile() {
    const backup = this.generateBackupJSON();
    const filename = `HocHanhLam_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import Backup JSON
  async importBackupData(jsonText: string): Promise<boolean> {
    try {
      const parsed: BackupPayload = JSON.parse(jsonText);
      if (parsed.settings) {
        await this.updateSettings(parsed.settings);
      }
      return true;
    } catch (e) {
      console.error("Backup import error:", e);
      return false;
    }
  }

  // Fetch Achievements
  async fetchAchievements(): Promise<AchievementItem[]> {
    return MOCK_ACHIEVEMENTS;
  }

  // Fetch Analytics
  async fetchAnalytics(): Promise<StudyAnalytics> {
    return MOCK_ANALYTICS;
  }
}

export const settingsService = new SettingsService();

import { createClient } from "@/lib/supabase/client";
import type {
  UserSettings,
  AchievementItem,
  StudyAnalytics,
  BackupPayload,
} from "../types";

const STORAGE_SETTINGS_KEY = "linguaverse_user_settings";
const STORAGE_ACHIEVEMENTS_KEY = "linguaverse_user_achievements";

export const DEFAULT_SETTINGS: UserSettings = {
  id: "user-set-1",
  full_name: "Học Viên Học Hành Lắm 🍃",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80",
  bio: "Hành trình chinh phục IELTS 8.0, TOPIK 6 và HSK 6 cùng Trợ lý AI.",
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

export const MOCK_ACHIEVEMENTS: AchievementItem[] = [
  { id: "a1", achievement_key: "first_step", title: "Khởi Đầu Đam Mê", description: "Hoàn thành bài học từ vựng đầu tiên", icon: "footprints", isUnlocked: true, unlocked_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "a2", achievement_key: "streak_7", title: "Bền Bỉ 7 Ngày", description: "Duy trì chuỗi học liên tục 7 ngày", icon: "flame", isUnlocked: true, unlocked_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: "a3", achievement_key: "vocab_master", title: "Bậc Thầy Từ Vựng", description: "Lưu trữ trên 50 từ vựng vào kho cá nhân", icon: "book-open", isUnlocked: true, unlocked_at: new Date().toISOString() },
  { id: "a4", achievement_key: "ai_pioneer", title: "Tiên Phong Trí Tuệ AI", description: "Hỏi đáp với cả 8 trợ lý AI Agent", icon: "bot", isUnlocked: false },
  { id: "a5", achievement_key: "srs_champion", title: "Nhà Vô Địch Thẻ SRS", description: "Đạt độ chính xác SRS trên 90%", icon: "award", isUnlocked: false },
];

export const MOCK_ANALYTICS: StudyAnalytics = {
  totalStudyHours: 14.5,
  totalWordsLearned: 128,
  srsRetentionRate: 94.2,
  gamesWon: 18,
  aiInteractionsCount: 64,
  weeklyMetrics: [
    { date: "2026-07-23", studyMins: 25, wordsLearned: 8, cardsReviewed: 20, aiMessages: 10 },
    { date: "2026-07-24", studyMins: 40, wordsLearned: 12, cardsReviewed: 35, aiMessages: 15 },
    { date: "2026-07-25", studyMins: 30, wordsLearned: 10, cardsReviewed: 25, aiMessages: 8 },
    { date: "2026-07-26", studyMins: 50, wordsLearned: 15, cardsReviewed: 40, aiMessages: 18 },
    { date: "2026-07-27", studyMins: 35, wordsLearned: 11, cardsReviewed: 30, aiMessages: 12 },
    { date: "2026-07-28", studyMins: 45, wordsLearned: 14, cardsReviewed: 38, aiMessages: 14 },
    { date: "2026-07-29", studyMins: 60, wordsLearned: 18, cardsReviewed: 50, aiMessages: 22 },
  ],
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

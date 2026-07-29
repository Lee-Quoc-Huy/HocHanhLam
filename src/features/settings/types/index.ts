export type SettingsTab =
  | "profile"
  | "theme_notifications"
  | "ai_key"
  | "backup_security"
  | "achievements"
  | "analytics";

export interface UserSettings {
  id: string;
  user_id?: string | null;
  full_name: string;
  avatar_url: string;
  bio: string;
  learning_goal_mins: number; // 15, 30, 60, 90
  daily_words_target: number; // 5, 10, 20, 50
  theme: "light" | "dark" | "system";
  interface_language: "vi" | "en" | "ko" | "zh";
  target_languages: string[];
  api_key: string;
  preferred_ai_model: string;
  email_notifications: boolean;
  push_reminders: boolean;
  two_factor_enabled: boolean;
  updated_at: string;
}

export interface AchievementItem {
  id: string;
  achievement_key: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlocked_at?: string | null;
}

export interface DailyStudyMetric {
  date: string; // YYYY-MM-DD
  studyMins: number;
  wordsLearned: number;
  cardsReviewed: number;
  aiMessages: number;
}

export interface StudyAnalytics {
  totalStudyHours: number;
  totalWordsLearned: number;
  srsRetentionRate: number; // 0 to 100 %
  gamesWon: number;
  aiInteractionsCount: number;
  weeklyMetrics: DailyStudyMetric[];
}

export interface BackupPayload {
  version: string;
  timestamp: string;
  settings: UserSettings;
  vocabulary: any[];
  grammar: any[];
  flashcards: any[];
  libraryItems: any[];
}

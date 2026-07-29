import type { LanguageCode } from "@/config/languages";

export interface LanguageProgress {
  code: LanguageCode;
  level: string;
  xp: number;
  xpToNext: number;
  wordsLearned: number;
  wordsGoal: number;
  weeklyDeltaPct: number;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xp: number;
  done: boolean;
  progress: number;
  target: number;
  icon: "flashcards" | "reading" | "listening" | "writing" | "review";
}

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapDay {
  date: string;
  level: ActivityLevel;
  minutes: number;
}

export interface ReviewItem {
  id: string;
  term: string;
  reading?: string;
  translation: string;
  language: LanguageCode;
  dueLabel: string;
  interval: string;
}

export interface Flashcard {
  id: string;
  language: LanguageCode;
  front: string;
  reading?: string;
  back: string;
  example: string;
}

export interface RecentDocument {
  id: string;
  title: string;
  type: "pdf" | "article" | "note" | "audio";
  language: LanguageCode;
  updatedLabel: string;
  progressPct: number;
}

export interface AiRecommendation {
  id: string;
  title: string;
  reason: string;
  actionLabel: string;
  language: LanguageCode;
  confidencePct: number;
}

export interface WeeklyMinutes {
  day: string;
  minutes: number;
}

export interface LearningStats {
  currentStreak: number;
  bestStreak: number;
  totalWords: number;
  totalMinutesThisWeek: number;
  accuracyPct: number;
  weeklyMinutes: WeeklyMinutes[];
}

export interface DashboardData {
  userName: string;
  languages: LanguageProgress[];
  missions: DailyMission[];
  heatmap: HeatmapDay[];
  reviews: ReviewItem[];
  flashcards: Flashcard[];
  documents: RecentDocument[];
  recommendations: AiRecommendation[];
  stats: LearningStats;
}

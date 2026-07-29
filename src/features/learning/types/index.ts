export type GameMode =
  | "quiz"
  | "listening_quiz"
  | "grammar_quiz"
  | "vocabulary_quiz"
  | "sentence_builder"
  | "matching_game"
  | "memory_game"
  | "typing_game";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options
  correctAnswer: number; // 0..3
  explanation: string;
  audioUrl?: string; // Optional for listening quiz
  category?: "general" | "grammar" | "vocabulary" | "listening";
}

export interface SentenceBuilderQuestion {
  id: string;
  originalSentence: string;
  translation: string;
  words: string[]; // Shuffled word tiles
}

export interface MatchingPair {
  id: string;
  term: string; // Front text or target word
  definition: string; // Vietnamese definition or IPA
}

export interface MemoryCardItem {
  id: string;
  pairId: string;
  content: string;
  type: "term" | "definition";
  isFlipped: boolean;
  isMatched: boolean;
}

export interface TypingTarget {
  id: string;
  text: string;
  translation: string;
  language: "en" | "ko" | "zh";
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  totalXp: number;
  level: number;
  streakDays: number;
  rank: number;
}

export interface ChallengeItem {
  id: string;
  challengeType: "daily" | "weekly";
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardXp: number;
  isCompleted: boolean;
  dueDate: string;
}

export interface UserGamification {
  id: string;
  userId?: string | null;
  totalXp: number;
  level: number;
  streakDays: number;
  gamesPlayed: number;
  lastActiveDate: string;
}

export interface GameResult {
  gameMode: GameMode;
  score: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
  timeSeconds: number;
}

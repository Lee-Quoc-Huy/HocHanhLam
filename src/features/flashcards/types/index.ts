export type FlashcardLanguage = "en" | "ko" | "zh";
export type GameModeType = "review" | "quiz" | "spelling" | "reflex" | "blank" | "listening";

export interface FlashcardFolder {
  id: string;
  user_id?: string | null;
  name: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface FlashcardCollection {
  id: string;
  user_id?: string | null;
  folder_id?: string | null;
  name: string;
  description: string;
  language: FlashcardLanguage | "all";
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  user_id?: string | null;
  collection_id?: string | null;
  game_mode?: GameModeType; // Dedicated game mode assignment
  language: FlashcardLanguage;
  front_text: string;
  front_subtext?: string;
  back_text: string;
  back_explanation?: string;
  audio_url?: string;
  image_url?: string;
  tags: string[];
  is_favorite: boolean;

  // SRS SM-2 fields
  repetition: number;
  interval: number;
  ease_factor: number;
  status: "new" | "learning" | "mastered";
  due_date: string;
  last_reviewed_at?: string | null;

  created_at: string;
  updated_at: string;
}

export interface FlashcardFilter {
  search: string;
  language: FlashcardLanguage | "all";
  folderId: string | "all";
  collectionId: string | "all";
  gameMode?: GameModeType | "all";
  dueOnly: boolean;
  onlyFavorites: boolean;
}

export type CreateFlashcardInput = Omit<
  Flashcard,
  "id" | "repetition" | "interval" | "ease_factor" | "status" | "due_date" | "created_at" | "updated_at"
>;

export type UpdateFlashcardInput = Partial<CreateFlashcardInput>;

export interface FlashcardStats {
  totalCards: number;
  dueToday: number;
  mastered: number;
  learning: number;
  newCards: number;
  totalDecks: number;
  streakDays: number;
}

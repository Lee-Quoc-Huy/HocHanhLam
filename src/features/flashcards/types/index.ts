export type FlashcardLanguage = "en" | "ko" | "zh";

export interface FlashcardFolder {
  id: string;
  user_id?: string | null;
  name: string;
  description: string;
  color: string; // e.g. 'indigo', 'emerald', 'amber', 'rose', 'purple'
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
  language: FlashcardLanguage;
  front_text: string; // Target Word / Phrase / Question
  front_subtext?: string; // IPA / Pinyin / Subtitle
  back_text: string; // Meaning / Answer
  back_explanation?: string; // Explanation / Context / Example
  audio_url?: string;
  image_url?: string;
  tags: string[];
  is_favorite: boolean;

  // SRS SM-2 fields
  repetition: number;
  interval: number; // in days
  ease_factor: number; // EF
  status: "new" | "learning" | "mastered";
  due_date: string; // ISO date string
  last_reviewed_at?: string | null;

  created_at: string;
  updated_at: string;
}

export interface FlashcardFilter {
  search: string;
  language: FlashcardLanguage | "all";
  folderId: string | "all";
  collectionId: string | "all";
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

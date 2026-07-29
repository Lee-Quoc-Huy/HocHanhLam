export type VocabularyLanguage = "en" | "ko" | "zh";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "master";

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "interjection"
  | "phrase"
  | "idiom"
  | "particle"
  | "other";

export interface VocabularyItem {
  id: string;
  user_id?: string | null;
  language: VocabularyLanguage;
  word: string;
  ipa: string; // Phonetic transcription / Pinyin / Pronunciation
  vietnamese: string; // Vietnamese meaning
  english_meaning: string; // English explanation
  part_of_speech: PartOfSpeech | string;
  example: string;
  example_translation?: string;
  audio_url?: string;
  image_url?: string;
  synonyms: string[];
  antonyms: string[];
  frequency: number; // 1 to 5
  difficulty: DifficultyLevel;
  is_favorite: boolean;
  collection: string; // e.g., "IELTS Academic", "TOPIK II", "HSK 4"
  created_at: string;
  updated_at: string;
}

export interface VocabularyFilter {
  search: string;
  language: VocabularyLanguage | "all";
  collection: string | "all";
  difficulty: DifficultyLevel | "all";
  part_of_speech: string | "all";
  onlyFavorites: boolean;
}

export type CreateVocabularyInput = Omit<
  VocabularyItem,
  "id" | "created_at" | "updated_at"
>;

export type UpdateVocabularyInput = Partial<CreateVocabularyInput>;

export interface VocabularyStats {
  total: number;
  enCount: number;
  koCount: number;
  zhCount: number;
  favoritesCount: number;
  collectionsCount: number;
}

export type GrammarLanguage = "en" | "ko" | "zh";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "master";

export interface GrammarExample {
  example: string;
  translation: string;
}

export interface CommonMistake {
  incorrect: string;
  correct: string;
  explanation: string;
}

export interface GrammarItem {
  id: string;
  user_id?: string | null;
  language: GrammarLanguage;
  title: string; // Grammar structure e.g., "Used to vs. Be used to", "N+는/은 커녕", "越...越..."
  meaning: string; // Vietnamese meaning summary
  explanation: string; // Detailed formula and usage guide
  examples: GrammarExample[]; // List of sample sentences with translations
  common_mistakes: CommonMistake[]; // Mistakes and how to fix them
  related_grammar: string[]; // Related patterns / cross-references
  difficulty: DifficultyLevel;
  is_favorite: boolean;
  category: string; // Category e.g., "Tenses", "Conditionals", "Connectors", "TOPIK II", "HSK 4"
  ai_explanation?: string; // AI generated deep dive
  created_at: string;
  updated_at: string;
}

export interface GrammarFilter {
  search: string;
  language: GrammarLanguage | "all";
  category: string | "all";
  difficulty: DifficultyLevel | "all";
  onlyFavorites: boolean;
}

export type CreateGrammarInput = Omit<
  GrammarItem,
  "id" | "created_at" | "updated_at"
>;

export type UpdateGrammarInput = Partial<CreateGrammarInput>;

export interface GrammarStats {
  total: number;
  enCount: number;
  koCount: number;
  zhCount: number;
  favoritesCount: number;
  categoriesCount: number;
}

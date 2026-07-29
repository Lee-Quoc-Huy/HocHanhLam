export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          preferred_theme: "light" | "dark" | "system";
          target_languages: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_theme?: "light" | "dark" | "system";
          target_languages?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_theme?: "light" | "dark" | "system";
          target_languages?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      vocabulary: {
        Row: {
          id: string;
          user_id: string | null;
          language: "en" | "ko" | "zh";
          word: string;
          ipa: string;
          vietnamese: string;
          english_meaning: string;
          part_of_speech: string;
          example: string;
          example_translation: string;
          audio_url: string;
          image_url: string;
          synonyms: string[];
          antonyms: string[];
          frequency: number;
          difficulty: "beginner" | "intermediate" | "advanced" | "master";
          is_favorite: boolean;
          collection: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          language: "en" | "ko" | "zh";
          word: string;
          ipa?: string;
          vietnamese: string;
          english_meaning?: string;
          part_of_speech?: string;
          example?: string;
          example_translation?: string;
          audio_url?: string;
          image_url?: string;
          synonyms?: string[];
          antonyms?: string[];
          frequency?: number;
          difficulty?: "beginner" | "intermediate" | "advanced" | "master";
          is_favorite?: boolean;
          collection?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          language?: "en" | "ko" | "zh";
          word?: string;
          ipa?: string;
          vietnamese?: string;
          english_meaning?: string;
          part_of_speech?: string;
          example?: string;
          example_translation?: string;
          audio_url?: string;
          image_url?: string;
          synonyms?: string[];
          antonyms?: string[];
          frequency?: number;
          difficulty?: "beginner" | "intermediate" | "advanced" | "master";
          is_favorite?: boolean;
          collection?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      grammar: {
        Row: {
          id: string;
          user_id: string | null;
          language: "en" | "ko" | "zh";
          title: string;
          meaning: string;
          explanation: string;
          examples: Json;
          common_mistakes: Json;
          related_grammar: string[];
          difficulty: "beginner" | "intermediate" | "advanced" | "master";
          is_favorite: boolean;
          category: string;
          ai_explanation: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          language: "en" | "ko" | "zh";
          title: string;
          meaning: string;
          explanation?: string;
          examples?: Json;
          common_mistakes?: Json;
          related_grammar?: string[];
          difficulty?: "beginner" | "intermediate" | "advanced" | "master";
          is_favorite?: boolean;
          category?: string;
          ai_explanation?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          language?: "en" | "ko" | "zh";
          title?: string;
          meaning?: string;
          explanation?: string;
          examples?: Json;
          common_mistakes?: Json;
          related_grammar?: string[];
          difficulty?: "beginner" | "intermediate" | "advanced" | "master";
          is_favorite?: boolean;
          category?: string;
          ai_explanation?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string | null;
          collection_id: string | null;
          language: "en" | "ko" | "zh";
          front_text: string;
          front_subtext: string;
          back_text: string;
          back_explanation: string;
          audio_url: string;
          image_url: string;
          tags: string[];
          is_favorite: boolean;
          repetition: number;
          interval: number;
          ease_factor: number;
          status: "new" | "learning" | "mastered";
          due_date: string;
          last_reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          collection_id?: string | null;
          language: "en" | "ko" | "zh";
          front_text: string;
          front_subtext?: string;
          back_text?: string;
          back_explanation?: string;
          audio_url?: string;
          image_url?: string;
          tags?: string[];
          is_favorite?: boolean;
          repetition?: number;
          interval?: number;
          ease_factor?: number;
          status?: "new" | "learning" | "mastered";
          due_date?: string;
          last_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          collection_id?: string | null;
          language?: "en" | "ko" | "zh";
          front_text?: string;
          front_subtext?: string;
          back_text?: string;
          back_explanation?: string;
          audio_url?: string;
          image_url?: string;
          tags?: string[];
          is_favorite?: boolean;
          repetition?: number;
          interval?: number;
          ease_factor?: number;
          status?: "new" | "learning" | "mastered";
          due_date?: string;
          last_reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      flashcard_collections: {
        Row: {
          id: string;
          user_id: string | null;
          folder_id: string | null;
          name: string;
          description: string;
          language: "en" | "ko" | "zh" | "all";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          folder_id?: string | null;
          name: string;
          description?: string;
          language?: "en" | "ko" | "zh" | "all";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          folder_id?: string | null;
          name?: string;
          description?: string;
          language?: "en" | "ko" | "zh" | "all";
          created_at?: string;
          updated_at?: string;
        };
      };
      flashcard_folders: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string;
          color: string;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          description?: string;
          color?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          description?: string;
          color?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          agent_type: "vocabulary" | "grammar" | "teacher" | "conversation" | "planner" | "search" | "translation" | "recommendation";
          target_language: "en" | "ko" | "zh";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          agent_type: "vocabulary" | "grammar" | "teacher" | "conversation" | "planner" | "search" | "translation" | "recommendation";
          target_language?: "en" | "ko" | "zh";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          agent_type?: "vocabulary" | "grammar" | "teacher" | "conversation" | "planner" | "search" | "translation" | "recommendation";
          target_language?: "en" | "ko" | "zh";
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: "user" | "assistant" | "system";
          content?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          file_type: "pdf" | "docx" | "ppt" | "txt" | "image" | "screenshot" | "book";
          file_url: string | null;
          file_size: string;
          extracted_text: string;
          language: "en" | "ko" | "zh" | "vi";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          file_type: "pdf" | "docx" | "ppt" | "txt" | "image" | "screenshot" | "book";
          file_url?: string | null;
          file_size?: string;
          extracted_text?: string;
          language?: "en" | "ko" | "zh" | "vi";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          file_type?: "pdf" | "docx" | "ppt" | "txt" | "image" | "screenshot" | "book";
          file_url?: string | null;
          file_size?: string;
          extracted_text?: string;
          language?: "en" | "ko" | "zh" | "vi";
          created_at?: string;
          updated_at?: string;
        };
      };
      document_quizzes: {
        Row: {
          id: string;
          document_id: string;
          title: string;
          questions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          title: string;
          questions?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          title?: string;
          questions?: Json;
          created_at?: string;
        };
      };
      search_history: {
        Row: {
          id: string;
          user_id: string | null;
          query: string;
          domain_filter: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          query: string;
          domain_filter?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          query?: string;
          domain_filter?: string;
          created_at?: string;
        };
      };
      semantic_embeddings: {
        Row: {
          id: string;
          item_type: "vocabulary" | "grammar" | "conversation" | "documents" | "flashcards" | "quizzes" | "collections" | "knowledge_graph" | "recommendation";
          item_id: string;
          content_text: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_type: "vocabulary" | "grammar" | "conversation" | "documents" | "flashcards" | "quizzes" | "collections" | "knowledge_graph" | "recommendation";
          item_id: string;
          content_text: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_type?: "vocabulary" | "grammar" | "conversation" | "documents" | "flashcards" | "quizzes" | "collections" | "knowledge_graph" | "recommendation";
          item_id?: string;
          content_text?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      user_gamification: {
        Row: {
          id: string;
          user_id: string | null;
          total_xp: number;
          level: number;
          streak_days: number;
          games_played: number;
          last_active_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          total_xp?: number;
          level?: number;
          streak_days?: number;
          games_played?: number;
          last_active_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          total_xp?: number;
          level?: number;
          streak_days?: number;
          games_played?: number;
          last_active_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_scores: {
        Row: {
          id: string;
          user_id: string | null;
          game_mode: "quiz" | "listening_quiz" | "grammar_quiz" | "vocabulary_quiz" | "sentence_builder" | "matching_game" | "memory_game" | "typing_game";
          score: number;
          xp_earned: number;
          accuracy: number;
          time_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          game_mode: "quiz" | "listening_quiz" | "grammar_quiz" | "vocabulary_quiz" | "sentence_builder" | "matching_game" | "memory_game" | "typing_game";
          score?: number;
          xp_earned?: number;
          accuracy?: number;
          time_seconds?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          game_mode?: "quiz" | "listening_quiz" | "grammar_quiz" | "vocabulary_quiz" | "sentence_builder" | "matching_game" | "memory_game" | "typing_game";
          score?: number;
          xp_earned?: number;
          accuracy?: number;
          time_seconds?: number;
          created_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          user_id: string | null;
          challenge_type: "daily" | "weekly";
          title: string;
          description: string;
          target_count: number;
          current_count: number;
          reward_xp: number;
          is_completed: boolean;
          due_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          challenge_type: "daily" | "weekly";
          title: string;
          description: string;
          target_count?: number;
          current_count?: number;
          reward_xp?: number;
          is_completed?: boolean;
          due_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          challenge_type?: "daily" | "weekly";
          title?: string;
          description?: string;
          target_count?: number;
          current_count?: number;
          reward_xp?: number;
          is_completed?: boolean;
          due_date?: string;
          created_at?: string;
        };
      };
      library_folders: {
        Row: {
          id: string;
          user_id: string | null;
          parent_id: string | null;
          name: string;
          color: string;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          parent_id?: string | null;
          name: string;
          color?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          parent_id?: string | null;
          name?: string;
          color?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      library_collections: {
        Row: {
          id: string;
          user_id: string | null;
          folder_id: string | null;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          folder_id?: string | null;
          name: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          folder_id?: string | null;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      library_items: {
        Row: {
          id: string;
          user_id: string | null;
          folder_id: string | null;
          collection_id: string | null;
          title: string;
          item_type: "document" | "audio" | "video" | "image" | "note";
          file_url: string | null;
          file_size: string;
          content_text: string;
          tags: string[];
          is_favorite: boolean;
          is_trashed: boolean;
          share_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          folder_id?: string | null;
          collection_id?: string | null;
          title: string;
          item_type: "document" | "audio" | "video" | "image" | "note";
          file_url?: string | null;
          file_size?: string;
          content_text?: string;
          tags?: string[];
          is_favorite?: boolean;
          is_trashed?: boolean;
          share_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          folder_id?: string | null;
          collection_id?: string | null;
          title?: string;
          item_type?: "document" | "audio" | "video" | "image" | "note";
          file_url?: string | null;
          file_size?: string;
          content_text?: string;
          tags?: string[];
          is_favorite?: boolean;
          is_trashed?: boolean;
          share_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      library_item_versions: {
        Row: {
          id: string;
          item_id: string;
          version_number: number;
          title: string;
          content_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          version_number?: number;
          title: string;
          content_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          version_number?: number;
          title?: string;
          content_text?: string;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          avatar_url: string;
          bio: string;
          learning_goal_mins: number;
          daily_words_target: number;
          theme: "light" | "dark" | "system";
          interface_language: "vi" | "en" | "ko" | "zh";
          target_languages: string[];
          api_key: string;
          preferred_ai_model: string;
          email_notifications: boolean;
          push_reminders: boolean;
          two_factor_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
          learning_goal_mins?: number;
          daily_words_target?: number;
          theme?: "light" | "dark" | "system";
          interface_language?: "vi" | "en" | "ko" | "zh";
          target_languages?: string[];
          api_key?: string;
          preferred_ai_model?: string;
          email_notifications?: boolean;
          push_reminders?: boolean;
          two_factor_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
          learning_goal_mins?: number;
          daily_words_target?: number;
          theme?: "light" | "dark" | "system";
          interface_language?: "vi" | "en" | "ko" | "zh";
          target_languages?: string[];
          api_key?: string;
          preferred_ai_model?: string;
          email_notifications?: boolean;
          push_reminders?: boolean;
          two_factor_enabled?: boolean;
          updated_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string | null;
          achievement_key: string;
          title: string;
          description: string;
          icon: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          achievement_key: string;
          title: string;
          description: string;
          icon?: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          achievement_key?: string;
          title?: string;
          description?: string;
          icon?: string;
          unlocked_at?: string;
        };
      };
      user_analytics: {
        Row: {
          id: string;
          user_id: string | null;
          study_date: string;
          study_seconds: number;
          words_learned: number;
          cards_reviewed: number;
          ai_messages_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          study_date?: string;
          study_seconds?: number;
          words_learned?: number;
          cards_reviewed?: number;
          ai_messages_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          study_date?: string;
          study_seconds?: number;
          words_learned?: number;
          cards_reviewed?: number;
          ai_messages_count?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

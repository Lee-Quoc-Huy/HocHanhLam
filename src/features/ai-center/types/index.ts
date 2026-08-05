export type AgentType =
  | "vocabulary"
  | "grammar"
  | "teacher"
  | "translation"
  | "flashcard";

export type TargetLanguage = "en" | "ko" | "zh";

export interface AiConversation {
  id: string;
  user_id?: string | null;
  title: string;
  agent_type: AgentType;
  target_language: TargetLanguage;
  created_at: string;
  updated_at: string;
}

export interface AiMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AiCenterFilter {
  agentType: AgentType | "all";
  targetLanguage: TargetLanguage | "all";
  search: string;
}

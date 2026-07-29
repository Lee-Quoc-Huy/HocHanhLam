export type SearchDomain =
  | "all"
  | "vocabulary"
  | "grammar"
  | "conversation"
  | "documents"
  | "flashcards"
  | "quizzes"
  | "collections"
  | "knowledge_graph"
  | "recommendation";

export interface SearchResultItem {
  id: string;
  domain: SearchDomain;
  title: string;
  subtitle?: string;
  snippet: string;
  url?: string;
  similarityScore: number; // 0 to 100 percentage match
  matchType: "semantic_vector" | "keyword_hybrid" | "exact";
  language?: "en" | "ko" | "zh" | "vi";
  metadata?: Record<string, any>;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  domain_filter: string;
  created_at: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: "vocabulary" | "grammar" | "topic" | "document";
  language?: string;
  val: number; // Node size weight
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relation: string; // e.g. 'used_in', 'synonym_of', 'grammar_pattern', 'topic_of'
}

export interface SearchFilter {
  query: string;
  domain: SearchDomain;
  language: "all" | "en" | "ko" | "zh";
  minScore: number; // 0 to 100
}

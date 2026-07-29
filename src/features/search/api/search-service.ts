import { createClient } from "@/lib/supabase/client";
import type {
  SearchResultItem,
  SearchHistoryItem,
  SearchDomain,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
} from "../types";

const STORAGE_SEARCH_HISTORY_KEY = "linguaverse_search_history";

export const SAMPLE_HISTORY: SearchHistoryItem[] = [
  { id: "h1", query: "Serendipity", domain_filter: "vocabulary", created_at: new Date().toISOString() },
  { id: "h2", query: "Used to vs Be used to", domain_filter: "grammar", created_at: new Date().toISOString() },
  { id: "h3", query: "설레다", domain_filter: "vocabulary", created_at: new Date().toISOString() },
  { id: "h4", query: "Climate Resilience", domain_filter: "documents", created_at: new Date().toISOString() },
];

export const SAMPLE_KNOWLEDGE_NODES: KnowledgeGraphNode[] = [
  { id: "n1", label: "Serendipity", type: "vocabulary", language: "en", val: 12 },
  { id: "n2", label: "Used to vs Be used to", type: "grammar", language: "en", val: 10 },
  { id: "n3", label: "설레다", type: "vocabulary", language: "ko", val: 10 },
  { id: "n4", label: "坚持 (jiān chí)", type: "vocabulary", language: "zh", val: 10 },
  { id: "n5", label: "IELTS Speaking & Writing", type: "topic", val: 15 },
  { id: "n6", label: "TOPIK II Exam Prep", type: "topic", val: 14 },
  { id: "n7", label: "HSK 5 Business Article", type: "document", val: 11 },
];

export const SAMPLE_KNOWLEDGE_EDGES: KnowledgeGraphEdge[] = [
  { source: "n1", target: "n5", relation: "IELTS Vocabulary" },
  { source: "n2", target: "n5", relation: "IELTS Grammar" },
  { source: "n3", target: "n6", relation: "TOPIK Verb" },
  { source: "n4", target: "n7", relation: "HSK Business Term" },
];

class SearchService {
  private getLocalHistory(): SearchHistoryItem[] {
    if (typeof window === "undefined") return SAMPLE_HISTORY;
    try {
      const data = localStorage.getItem(STORAGE_SEARCH_HISTORY_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_SEARCH_HISTORY_KEY, JSON.stringify(SAMPLE_HISTORY));
        return SAMPLE_HISTORY;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_HISTORY;
    }
  }

  private setLocalHistory(history: SearchHistoryItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Localstorage error saving search history:", e);
    }
  }

  // Execute Hybrid Semantic Vector & Text Search
  async executeSearch(query: string, domain: SearchDomain = "all", language: string = "all"): Promise<SearchResultItem[]> {
    if (!query.trim()) return [];

    // Save query to history
    this.saveSearchHistory(query, domain);

    const response = await fetch("/api/search/semantic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, domain, language }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Semantic Search API failed: ${err}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  // Autocomplete Suggestions
  async fetchAutocomplete(query: string): Promise<string[]> {
    if (!query.trim()) return [];
    try {
      const response = await fetch("/api/search/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.suggestions || [];
    } catch {
      return [];
    }
  }

  // Fetch Search History
  async fetchSearchHistory(): Promise<SearchHistoryItem[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("search_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        return this.getLocalHistory();
      }

      const history = (data as unknown) as SearchHistoryItem[];
      this.setLocalHistory(history);
      return history;
    } catch {
      return this.getLocalHistory();
    }
  }

  // Save Search History
  async saveSearchHistory(query: string, domainFilter: string = "all"): Promise<SearchHistoryItem> {
    const newEntry: SearchHistoryItem = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `h-${Date.now()}`,
      query: query.trim(),
      domain_filter: domainFilter,
      created_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase.from("search_history").insert([(newEntry as unknown) as any]);
    } catch {
      // Offline fallback
    }

    const history = [newEntry, ...this.getLocalHistory().filter((h) => h.query.toLowerCase() !== query.toLowerCase())].slice(0, 15);
    this.setLocalHistory(history);
    return newEntry;
  }

  // Clear Search History
  async clearSearchHistory(): Promise<boolean> {
    const supabase = createClient();
    try {
      await supabase.from("search_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch {
      // Offline fallback
    }

    this.setLocalHistory([]);
    return true;
  }

  // Fetch Knowledge Graph Data
  getKnowledgeGraphData() {
    return {
      nodes: SAMPLE_KNOWLEDGE_NODES,
      edges: SAMPLE_KNOWLEDGE_EDGES,
    };
  }

  subscribeToRealtime(onUpdate: () => void) {
    const supabase = createClient();
    const channel = supabase
      .channel("public:search_history_all")
      .on("postgres_changes", { event: "*", schema: "public", table: "search_history" }, () => onUpdate())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const searchService = new SearchService();

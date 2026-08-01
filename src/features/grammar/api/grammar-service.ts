import { createClient } from "@/lib/supabase/client";
import type {
  GrammarItem,
  CreateGrammarInput,
  UpdateGrammarInput,
} from "../types";

const LOCAL_STORAGE_KEY = "linguaverse_grammar_items";

// Default initial dataset with rich sample grammar structures for EN, KO, and ZH
export const SAMPLE_GRAMMAR: GrammarItem[] = [
  {
    id: "sample-en-g1",
    language: "en",
    title: "Used to vs. Be used to vs. Get used to",
    meaning: "Đã từng làm (quá khứ) vs Quen với (hiện tại) vs Thích nghi với",
    explanation:
      "1. Used to + V(bare): Thói quen trong quá khứ nay không còn nữa.\n2. Be used to + V-ing/Noun: Đã quen với việc gì ở hiện tại.\n3. Get used to + V-ing/Noun: Quá trình dần dần thích nghi với cái mới.",
    examples: [
      {
        example: "I used to live in London, but now I live in Tokyo.",
        translation: "Tôi đã từng sống ở London, nhưng bây giờ tôi sống ở Tokyo.",
      },
      {
        example: "She is used to waking up early every morning.",
        translation: "Cô ấy đã quen với việc thức dậy sớm mỗi sáng.",
      },
      {
        example: "It took me a month to get used to the hot weather.",
        translation: "Tôi mất một tháng để dần thích nghi với thời tiết nóng bức.",
      },
    ],
    common_mistakes: [
      {
        incorrect: "I am used to get up early.",
        correct: "I am used to getting up early.",
        explanation: "Sau 'be used to' luôn dùng động từ thêm -ing hoặc danh từ, không dùng động từ nguyên mẫu.",
      },
      {
        incorrect: "I use to play football when I was young.",
        correct: "I used to play football when I was young.",
        explanation: "Chỉ thói quen quá khứ phải có chữ 'd' (used to), không dùng 'use to' ở khẳng định.",
      },
    ],
    related_grammar: ["Would for past habits", "Present Continuous for habits"],
    difficulty: "intermediate",
    is_favorite: true,
    category: "Verbs & Tenses",
    ai_explanation: "",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "sample-ko-g1",
    language: "ko",
    title: "N+‌은/는 커녕",
    meaning: "Chẳng những không... mà còn / Đừng nói tới A, ngay cả B cũng không",
    explanation:
      "Dùng khi diễn tả thực tế không đạt được điều mong muốn A, mà ngay cả điều cơ bản hơn B cũng không thể thực hiện được. Thường đi kèm với đuôi phủ định ở vế sau (안, 못, 없 đó).",
    examples: [
      {
        example: "칭찬은 커녕 꾸중만 들었어요.",
        translation: "Chẳng những không được khen mà còn toàn bị mắng.",
      },
      {
        example: "밥은 커녕 물 한 잔도 못 마셨어요.",
        translation: "Đừng nói tới ăn cơm, ngay cả một cốc nước tôi cũng chưa được uống.",
      },
    ],
    common_mistakes: [
      {
        incorrect: "밥은 커녕 밥을 먹었어요.",
        correct: "밥은 커녕 물도 못 마셨어요.",
        explanation: "Vế sau '은/는 커녕' luôn luôn phải là câu phủ định (못/안/없다).",
      },
    ],
    related_grammar: ["V+기는 커녕", "N-은/는 ngụ ý nhấn mạnh phủ định"],
    difficulty: "advanced",
    is_favorite: true,
    category: "TOPIK II Advanced",
    ai_explanation: "",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "sample-zh-g1",
    language: "zh",
    title: "越 A 越 B (yuè A yuè B)",
    meaning: "Càng A càng B",
    explanation:
      "Cấu trúc chỉ sự thay đổi tỉ lệ thuận: khi mức độ của A tăng lên thì mức độ của B cũng tăng theo tương ứng. A và B có thể là động từ hoặc tính từ.",
    examples: [
      {
        example: "汉语越学越有趣。",
        translation: "Tiếng Trung càng học càng thấy thú vị.",
      },
      {
        example: "雨越下越大。",
        translation: "Mưa càng lúc càng to.",
      },
    ],
    common_mistakes: [
      {
        incorrect: "越学非常简单。",
        correct: "越学越简单。",
        explanation: "Cấu trúc phải đi cặp '越 A 越 B', không thay '越' thứ hai bằng '很' hay '非常'.",
      },
    ],
    related_grammar: ["越来越...", "一...就..."],
    difficulty: "intermediate",
    is_favorite: false,
    category: "HSK 3-4 Structures",
    ai_explanation: "",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

class GrammarService {
  private getLocalItems(): GrammarItem[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private setLocalItems(items: GrammarItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist grammar to localStorage:", e);
    }
  }

  async fetchGrammar(): Promise<GrammarItem[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("grammar")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) {
        return this.getLocalItems();
      }

      const items = (data as unknown) as GrammarItem[];
      this.setLocalItems(items);
      return items;
    } catch {
      return this.getLocalItems();
    }
  }

  async createGrammar(input: CreateGrammarInput): Promise<GrammarItem> {
    const newItem: GrammarItem = {
      ...input,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `grammar-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("grammar")
        .insert([(newItem as unknown) as any])
        .select()
        .single();

      if (!error && data) {
        newItem.id = data.id;
      }
    } catch {
      // Offline fallback
    }

    const items = [newItem, ...this.getLocalItems()];
    this.setLocalItems(items);

    return newItem;
  }

  async updateGrammar(id: string, updates: UpdateGrammarInput): Promise<GrammarItem> {
    const localItems = this.getLocalItems();
    const existing = localItems.find((item) => item.id === id);

    if (!existing) {
      throw new Error(`Grammar item with id ${id} not found.`);
    }

    const updatedItem: GrammarItem = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase
        .from("grammar")
        .update((updates as unknown) as any)
        .eq("id", id);
    } catch {
      // Offline fallback
    }

    const updatedItems = localItems.map((item) => (item.id === id ? updatedItem : item));
    this.setLocalItems(updatedItems);

    return updatedItem;
  }

  async deleteGrammar(id: string): Promise<boolean> {
    const supabase = createClient();
    try {
      await supabase.from("grammar").delete().eq("id", id);
    } catch {
      // Ignore
    }

    const items = this.getLocalItems().filter((item) => item.id !== id);
    this.setLocalItems(items);
    return true;
  }

  async toggleFavorite(id: string, currentStatus: boolean): Promise<boolean> {
    const newStatus = !currentStatus;
    await this.updateGrammar(id, { is_favorite: newStatus });
    return newStatus;
  }

  async requestAiExplanation(item: GrammarItem): Promise<string> {
    try {
      const res = await fetch("/api/ai/grammar-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          language: item.language,
          meaning: item.meaning,
          explanation: item.explanation,
          examples: item.examples,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI explanation");

      const explanationMarkdown = data.explanation;
      // Cache explanation on item
      await this.updateGrammar(item.id, { ai_explanation: explanationMarkdown });
      return explanationMarkdown;
    } catch (err) {
      throw err;
    }
  }

  subscribeToRealtime(onRealtimeUpdate: (items: GrammarItem[]) => void) {
    const supabase = createClient();
    const channel = supabase
      .channel("public:grammar")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "grammar" },
        async () => {
          const freshData = await this.fetchGrammar();
          onRealtimeUpdate(freshData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const grammarService = new GrammarService();

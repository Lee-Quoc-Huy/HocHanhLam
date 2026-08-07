import type {
  GrammarItem,
  CreateGrammarInput,
  UpdateGrammarInput,
} from "../types";

/**
 * Grammar data layer — Gọi Server API Route (/api/grammar).
 *
 * Mọi thao tác đều được gửi đến Next.js API route trên server,
 * nơi NEON_DATABASE_URL được truy cập bảo mật và kết nối đến Neon DB.
 */

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
        explanation:
          "Sau 'be used to' luôn dùng động từ thêm -ing hoặc danh từ, không dùng động từ nguyên mẫu.",
      },
      {
        incorrect: "I use to play football when I was young.",
        correct: "I used to play football when I was young.",
        explanation:
          "Chỉ thói quen quá khứ phải có chữ 'd' (used to), không dùng 'use to' ở khẳng định.",
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
    title: "N+\u200b은/는 커녕",
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
        translation:
          "Đừng nói tới ăn cơm, ngay cả một cốc nước tôi cũng chưa được uống.",
      },
    ],
    common_mistakes: [
      {
        incorrect: "밥은 커녕 밥을 먹었어요.",
        correct: "밥은 커녕 물도 못 마셨어요.",
        explanation:
          "Vế sau '은/는 커녕' luôn luôn phải là câu phủ định (못/안/없다).",
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
        explanation:
          "Cấu trúc phải đi cặp '越 A 越 B', không thay '越' thứ hai bằng '很' hay '非常'.",
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
  async fetchGrammar(): Promise<GrammarItem[]> {
    try {
      const res = await fetch("/api/grammar", { cache: "no-store" });
      if (!res.ok) throw new Error("API call failed");
      const items = (await res.json()) as GrammarItem[];
      return items && items.length > 0 ? items : SAMPLE_GRAMMAR;
    } catch {
      return SAMPLE_GRAMMAR;
    }
  }

  async createGrammar(input: CreateGrammarInput): Promise<GrammarItem> {
    const res = await fetch("/api/grammar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Không thể lưu ngữ pháp mới vào Neon DB.");
    }
    return (await res.json()) as GrammarItem;
  }

  async updateGrammar(
    id: string,
    updates: UpdateGrammarInput
  ): Promise<GrammarItem> {
    const res = await fetch(`/api/grammar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Không thể cập nhật ngữ pháp id=${id}.`);
    }
    return (await res.json()) as GrammarItem;
  }

  async deleteGrammar(id: string): Promise<boolean> {
    const res = await fetch(`/api/grammar/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Không thể xoá ngữ pháp id=${id}.`);
    }
    return true;
  }

  async toggleFavorite(id: string, currentStatus: boolean): Promise<boolean> {
    const newStatus = !currentStatus;
    await this.updateGrammar(id, { is_favorite: newStatus });
    return newStatus;
  }

  async requestAiExplanation(item: GrammarItem): Promise<string> {
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
    await this.updateGrammar(item.id, { ai_explanation: explanationMarkdown });
    return explanationMarkdown;
  }

  subscribeToRealtime(onRealtimeUpdate: (items: GrammarItem[]) => void) {
    return () => {};
  }
}

export const grammarService = new GrammarService();

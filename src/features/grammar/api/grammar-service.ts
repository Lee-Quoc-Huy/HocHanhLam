import { queryNeon, isNeonConfigured } from "@/lib/neon/client";
import { createClient } from "@/lib/supabase/client";
import type {
  GrammarItem,
  CreateGrammarInput,
  UpdateGrammarInput,
} from "../types";

/**
 * Grammar data layer — Hỗ trợ kết hợp Neon DB và Supabase fallback.
 *
 * - Nếu NEON_DATABASE_URL được cấu hình: Dùng Neon DB làm nguồn dữ liệu chính.
 * - Nếu chưa có NEON_DATABASE_URL: Tự động dùng Supabase để trang web không bị lỗi.
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
    if (isNeonConfigured()) {
      try {
        const rows = await queryNeon<any>(
          `SELECT * FROM grammar ORDER BY created_at DESC`
        );
        if (rows && rows.length > 0) {
          return rows.map(this.parseRow);
        }
      } catch (err) {
        console.warn("[GrammarService] Neon fetch failed, trying Supabase fallback:", err);
      }
    }

    // Supabase fallback
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("grammar")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as unknown as GrammarItem[];
      }
    } catch {}

    return SAMPLE_GRAMMAR;
  }

  async createGrammar(input: CreateGrammarInput): Promise<GrammarItem> {
    if (isNeonConfigured()) {
      try {
        const rows = await queryNeon<any>(
          `INSERT INTO grammar (
            user_id, language, title, meaning, explanation, examples,
            common_mistakes, related_grammar, difficulty, is_favorite,
            category, ai_explanation
          ) VALUES (
            $1, $2, $3, $4, $5, $6::jsonb,
            $7::jsonb, $8, $9, $10,
            $11, $12
          ) RETURNING *`,
          [
            input.user_id ?? null,
            input.language ?? "en",
            input.title ?? "",
            input.meaning ?? "",
            input.explanation ?? "",
            JSON.stringify(input.examples ?? []),
            JSON.stringify(input.common_mistakes ?? []),
            input.related_grammar ?? [],
            input.difficulty ?? "intermediate",
            input.is_favorite ?? false,
            input.category ?? "General",
            input.ai_explanation ?? "",
          ]
        );

        if (rows[0]) return this.parseRow(rows[0]);
      } catch (err) {
        console.warn("[GrammarService] Neon create failed, trying Supabase fallback:", err);
      }
    }

    // Supabase fallback
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
        return data as unknown as GrammarItem;
      }
    } catch {}

    return newItem;
  }

  async updateGrammar(
    id: string,
    updates: UpdateGrammarInput
  ): Promise<GrammarItem> {
    if (isNeonConfigured()) {
      try {
        const fields = Object.keys(updates).filter((k) => k !== "id");
        if (fields.length === 0) {
          const existing = await queryNeon<any>(
            `SELECT * FROM grammar WHERE id = $1`,
            [id]
          );
          if (existing[0]) return this.parseRow(existing[0]);
        } else {
          const jsonbFields = new Set(["examples", "common_mistakes"]);
          const setClauses = fields
            .map((field, idx) =>
              jsonbFields.has(field)
                ? `${field} = $${idx + 1}::jsonb`
                : `${field} = $${idx + 1}`
            )
            .join(", ");

          const values = fields.map((f) => {
            const val = (updates as any)[f];
            return jsonbFields.has(f) ? JSON.stringify(val) : val;
          });
          values.push(new Date().toISOString());
          values.push(id);

          const rows = await queryNeon<any>(
            `UPDATE grammar SET ${setClauses}, updated_at = $${fields.length + 1}
             WHERE id = $${fields.length + 2} RETURNING *`,
            values
          );

          if (rows[0]) return this.parseRow(rows[0]);
        }
      } catch (err) {
        console.warn("[GrammarService] Neon update failed, trying Supabase fallback:", err);
      }
    }

    // Supabase fallback
    const supabase = createClient();
    const { data, error } = await supabase
      .from("grammar")
      .update((updates as unknown) as any)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Không thể cập nhật ngữ pháp: ${error?.message ?? "lỗi không xác định"}`);
    }
    return data as unknown as GrammarItem;
  }

  async deleteGrammar(id: string): Promise<boolean> {
    if (isNeonConfigured()) {
      try {
        await queryNeon(`DELETE FROM grammar WHERE id = $1`, [id]);
        return true;
      } catch (err) {
        console.warn("[GrammarService] Neon delete failed, trying Supabase fallback:", err);
      }
    }

    // Supabase fallback
    const supabase = createClient();
    try {
      await supabase.from("grammar").delete().eq("id", id);
    } catch {}
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
    if (!isNeonConfigured()) {
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
    return () => {};
  }

  private parseRow(row: any): GrammarItem {
    if (!row) return row;
    return {
      ...row,
      examples:
        typeof row.examples === "string"
          ? JSON.parse(row.examples)
          : row.examples ?? [],
      common_mistakes:
        typeof row.common_mistakes === "string"
          ? JSON.parse(row.common_mistakes)
          : row.common_mistakes ?? [],
      related_grammar: row.related_grammar ?? [],
    };
  }
}

export const grammarService = new GrammarService();

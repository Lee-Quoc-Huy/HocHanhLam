import { queryNeon, isNeonConfigured } from "@/lib/neon/client";
import { createClient } from "@/lib/supabase/client";
import type {
  VocabularyItem,
  CreateVocabularyInput,
  UpdateVocabularyInput,
} from "../types";

/**
 * Vocabulary data layer — Hỗ trợ kết hợp Neon DB và Supabase fallback.
 *
 * - Nếu NEON_DATABASE_URL được cấu hình: Dùng Neon DB làm nguồn dữ liệu chính.
 * - Nếu chưa có NEON_DATABASE_URL: Tự động dùng Supabase để trang web không bị lỗi.
 */

class VocabularyService {
  async fetchVocabulary(): Promise<VocabularyItem[]> {
    if (isNeonConfigured()) {
      try {
        const rows = await queryNeon<VocabularyItem>(
          `SELECT * FROM vocabulary ORDER BY created_at DESC`
        );
        return rows;
      } catch (err) {
        console.warn("[VocabularyService] Lỗi Neon DB, thử dùng Supabase fallback:", err);
      }
    }

    // Supabase fallback
    const supabase = createClient();
    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Không thể tải danh sách từ vựng: ${error.message}`);
    }
    return (data ?? []) as VocabularyItem[];
  }

  async createWord(input: CreateVocabularyInput): Promise<VocabularyItem> {
    if (isNeonConfigured()) {
      try {
        const rows = await queryNeon<VocabularyItem>(
          `INSERT INTO vocabulary (
            user_id, language, word, ipa, vietnamese, english_meaning,
            part_of_speech, example, example_translation, audio_url, image_url,
            synonyms, antonyms, frequency, difficulty, is_favorite, collection
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11,
            $12, $13, $14, $15, $16, $17
          ) RETURNING *`,
          [
            input.user_id ?? null,
            input.language ?? "en",
            input.word ?? "",
            input.ipa ?? "",
            input.vietnamese ?? "",
            input.english_meaning ?? "",
            input.part_of_speech ?? "noun",
            input.example ?? "",
            input.example_translation ?? "",
            input.audio_url ?? "",
            input.image_url ?? "",
            input.synonyms ?? [],
            input.antonyms ?? [],
            input.frequency ?? 3,
            input.difficulty ?? "intermediate",
            input.is_favorite ?? false,
            input.collection ?? "General",
          ]
        );

        if (rows[0]) return rows[0];
      } catch (err) {
        console.warn("[VocabularyService] Neon create failed, trying Supabase fallback:", err);
      }
    }

    // Supabase fallback
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("vocabulary")
      .insert([{ ...input, user_id: input.user_id ?? user?.id ?? null }])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Không thể lưu từ vựng mới: ${error?.message ?? "lỗi không xác định"}`);
    }
    return data as VocabularyItem;
  }

  async updateWord(
    id: string,
    updates: UpdateVocabularyInput
  ): Promise<VocabularyItem> {
    if (isNeonConfigured()) {
      try {
        const fields = Object.keys(updates).filter((k) => k !== "id");
        if (fields.length === 0) {
          const existing = await queryNeon<VocabularyItem>(
            `SELECT * FROM vocabulary WHERE id = $1`,
            [id]
          );
          if (existing[0]) return existing[0];
        } else {
          const setClauses = fields
            .map((field, idx) => `${field} = $${idx + 1}`)
            .join(", ");
          const values = fields.map((f) => (updates as any)[f]);
          values.push(new Date().toISOString());
          values.push(id);

          const rows = await queryNeon<VocabularyItem>(
            `UPDATE vocabulary SET ${setClauses}, updated_at = $${fields.length + 1}
             WHERE id = $${fields.length + 2} RETURNING *`,
            values
          );

          if (rows[0]) return rows[0];
        }
      } catch (err) {
        console.warn("[VocabularyService] Neon update failed, trying Supabase fallback:", err);
      }
    }

    // Supabase fallback
    const supabase = createClient();
    const { data, error } = await supabase
      .from("vocabulary")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Không thể cập nhật từ vựng: ${error?.message ?? "lỗi không xác định"}`);
    }
    return data as VocabularyItem;
  }

  async deleteWord(id: string): Promise<boolean> {
    if (isNeonConfigured()) {
      try {
        await queryNeon(`DELETE FROM vocabulary WHERE id = $1`, [id]);
        return true;
      } catch (err) {
        console.warn("[VocabularyService] Neon delete failed, trying Supabase fallback:", err);
      }
    }

    // Supabase fallback
    const supabase = createClient();
    const { error } = await supabase.from("vocabulary").delete().eq("id", id);
    if (error) {
      throw new Error(`Không thể xoá từ vựng: ${error.message}`);
    }
    return true;
  }

  async toggleFavorite(id: string, currentStatus: boolean): Promise<boolean> {
    const newStatus = !currentStatus;
    await this.updateWord(id, { is_favorite: newStatus });
    return newStatus;
  }

  subscribeToRealtime(onRealtimeUpdate: (items: VocabularyItem[]) => void) {
    if (!isNeonConfigured()) {
      const supabase = createClient();
      const channel = supabase
        .channel("public:vocabulary")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "vocabulary" },
          async () => {
            try {
              const freshData = await this.fetchVocabulary();
              onRealtimeUpdate(freshData);
            } catch {}
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    return () => {};
  }
}

export const vocabularyService = new VocabularyService();

import { queryNeon } from "@/lib/neon/client";
import type {
  VocabularyItem,
  CreateVocabularyInput,
  UpdateVocabularyInput,
} from "../types";

/**
 * Vocabulary data layer — Neon DB là nguồn dữ liệu duy nhất.
 *
 * Supabase không còn được dùng cho vocabulary nữa.
 * Tất cả đọc/ghi đều thông qua Neon PostgreSQL serverless.
 */

class VocabularyService {
  async fetchVocabulary(): Promise<VocabularyItem[]> {
    const rows = await queryNeon<VocabularyItem>(
      `SELECT * FROM vocabulary ORDER BY created_at DESC`
    );
    return rows;
  }

  async createWord(input: CreateVocabularyInput): Promise<VocabularyItem> {
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

    if (!rows[0]) {
      throw new Error("Không thể lưu từ vựng mới vào Neon DB.");
    }
    return rows[0];
  }

  async updateWord(
    id: string,
    updates: UpdateVocabularyInput
  ): Promise<VocabularyItem> {
    // Build dynamic SET clause
    const fields = Object.keys(updates).filter((k) => k !== "id");
    if (fields.length === 0) {
      const existing = await queryNeon<VocabularyItem>(
        `SELECT * FROM vocabulary WHERE id = $1`,
        [id]
      );
      if (!existing[0]) throw new Error(`Không tìm thấy từ vựng id=${id}.`);
      return existing[0];
    }

    const setClauses = fields
      .map((field, idx) => `${field} = $${idx + 1}`)
      .join(", ");
    const values = fields.map((f) => (updates as any)[f]);
    values.push(new Date().toISOString()); // updated_at
    values.push(id); // WHERE id

    const rows = await queryNeon<VocabularyItem>(
      `UPDATE vocabulary SET ${setClauses}, updated_at = $${fields.length + 1}
       WHERE id = $${fields.length + 2} RETURNING *`,
      values
    );

    if (!rows[0]) {
      throw new Error(`Không tìm thấy từ vựng id=${id} để cập nhật.`);
    }
    return rows[0];
  }

  async deleteWord(id: string): Promise<boolean> {
    await queryNeon(`DELETE FROM vocabulary WHERE id = $1`, [id]);
    return true;
  }

  async toggleFavorite(id: string, currentStatus: boolean): Promise<boolean> {
    const newStatus = !currentStatus;
    await this.updateWord(id, { is_favorite: newStatus });
    return newStatus;
  }

  /**
   * Realtime không được hỗ trợ trực tiếp trên Neon.
   * Trả về một unsubscribe no-op để giữ tương thích với code cũ.
   */
  subscribeToRealtime(onRealtimeUpdate: (items: VocabularyItem[]) => void) {
    // Neon không có realtime subscription như Supabase.
    // Polling hoặc refetch sau mỗi mutation thay thế.
    return () => {};
  }
}

export const vocabularyService = new VocabularyService();

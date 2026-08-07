import { queryNeon } from "@/lib/neon/client";
import type {
  VocabularyItem,
  CreateVocabularyInput,
  UpdateVocabularyInput,
} from "../types";

/**
 * Vocabulary data layer — 100% Độc lập trên Neon DB.
 * Supabase KHÔNG còn liên quan hay bị ảnh hưởng bởi Từ vựng nữa.
 */

let tableChecked = false;

async function ensureTableExists() {
  if (tableChecked) return;
  try {
    await queryNeon(`
      CREATE TABLE IF NOT EXISTS vocabulary (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        language TEXT NOT NULL DEFAULT 'en',
        word TEXT NOT NULL,
        ipa TEXT NOT NULL DEFAULT '',
        vietnamese TEXT NOT NULL DEFAULT '',
        english_meaning TEXT NOT NULL DEFAULT '',
        part_of_speech TEXT NOT NULL DEFAULT 'noun',
        example TEXT NOT NULL DEFAULT '',
        example_translation TEXT NOT NULL DEFAULT '',
        audio_url TEXT NOT NULL DEFAULT '',
        image_url TEXT NOT NULL DEFAULT '',
        synonyms TEXT[] NOT NULL DEFAULT '{}',
        antonyms TEXT[] NOT NULL DEFAULT '{}',
        frequency INTEGER NOT NULL DEFAULT 3,
        difficulty TEXT NOT NULL DEFAULT 'intermediate',
        is_favorite BOOLEAN NOT NULL DEFAULT false,
        collection TEXT NOT NULL DEFAULT 'General',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    tableChecked = true;
  } catch (err) {
    console.error("[VocabularyService] Lỗi tạo bảng Neon:", err);
  }
}

class VocabularyService {
  async fetchVocabulary(): Promise<VocabularyItem[]> {
    await ensureTableExists();
    const rows = await queryNeon<VocabularyItem>(
      `SELECT * FROM vocabulary ORDER BY created_at DESC`
    );
    return rows ?? [];
  }

  async createWord(input: CreateVocabularyInput): Promise<VocabularyItem> {
    await ensureTableExists();
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
    await ensureTableExists();
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
    values.push(new Date().toISOString());
    values.push(id);

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
    await ensureTableExists();
    await queryNeon(`DELETE FROM vocabulary WHERE id = $1`, [id]);
    return true;
  }

  async toggleFavorite(id: string, currentStatus: boolean): Promise<boolean> {
    const newStatus = !currentStatus;
    await this.updateWord(id, { is_favorite: newStatus });
    return newStatus;
  }

  subscribeToRealtime(onRealtimeUpdate: (items: VocabularyItem[]) => void) {
    return () => {};
  }
}

export const vocabularyService = new VocabularyService();

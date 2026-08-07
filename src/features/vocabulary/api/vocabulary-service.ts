import type {
  VocabularyItem,
  CreateVocabularyInput,
  UpdateVocabularyInput,
} from "../types";

/**
 * Vocabulary data layer — Gọi Server API Route (/api/vocabulary).
 *
 * Mọi thao tác đều được gửi đến Next.js API route trên server,
 * nơi NEON_DATABASE_URL được truy cập bảo mật và kết nối đến Neon DB.
 */

class VocabularyService {
  async fetchVocabulary(): Promise<VocabularyItem[]> {
    const res = await fetch("/api/vocabulary", { cache: "no-store" });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Không thể tải danh sách từ vựng từ Neon DB.");
    }
    return (await res.json()) as VocabularyItem[];
  }

  async createWord(input: CreateVocabularyInput): Promise<VocabularyItem> {
    const res = await fetch("/api/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Không thể lưu từ vựng mới vào Neon DB.");
    }
    return (await res.json()) as VocabularyItem;
  }

  async updateWord(
    id: string,
    updates: UpdateVocabularyInput
  ): Promise<VocabularyItem> {
    const res = await fetch(`/api/vocabulary/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Không thể cập nhật từ vựng id=${id}.`);
    }
    return (await res.json()) as VocabularyItem;
  }

  async deleteWord(id: string): Promise<boolean> {
    const res = await fetch(`/api/vocabulary/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Không thể xoá từ vựng id=${id}.`);
    }
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

import { createClient } from "@/lib/supabase/client";
import type {
  VocabularyItem,
  CreateVocabularyInput,
  UpdateVocabularyInput,
} from "../types";

/**
 * Vocabulary data layer — Supabase is the single source of truth.
 *
 * Historically this service fell back to `localStorage` whenever Supabase
 * returned zero rows or an error, and every write silently mirrored into
 * localStorage regardless of whether the Supabase call actually succeeded.
 * That meant each browser/device kept its own private copy: deleting a word
 * on mobile only ever touched that phone's local cache, so it kept
 * reappearing on desktop. Supabase already has the `vocabulary` table with
 * an open RLS policy and realtime enabled (see
 * supabase/migrations/00000000000002_vocabulary_module.sql) — so all reads
 * and writes now go straight through it, and every device fetches the same
 * rows and receives realtime updates when another device changes them.
 *
 * A brand-new account simply starts with zero words — no sample/demo data
 * is auto-inserted. Anything shown in the vocabulary list is data the
 * person actually created themselves.
 */

class VocabularyService {
  async fetchVocabulary(): Promise<VocabularyItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Không thể tải danh sách từ vựng: ${error.message}`);
    }

    // A genuinely empty account just shows an empty list now — this used to
    // auto-insert a starter set of sample words the first time, which meant
    // "existing" vocabulary would appear that the person never actually added.
    return (data ?? []) as VocabularyItem[];
  }

  async createWord(input: CreateVocabularyInput): Promise<VocabularyItem> {
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

  async updateWord(id: string, updates: UpdateVocabularyInput): Promise<VocabularyItem> {
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
          } catch {
            // Realtime refresh failed silently — next successful fetch will resync.
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const vocabularyService = new VocabularyService();

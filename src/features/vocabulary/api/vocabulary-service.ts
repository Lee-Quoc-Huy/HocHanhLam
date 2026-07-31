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
 * A one-time, per-browser flag (`SEED_FLAG_KEY`) still seeds a starter
 * dataset into Supabase the very first time an account has zero words, so
 * new users don't land on a totally empty page — but after that the account
 * is free to go to zero words (e.g. after deleting everything) without ever
 * being silently refilled again.
 */

const SEED_FLAG_KEY = "hhl_vocabulary_seeded_v1";

type SampleSeed = Omit<VocabularyItem, "id" | "created_at" | "updated_at" | "user_id">;

const SAMPLE_VOCABULARY: SampleSeed[] = [
  {
    language: "en",
    word: "Serendipity",
    ipa: "/ˌser.ənˈdɪp.ə.ti/",
    vietnamese: "Sự tình cờ may mắn",
    english_meaning: "The occurrence of events by chance in a happy or beneficial way.",
    part_of_speech: "noun",
    example: "We found this charming cafe by pure serendipity.",
    example_translation: "Chúng tôi tìm thấy quán cà phê xinh đẹp này nhờ sự tình cờ may mắn.",
    audio_url: "",
    image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    synonyms: ["coincidence", "fluke", "fortuity"],
    antonyms: ["misfortune", "design"],
    frequency: 4,
    difficulty: "advanced",
    is_favorite: true,
    collection: "IELTS Academic",
  },
  {
    language: "ko",
    word: "설레다",
    ipa: "seol-le-da",
    vietnamese: "Hồi hộp, xao xuyến (với niềm vui)",
    english_meaning: "To feel fluttered, excited, or restless with joyful anticipation.",
    part_of_speech: "verb",
    example: "내일 여행을 가려고 하니까 마음이 설렌다.",
    example_translation: "Vì ngày mai đi du lịch nên lòng tôi thấy rất hồi hộp, xao xuyến.",
    audio_url: "",
    image_url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80",
    synonyms: ["두근거리다", "기대되다"],
    antonyms: ["덤덤하다"],
    frequency: 5,
    difficulty: "intermediate",
    is_favorite: true,
    collection: "TOPIK II",
  },
  {
    language: "zh",
    word: "坚持",
    ipa: "jiān chí",
    vietnamese: "Kiên trì, giữ vững",
    english_meaning: "To persevere, insist on, or persist in doing something.",
    part_of_speech: "verb",
    example: "只要坚持下去，就一定能成功。",
    example_translation: "Chỉ cần kiên trì tiếp tục, nhất định sẽ thành công.",
    audio_url: "",
    image_url: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=600&q=80",
    synonyms: ["恒心", "坚守"],
    antonyms: ["放弃", "半途而废"],
    frequency: 5,
    difficulty: "intermediate",
    is_favorite: false,
    collection: "HSK 4",
  },
  {
    language: "en",
    word: "Resilient",
    ipa: "/rɪˈzɪl.jənt/",
    vietnamese: "Kiên cường, khôi phục nhanh",
    english_meaning: "Able to withstand or recover quickly from difficult conditions.",
    part_of_speech: "adjective",
    example: "She is a resilient person who never gives up in face of failure.",
    example_translation: "Cô ấy là một người kiên cường, không bao giờ bỏ cuộc trước thất bại.",
    audio_url: "",
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    synonyms: ["tough", "strong", "adaptable"],
    antonyms: ["fragile", "vulnerable"],
    frequency: 4,
    difficulty: "intermediate",
    is_favorite: false,
    collection: "Daily Communication",
  },
];

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

    const items = (data ?? []) as VocabularyItem[];

    // First-ever load with an empty account: seed a small starter set once,
    // on Supabase directly (shared across devices), then never again.
    const alreadySeeded =
      typeof window !== "undefined" && window.localStorage.getItem(SEED_FLAG_KEY);

    if (items.length === 0 && !alreadySeeded) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SEED_FLAG_KEY, "1");
      }
      return this.seedSampleVocabulary();
    }

    return items;
  }

  private async seedSampleVocabulary(): Promise<VocabularyItem[]> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rows = SAMPLE_VOCABULARY.map((item) => ({ ...item, user_id: user?.id ?? null }));
    const { data, error } = await supabase.from("vocabulary").insert(rows).select();

    if (error || !data) {
      // Seeding failed (e.g. offline) — don't block the page, just show empty.
      return [];
    }
    return data as VocabularyItem[];
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

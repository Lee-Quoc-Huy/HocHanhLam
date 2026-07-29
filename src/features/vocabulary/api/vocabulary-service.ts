import { createClient } from "@/lib/supabase/client";
import type {
  VocabularyItem,
  CreateVocabularyInput,
  UpdateVocabularyInput,
} from "../types";

const LOCAL_STORAGE_KEY = "linguaverse_vocabulary_items";

// Default initial dataset to ensure user has rich initial vocabulary for EN, KO, ZH
export const SAMPLE_VOCABULARY: VocabularyItem[] = [
  {
    id: "sample-en-1",
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
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "sample-ko-1",
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
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "sample-zh-1",
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
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "sample-en-2",
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class VocabularyService {
  private getLocalItems(): VocabularyItem[] {
    if (typeof window === "undefined") return SAMPLE_VOCABULARY;
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SAMPLE_VOCABULARY));
        return SAMPLE_VOCABULARY;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_VOCABULARY;
    }
  }

  private setLocalItems(items: VocabularyItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist vocabulary to localStorage:", e);
    }
  }

  async fetchVocabulary(): Promise<VocabularyItem[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("vocabulary")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return this.getLocalItems();
      }

      const items = data as VocabularyItem[];
      this.setLocalItems(items);
      return items;
    } catch {
      return this.getLocalItems();
    }
  }

  async createWord(input: CreateVocabularyInput): Promise<VocabularyItem> {
    const newItem: VocabularyItem = {
      ...input,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `vocab-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("vocabulary")
        .insert([newItem])
        .select()
        .single();

      if (!error && data) {
        newItem.id = data.id;
      }
    } catch {
      // Supabase unavailable, saved locally
    }

    // Always update local cache for instant UI availability
    const items = [newItem, ...this.getLocalItems()];
    this.setLocalItems(items);

    return newItem;
  }

  async updateWord(id: string, updates: UpdateVocabularyInput): Promise<VocabularyItem> {
    const localItems = this.getLocalItems();
    const existing = localItems.find((item) => item.id === id);

    if (!existing) {
      throw new Error(`Vocabulary item with id ${id} not found.`);
    }

    const updatedItem: VocabularyItem = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase
        .from("vocabulary")
        .update(updates)
        .eq("id", id);
    } catch {
      // Ignore Supabase error in fallback mode
    }

    const updatedItems = localItems.map((item) => (item.id === id ? updatedItem : item));
    this.setLocalItems(updatedItems);

    return updatedItem;
  }

  async deleteWord(id: string): Promise<boolean> {
    const supabase = createClient();
    try {
      await supabase.from("vocabulary").delete().eq("id", id);
    } catch {
      // Ignore
    }

    const items = this.getLocalItems().filter((item) => item.id !== id);
    this.setLocalItems(items);
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
          const freshData = await this.fetchVocabulary();
          onRealtimeUpdate(freshData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const vocabularyService = new VocabularyService();

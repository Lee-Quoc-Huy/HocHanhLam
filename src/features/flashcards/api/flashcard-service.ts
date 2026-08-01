import { createClient } from "@/lib/supabase/client";
import type {
  Flashcard,
  FlashcardCollection,
  FlashcardFolder,
  CreateFlashcardInput,
  UpdateFlashcardInput,
} from "../types";
import { calculateSM2, SRSRating } from "../lib/srs-algorithm";

const STORAGE_CARDS_KEY = "linguaverse_flashcards";
const STORAGE_DECKS_KEY = "linguaverse_flashcard_collections";
const STORAGE_FOLDERS_KEY = "linguaverse_flashcard_folders";

// Default Initial Folders
export const SAMPLE_FOLDERS: FlashcardFolder[] = [
  {
    id: "folder-1",
    name: "IELTS & English Mastery",
    description: "Academic & General English vocabulary and structures",
    color: "blue",
    icon: "GraduationCap",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "folder-2",
    name: "TOPIK Korean Exam",
    description: "TOPIK I & II essential Korean vocabulary & grammar",
    color: "pink",
    icon: "Languages",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "folder-3",
    name: "HSK Chinese Proficiency",
    description: "HSK 1-6 Chinese characters, pinyin, and expressions",
    color: "red",
    icon: "BookOpen",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Default Initial Decks (Collections)
export const SAMPLE_COLLECTIONS: FlashcardCollection[] = [
  {
    id: "deck-en-1",
    folder_id: "folder-1",
    name: "IELTS Band 8+ Academic Words",
    description: "High-frequency academic vocabulary for IELTS Writing & Speaking",
    language: "en",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "deck-ko-1",
    folder_id: "folder-2",
    name: "TOPIK II Essential Verbs",
    description: "Key Korean action and descriptive verbs for TOPIK II",
    language: "ko",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "deck-zh-1",
    folder_id: "folder-3",
    name: "HSK 4 Core Vocabulary",
    description: "600 essential HSK 4 words with pinyin and examples",
    language: "zh",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Default Initial Flashcards
export const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-en-1",
    collection_id: "deck-en-1",
    language: "en",
    front_text: "Serendipity",
    front_subtext: "/ˌser.ənˈdɪp.ə.ti/",
    back_text: "Sự tình cờ may mắn",
    back_explanation: "Finding valuable or agreeable things not sought for.",
    tags: ["IELTS", "Noun"],
    is_favorite: true,
    repetition: 1,
    interval: 1,
    ease_factor: 2.5,
    status: "learning",
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fc-ko-1",
    collection_id: "deck-ko-1",
    language: "ko",
    front_text: "설레다",
    front_subtext: "seol-le-da",
    back_text: "Hồi hộp, xao xuyến (với niềm vui)",
    back_explanation: "내일 여행을 가려고 하니까 마음이 설렌다.",
    tags: ["TOPIK II", "Verb"],
    is_favorite: true,
    repetition: 0,
    interval: 0,
    ease_factor: 2.5,
    status: "new",
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fc-zh-1",
    collection_id: "deck-zh-1",
    language: "zh",
    front_text: "坚持",
    front_subtext: "jiān chí",
    back_text: "Kiên trì, giữ vững",
    back_explanation: "只要坚持下去，就一定能成功。",
    tags: ["HSK 4", "Verb"],
    is_favorite: false,
    repetition: 2,
    interval: 6,
    ease_factor: 2.6,
    status: "learning",
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fc-en-2",
    collection_id: "deck-en-1",
    language: "en",
    front_text: "Resilient",
    front_subtext: "/rɪˈzɪl.jənt/",
    back_text: "Kiên cường, khôi phục nhanh",
    back_explanation: "Able to withstand or recover quickly from difficult conditions.",
    tags: ["Adjective", "Daily"],
    is_favorite: false,
    repetition: 0,
    interval: 0,
    ease_factor: 2.5,
    status: "new",
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class FlashcardService {
  private getLocalCards(): Flashcard[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_CARDS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private setLocalCards(cards: Flashcard[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(cards));
    } catch (e) {
      console.error("Failed to save flashcards to localStorage:", e);
    }
  }

  private getLocalCollections(): FlashcardCollection[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_DECKS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private setLocalCollections(collections: FlashcardCollection[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_DECKS_KEY, JSON.stringify(collections));
    } catch (e) {
      console.error("Failed to save collections to localStorage:", e);
    }
  }

  private getLocalFolders(): FlashcardFolder[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_FOLDERS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private setLocalFolders(folders: FlashcardFolder[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(folders));
    } catch (e) {
      console.error("Failed to save folders to localStorage:", e);
    }
  }

  // Fetch all flashcards
  async fetchFlashcards(): Promise<Flashcard[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) {
        return this.getLocalCards();
      }

      const cards = (data as unknown) as Flashcard[];
      this.setLocalCards(cards);
      return cards;
    } catch {
      return this.getLocalCards();
    }
  }

  // Fetch Collections (Decks)
  async fetchCollections(): Promise<FlashcardCollection[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("flashcard_collections").select("*");
      if (error || !data) {
        return this.getLocalCollections();
      }
      const collections = (data as unknown) as FlashcardCollection[];
      this.setLocalCollections(collections);
      return collections;
    } catch {
      return this.getLocalCollections();
    }
  }

  // Fetch Folders
  async fetchFolders(): Promise<FlashcardFolder[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("flashcard_folders").select("*");
      if (error || !data) {
        return this.getLocalFolders();
      }
      const folders = (data as unknown) as FlashcardFolder[];
      this.setLocalFolders(folders);
      return folders;
    } catch {
      return this.getLocalFolders();
    }
  }

  // Create Flashcard
  async createFlashcard(input: CreateFlashcardInput): Promise<Flashcard> {
    const newCard: Flashcard = {
      ...input,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `fc-${Date.now()}`,
      repetition: 0,
      interval: 0,
      ease_factor: 2.5,
      status: "new",
      due_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .insert([(newCard as unknown) as any])
        .select()
        .single();
      if (!error && data) newCard.id = data.id;
    } catch {
      // Offline fallback
    }

    const cards = [newCard, ...this.getLocalCards()];
    this.setLocalCards(cards);
    return newCard;
  }

  // Review Flashcard with SM-2 Rating
  async processReview(cardId: string, rating: SRSRating): Promise<Flashcard> {
    const cards = this.getLocalCards();
    const existing = cards.find((c) => c.id === cardId);
    if (!existing) throw new Error(`Flashcard ${cardId} not found.`);

    const srsResult = calculateSM2(
      rating,
      existing.repetition,
      existing.interval,
      existing.ease_factor
    );

    const updatedCard: Flashcard = {
      ...existing,
      repetition: srsResult.repetition,
      interval: srsResult.interval,
      ease_factor: srsResult.easeFactor,
      status: srsResult.status,
      due_date: srsResult.dueDate,
      last_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase.from("flashcards").update({
        repetition: updatedCard.repetition,
        interval: updatedCard.interval,
        ease_factor: updatedCard.ease_factor,
        status: updatedCard.status,
        due_date: updatedCard.due_date,
        last_reviewed_at: updatedCard.last_reviewed_at,
      }).eq("id", cardId);

      // Log SRS review event
      await supabase.from("srs_logs").insert([{
        flashcard_id: cardId,
        rating,
        interval: updatedCard.interval,
        ease_factor: updatedCard.ease_factor,
      }]);
    } catch {
      // Offline fallback
    }

    const updatedCards = cards.map((c) => (c.id === cardId ? updatedCard : c));
    this.setLocalCards(updatedCards);

    return updatedCard;
  }

  // Update Flashcard
  async updateFlashcard(id: string, updates: UpdateFlashcardInput): Promise<Flashcard> {
    const cards = this.getLocalCards();
    const existing = cards.find((c) => c.id === id);
    if (!existing) throw new Error(`Flashcard ${id} not found.`);

    const updatedCard: Flashcard = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase.from("flashcards").update((updates as unknown) as any).eq("id", id);
    } catch {
      // Offline fallback
    }

    const updatedCards = cards.map((c) => (c.id === id ? updatedCard : c));
    this.setLocalCards(updatedCards);
    return updatedCard;
  }

  // Delete Flashcard
  async deleteFlashcard(id: string): Promise<boolean> {
    const supabase = createClient();
    try {
      await supabase.from("flashcards").delete().eq("id", id);
    } catch {
      // Offline fallback
    }

    const cards = this.getLocalCards().filter((c) => c.id !== id);
    this.setLocalCards(cards);
    return true;
  }

  // Create Collection (Deck)
  async createCollection(name: string, description: string, language: any, folderId?: string): Promise<FlashcardCollection> {
    const newCollection: FlashcardCollection = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `deck-${Date.now()}`,
      folder_id: folderId || null,
      name,
      description,
      language,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase.from("flashcard_collections").insert([(newCollection as unknown) as any]);
    } catch {
      // Offline fallback
    }

    const collections = [newCollection, ...this.getLocalCollections()];
    this.setLocalCollections(collections);
    return newCollection;
  }

  // Create Folder
  async createFolder(name: string, description: string, color = "indigo", icon = "Folder"): Promise<FlashcardFolder> {
    const newFolder: FlashcardFolder = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `folder-${Date.now()}`,
      name,
      description,
      color,
      icon,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase.from("flashcard_folders").insert([(newFolder as unknown) as any]);
    } catch {
      // Offline fallback
    }

    const folders = [newFolder, ...this.getLocalFolders()];
    this.setLocalFolders(folders);
    return newFolder;
  }

  subscribeToRealtime(onRealtimeUpdate: () => void) {
    const supabase = createClient();
    const channel = supabase
      .channel("public:flashcards_all")
      .on("postgres_changes", { event: "*", schema: "public", table: "flashcards" }, () => {
        onRealtimeUpdate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const flashcardService = new FlashcardService();

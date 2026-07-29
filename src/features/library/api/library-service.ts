import { createClient } from "@/lib/supabase/client";
import type {
  LibraryItem,
  LibraryFolder,
  LibraryCollection,
  ItemVersion,
  CreateItemInput,
  UpdateItemInput,
  LibraryItemType,
} from "../types";

const STORAGE_LIBRARY_ITEMS_KEY = "linguaverse_library_items";
const STORAGE_LIBRARY_FOLDERS_KEY = "linguaverse_library_folders";
const STORAGE_LIBRARY_COLLECTIONS_KEY = "linguaverse_library_collections";
const STORAGE_LIBRARY_VERSIONS_KEY = "linguaverse_library_versions";

export const SAMPLE_FOLDERS: LibraryFolder[] = [
  { id: "f-1", name: "IELTS Exam Prep", color: "#10b981", icon: "folder", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "f-2", name: "TOPIK Korean Practice", color: "#3b82f6", icon: "folder", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "f-3", name: "HSK Chinese Business", color: "#f59e0b", icon: "folder", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const SAMPLE_COLLECTIONS: LibraryCollection[] = [
  { id: "c-1", folder_id: "f-1", name: "IELTS Speaking Audio Clips", description: "Audio podcast mẫu phần 2 & 3", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "c-2", folder_id: "f-2", name: "TOPIK Reading Passages", description: "Đoạn văn đọc hiểu TOPIK II", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const SAMPLE_ITEMS: LibraryItem[] = [
  {
    id: "lib-1",
    folder_id: "f-1",
    collection_id: "c-1",
    title: "IELTS Speaking Part 2 - Sustainable Energy.mp3",
    item_type: "audio",
    file_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    file_size: "3.4 MB",
    content_text: "Sample audio conversation discussing climate change resilience and renewable energy adoption.",
    tags: ["IELTS", "Audio", "Speaking"],
    is_favorite: true,
    is_trashed: false,
    share_token: "share-audio-101",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "lib-2",
    folder_id: "f-1",
    title: "Grammar Master Notes - Conditional Clauses.md",
    item_type: "note",
    file_url: null,
    file_size: "8.1 KB",
    content_text: `# Ghi Chú Cấu Trúc Câu Điều Kiện

## 1. Type 1 (Điều kiện có thật)
- **Formula:** \`If + S + V(pres), S + will + V\`
- **Example:** If you study hard, you will pass the exam.

## 2. Type 2 (Giả định trái với hiện tại)
- **Formula:** \`If + S + V(past), S + would + V\`
- **Example:** If I had more time, I would learn Korean.`,
    tags: ["Grammar", "Notes", "English"],
    is_favorite: true,
    is_trashed: false,
    share_token: "share-note-202",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "lib-3",
    folder_id: "f-2",
    collection_id: "c-2",
    title: "TOPIK II Essay Writing Sample.pdf",
    item_type: "document",
    file_url: null,
    file_size: "412 KB",
    content_text: "한국어 능력 시험 II 쓰기 영역 54번 작문 예시. 현대 사회와 정보화 시대의 장단점 논술.",
    tags: ["TOPIK", "PDF", "Writing"],
    is_favorite: false,
    is_trashed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "lib-4",
    folder_id: "f-3",
    title: "HSK 5 Business Presentation Video.mp4",
    item_type: "video",
    file_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    file_size: "15.8 MB",
    content_text: "Video bài giảng kinh doanh HSK 5 về thị trường thương mại điện tử.",
    tags: ["HSK", "Video", "Business"],
    is_favorite: false,
    is_trashed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "lib-5",
    title: "Vocabulary Infographic Chart.png",
    item_type: "image",
    file_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    file_size: "1.2 MB",
    content_text: "Sơ đồ minh họa 100 từ vựng nâng cao IELTS theo chủ đề Môi trường & Công nghệ.",
    tags: ["Vocabulary", "Image", "Infographic"],
    is_favorite: true,
    is_trashed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const SAMPLE_VERSIONS: ItemVersion[] = [
  {
    id: "ver-1",
    item_id: "lib-2",
    version_number: 1,
    title: "Grammar Master Notes - Draft 1",
    content_text: "# Draft Note on Conditionals",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "ver-2",
    item_id: "lib-2",
    version_number: 2,
    title: "Grammar Master Notes - Conditional Clauses.md",
    content_text: `# Ghi Chú Cấu Trúc Câu Điều Kiện\n- Type 1, 2, 3`,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

class LibraryService {
  private getLocalItems(): LibraryItem[] {
    if (typeof window === "undefined") return SAMPLE_ITEMS;
    try {
      const data = localStorage.getItem(STORAGE_LIBRARY_ITEMS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_LIBRARY_ITEMS_KEY, JSON.stringify(SAMPLE_ITEMS));
        return SAMPLE_ITEMS;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_ITEMS;
    }
  }

  private setLocalItems(items: LibraryItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_LIBRARY_ITEMS_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Localstorage error saving library items:", e);
    }
  }

  private getLocalFolders(): LibraryFolder[] {
    if (typeof window === "undefined") return SAMPLE_FOLDERS;
    try {
      const data = localStorage.getItem(STORAGE_LIBRARY_FOLDERS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_LIBRARY_FOLDERS_KEY, JSON.stringify(SAMPLE_FOLDERS));
        return SAMPLE_FOLDERS;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_FOLDERS;
    }
  }

  private setLocalFolders(folders: LibraryFolder[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_LIBRARY_FOLDERS_KEY, JSON.stringify(folders));
    } catch (e) {
      console.error("Localstorage error saving folders:", e);
    }
  }

  private getLocalCollections(): LibraryCollection[] {
    if (typeof window === "undefined") return SAMPLE_COLLECTIONS;
    try {
      const data = localStorage.getItem(STORAGE_LIBRARY_COLLECTIONS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_LIBRARY_COLLECTIONS_KEY, JSON.stringify(SAMPLE_COLLECTIONS));
        return SAMPLE_COLLECTIONS;
      }
      return JSON.parse(data);
    } catch {
      return SAMPLE_COLLECTIONS;
    }
  }

  private setLocalCollections(collections: LibraryCollection[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_LIBRARY_COLLECTIONS_KEY, JSON.stringify(collections));
    } catch (e) {
      console.error("Localstorage error saving collections:", e);
    }
  }

  private getLocalVersions(itemId: string): ItemVersion[] {
    if (typeof window === "undefined") return SAMPLE_VERSIONS.filter((v) => v.item_id === itemId);
    try {
      const data = localStorage.getItem(STORAGE_LIBRARY_VERSIONS_KEY);
      if (!data) return SAMPLE_VERSIONS.filter((v) => v.item_id === itemId);
      const all: ItemVersion[] = JSON.parse(data);
      return all.filter((v) => v.item_id === itemId);
    } catch {
      return SAMPLE_VERSIONS.filter((v) => v.item_id === itemId);
    }
  }

  private setLocalVersions(versions: ItemVersion[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_LIBRARY_VERSIONS_KEY, JSON.stringify(versions));
    } catch (e) {
      console.error("Localstorage error saving versions:", e);
    }
  }

  // Fetch Items
  async fetchItems(): Promise<LibraryItem[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("library_items").select("*").order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return this.getLocalItems();
      const items = (data as unknown) as LibraryItem[];
      this.setLocalItems(items);
      return items;
    } catch {
      return this.getLocalItems();
    }
  }

  // Fetch Folders
  async fetchFolders(): Promise<LibraryFolder[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("library_folders").select("*").order("name", { ascending: true });
      if (error || !data || data.length === 0) return this.getLocalFolders();
      const folders = (data as unknown) as LibraryFolder[];
      this.setLocalFolders(folders);
      return folders;
    } catch {
      return this.getLocalFolders();
    }
  }

  // Fetch Collections
  async fetchCollections(): Promise<LibraryCollection[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("library_collections").select("*").order("name", { ascending: true });
      if (error || !data || data.length === 0) return this.getLocalCollections();
      const collections = (data as unknown) as LibraryCollection[];
      this.setLocalCollections(collections);
      return collections;
    } catch {
      return this.getLocalCollections();
    }
  }

  // Create Item
  async createItem(input: CreateItemInput): Promise<LibraryItem> {
    const newItem: LibraryItem = {
      ...input,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `lib-${Date.now()}`,
      is_trashed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("library_items").insert([(newItem as unknown) as any]).select().single();
      if (!error && data) newItem.id = data.id;
    } catch {
      // Offline fallback
    }

    const items = [newItem, ...this.getLocalItems()];
    this.setLocalItems(items);

    // Save initial version
    this.createVersion(newItem.id, 1, newItem.title, newItem.content_text);

    return newItem;
  }

  // Update Item
  async updateItem(id: string, updates: UpdateItemInput): Promise<LibraryItem> {
    const items = this.getLocalItems();
    const existing = items.find((i) => i.id === id);
    if (!existing) throw new Error("Item not found");

    const updated: LibraryItem = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      await supabase.from("library_items").update(updates as any).eq("id", id);
    } catch {
      // Offline fallback
    }

    const updatedList = items.map((i) => (i.id === id ? updated : i));
    this.setLocalItems(updatedList);

    // Save new version if content changed
    if (updates.content_text && updates.content_text !== existing.content_text) {
      const existingVersions = this.getLocalVersions(id);
      const nextVer = existingVersions.length + 1;
      this.createVersion(id, nextVer, updated.title, updated.content_text);
    }

    return updated;
  }

  // Trash Item (Soft Delete)
  async trashItem(id: string): Promise<boolean> {
    await this.updateItem(id, { is_trashed: true });
    return true;
  }

  // Restore Item from Trash
  async restoreItem(id: string): Promise<boolean> {
    await this.updateItem(id, { is_trashed: false });
    return true;
  }

  // Permanent Delete
  async deleteItemPermanently(id: string): Promise<boolean> {
    const supabase = createClient();
    try {
      await supabase.from("library_items").delete().eq("id", id);
    } catch {
      // Offline fallback
    }

    const items = this.getLocalItems().filter((i) => i.id !== id);
    this.setLocalItems(items);
    return true;
  }

  // Toggle Favorite
  async toggleFavorite(id: string, current: boolean): Promise<boolean> {
    const next = !current;
    await this.updateItem(id, { is_favorite: next });
    return next;
  }

  // Version History Helpers
  async fetchVersions(itemId: string): Promise<ItemVersion[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("library_item_versions")
        .select("*")
        .eq("item_id", itemId)
        .order("version_number", { ascending: false });

      if (error || !data || data.length === 0) return this.getLocalVersions(itemId);
      return (data as unknown) as ItemVersion[];
    } catch {
      return this.getLocalVersions(itemId);
    }
  }

  private createVersion(itemId: string, versionNumber: number, title: string, contentText: string): ItemVersion {
    const ver: ItemVersion = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ver-${Date.now()}`,
      item_id: itemId,
      version_number: versionNumber,
      title,
      content_text: contentText,
      created_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      supabase.from("library_item_versions").insert([(ver as unknown) as any]);
    } catch {
      // Offline
    }

    const allVersions = [ver, ...this.getLocalVersions(itemId)];
    this.setLocalVersions(allVersions);
    return ver;
  }

  // Create Folder
  async createFolder(name: string, color: string = "#10b981"): Promise<LibraryFolder> {
    const newF: LibraryFolder = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `f-${Date.now()}`,
      name,
      color,
      icon: "folder",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("library_folders").insert([(newF as unknown) as any]).select().single();
      if (!error && data) newF.id = data.id;
    } catch {
      // Offline
    }

    const folders = [newF, ...this.getLocalFolders()];
    this.setLocalFolders(folders);
    return newF;
  }

  // Create Share Link
  generateShareLink(id: string): string {
    const token = `share-${id.slice(0, 8)}-${Date.now()}`;
    this.updateItem(id, { share_token: token });
    if (typeof window !== "undefined") {
      return `${window.location.origin}/library?share=${token}`;
    }
    return `/library?share=${token}`;
  }

  // Download File Helper
  downloadItemFile(item: LibraryItem, format: "txt" | "md" | "json" = "txt") {
    let content = item.content_text;
    const filename = `${item.title.replace(/\.[^/.]+$/, "")}.${format}`;

    if (format === "json") {
      content = JSON.stringify(
        {
          title: item.title,
          type: item.item_type,
          tags: item.tags,
          contentText: item.content_text,
          createdAt: item.created_at,
        },
        null,
        2
      );
    } else if (format === "md") {
      content = `# ${item.title}\n\n**Type:** ${item.item_type}\n**Tags:** ${item.tags.join(", ")}\n\n---\n\n${item.content_text}`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  subscribeToRealtime(onUpdate: () => void) {
    const supabase = createClient();
    const channel = supabase
      .channel("public:library_all")
      .on("postgres_changes", { event: "*", schema: "public", table: "library_items" }, () => onUpdate())
      .on("postgres_changes", { event: "*", schema: "public", table: "library_folders" }, () => onUpdate())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const libraryService = new LibraryService();

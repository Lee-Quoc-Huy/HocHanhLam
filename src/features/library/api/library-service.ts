import { createClient } from "@/lib/supabase/client";
import type {
  LibraryItem,
  LibraryFolder,
  LibraryCollection,
  ItemVersion,
  CreateItemInput,
  UpdateItemInput,
} from "../types";

const STORAGE_LIBRARY_ITEMS_KEY = "linguaverse_library_items";
const STORAGE_LIBRARY_FOLDERS_KEY = "linguaverse_library_folders";
const STORAGE_LIBRARY_COLLECTIONS_KEY = "linguaverse_library_collections";
const STORAGE_LIBRARY_VERSIONS_KEY = "linguaverse_library_versions";

class LibraryService {
  private getLocalItems(): LibraryItem[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_LIBRARY_ITEMS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
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
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_LIBRARY_FOLDERS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
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
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_LIBRARY_COLLECTIONS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
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
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_LIBRARY_VERSIONS_KEY);
      if (!data) return [];
      const all: ItemVersion[] = JSON.parse(data);
      return all.filter((v) => v.item_id === itemId);
    } catch {
      return [];
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

  // Fetch Items — Supabase is the source of truth. A legitimately empty
  // result (e.g. after trashing/deleting everything) is trusted as-is; we
  // only fall back to the local cache if the request itself failed (offline).
  async fetchItems(): Promise<LibraryItem[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("library_items").select("*").order("created_at", { ascending: false });
      const localItems = this.getLocalItems();
      if (error || !data) return localItems;
      const remoteItems = (data as unknown) as LibraryItem[];
      
      // Merge remote & local items so locally created items never get wiped on reload!
      const remoteIds = new Set(remoteItems.map((i) => i.id));
      const merged = [...remoteItems, ...localItems.filter((l) => !remoteIds.has(l.id))];
      this.setLocalItems(merged);
      return merged;
    } catch {
      return this.getLocalItems();
    }
  }

  // Fetch Folders — same trust-real-data rule as fetchItems.
  async fetchFolders(): Promise<LibraryFolder[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("library_folders").select("*").order("name", { ascending: true });
      if (error) return this.getLocalFolders();
      const folders = (data as unknown) as LibraryFolder[];
      this.setLocalFolders(folders);
      return folders;
    } catch {
      return this.getLocalFolders();
    }
  }

  // Fetch Collections — same trust-real-data rule.
  async fetchCollections(): Promise<LibraryCollection[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("library_collections").select("*").order("name", { ascending: true });
      if (error) return this.getLocalCollections();
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
    // If file is stored on Cloudflare R2 (or any cloud storage URL), open/download directly!
    if (item.file_url) {
      const link = document.createElement("a");
      link.href = item.file_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = item.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

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

export type LibraryItemType = "document" | "audio" | "video" | "image" | "note" | "exam_paper";

export interface LibraryFolder {
  id: string;
  user_id?: string | null;
  parent_id?: string | null;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface LibraryCollection {
  id: string;
  user_id?: string | null;
  folder_id?: string | null;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface LibraryItem {
  id: string;
  user_id?: string | null;
  folder_id?: string | null;
  collection_id?: string | null;
  title: string;
  item_type: LibraryItemType;
  file_url?: string | null;
  file_size: string;
  content_text: string;
  tags: string[];
  is_favorite: boolean;
  is_trashed: boolean;
  share_token?: string | null;
  // Metadata chuyên biệt cho Đề thi
  exam_category?: "TOPIK" | "TOEIC" | "IELTS" | "HSK" | null;
  exam_level?: string | null;
  exam_paper_type?: "full_exam" | "audio_attachment" | "reading_passage" | "answer_key" | null;
  created_at: string;
  updated_at: string;
}

export interface ItemVersion {
  id: string;
  item_id: string;
  version_number: number;
  title: string;
  content_text: string;
  created_at: string;
}

export interface LibraryFilter {
  search: string;
  itemType: LibraryItemType | "all";
  folderId?: string | null;
  collectionId?: string | null;
  tag?: string | null;
  favoritesOnly: boolean;
  trashedOnly: boolean;
}

export type CreateItemInput = Omit<
  LibraryItem,
  "id" | "created_at" | "updated_at" | "is_trashed"
>;

export type UpdateItemInput = Partial<
  Omit<LibraryItem, "id" | "created_at" | "updated_at">
>;

"use client";

import { useEffect } from "react";
import { useLibraryStore, selectFilteredLibraryItems } from "../store/library-store";
import { libraryService } from "../api/library-service";
import { LibraryItemType } from "../types";

export function useLibrary() {
  const store = useLibraryStore();

  useEffect(() => {
    store.fetchLibraryData();

    const unsubscribe = libraryService.subscribeToRealtime(() => {
      store.fetchLibraryData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Upload handler
  const handleUploadFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      let itemType: LibraryItemType = "document";
      if (["mp3", "wav", "m4a", "ogg"].includes(ext)) itemType = "audio";
      else if (["mp4", "webm", "mkv", "avi"].includes(ext)) itemType = "video";
      else if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) itemType = "image";
      else if (ext === "md" || ext === "txt") itemType = "note";

      let contentText = "";
      if (itemType === "note" || itemType === "document") {
        try {
          contentText = await file.text();
        } catch {
          contentText = `Nội dung tệp ${file.name}`;
        }
      }

      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      // Read object URL for media playback
      const fileUrl = URL.createObjectURL(file);

      await store.createItem({
        title: file.name,
        item_type: itemType,
        file_url: fileUrl,
        file_size: formattedSize,
        content_text: contentText || `Tệp ${file.name} đã được tải lên thành công.`,
        tags: [itemType.toUpperCase(), ext.toUpperCase()],
        is_favorite: false,
        folder_id: store.filter.folderId || null,
      });
    }
  };

  const handleCreateNote = async (title: string, content: string, tagsStr: string) => {
    const tags = tagsStr ? tagsStr.split(",").map((t) => t.trim()) : ["GhiChú"];
    await store.createItem({
      title,
      item_type: "note",
      file_url: null,
      file_size: `${Math.round(content.length / 1024)} KB`,
      content_text: content,
      tags,
      is_favorite: false,
      folder_id: store.filter.folderId || null,
    });
    store.setCreateNoteOpen(false);
  };

  const handleDownload = (item: any, format: "txt" | "md" | "json" = "txt") => {
    libraryService.downloadItemFile(item, format);
  };

  const handleGenerateShare = (item: any) => {
    const link = libraryService.generateShareLink(item.id);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    return link;
  };

  const filteredItems = selectFilteredLibraryItems(store.items, store.filter);

  return {
    ...store,
    filteredItems,
    handleUploadFiles,
    handleCreateNote,
    handleDownload,
    handleGenerateShare,
  };
}

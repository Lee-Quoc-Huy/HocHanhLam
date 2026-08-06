"use client";

import { useEffect } from "react";
import { useLibraryStore, selectFilteredLibraryItems } from "../store/library-store";
import { libraryService } from "../api/library-service";
import { LibraryItemType } from "../types";

export function useLibrary() {
  const store = useLibraryStore();

  // Helper: retrieve library items matching ALL provided tags (e.g. exam type + level).
  const getFilesByTag = (tags: string[]) => {
    return store.items.filter((item: any) =>
      tags.every((t) => item.tags?.includes(t))
    );
  };

  useEffect(() => {
    store.fetchLibraryData();

    const unsubscribe = libraryService.subscribeToRealtime(() => {
      store.fetchLibraryData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Upload handler — uploads the real file to Cloudflare R2 first, then
  // saves the returned public URL. Previously this used
  // `URL.createObjectURL(file)`, a blob URL that only lives in the current
  // browser tab's memory and vanishes on reload — nothing was actually
  // stored anywhere, so files never showed up on other devices.
  const handleUploadFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      let itemType: LibraryItemType = "document";
      if (["mp3", "wav", "m4a", "ogg"].includes(ext)) itemType = "audio";
      else if (["mp4", "webm", "mkv", "avi"].includes(ext)) itemType = "video";
      else if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) itemType = "image";
      else if (ext === "md" || ext === "txt") itemType = "note";

      let contentText = "";
      if (itemType === "note") {
        try {
          contentText = await file.text();
        } catch {
          contentText = `Nội dung tệp ${file.name}`;
        }
      } else if (itemType === "document") {
        // Binary document formats (PDF, DOCX, PPTX...) can't be read with
        // .text() without garbling into raw bytes — only .txt/.md map to
        // "note" and get real text extraction above; everything else here
        // just gets a placeholder note pointing at the stored file.
        contentText = `Tệp ${file.name} đã được lưu trữ. Xem/tải về qua đường dẫn tệp đính kèm.`;
      }

      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      let fileUrl: string | null = null;
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/library/upload", { method: "POST", body: formData });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Tải tệp lên Cloudflare R2 thất bại.");
        fileUrl = result.url;
      } catch (err) {
        console.error("Lỗi tải tệp lên Cloudflare R2:", err);
        // Vẫn tạo bản ghi ghi chú (không có file) để người dùng biết tệp bị lỗi,
        // thay vì âm thầm giả vờ thành công như trước đây.
        contentText = `⚠️ Không thể tải "${file.name}" lên bộ nhớ đám mây. ${
          err instanceof Error ? err.message : ""
        }`;
      }

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

  // Upload Đề thi & File kèm chuyên biệt vào Cloudflare R2 + lưu metadata
  const handleUploadExamPaper = async (input: {
    file: File;
    examCategory: "TOPIK" | "TOEIC" | "IELTS" | "HSK";
    examLevel: string;
    paperType: "full_exam" | "audio_attachment" | "reading_passage" | "answer_key";
    title?: string;
  }) => {
    const { file, examCategory, examLevel, paperType, title } = input;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    let fileUrl: string | null = null;
    let contentText = `Tệp đề thi ${file.name} thuộc kỳ thi ${examCategory} (${examLevel}).`;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/library/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Tải tệp đề thi lên Cloudflare R2 thất bại.");
      fileUrl = result.url;
    } catch (err) {
      console.error("Lỗi tải đề thi lên R2:", err);
      contentText = `⚠️ Không thể tải "${file.name}" lên bộ nhớ đám mây. ${
        err instanceof Error ? err.message : ""
      }`;
    }

    const tags = [
      "DE_THI",
      examCategory.toUpperCase(),
      examLevel.replace(/\s+/g, "_").toUpperCase(),
      paperType.toUpperCase(),
      ext.toUpperCase(),
    ];

    await store.createItem({
      title: title || file.name,
      item_type: "exam_paper",
      file_url: fileUrl,
      file_size: formattedSize,
      content_text: contentText,
      tags,
      is_favorite: false,
      folder_id: store.filter.folderId || null,
      exam_category: examCategory,
      exam_level: examLevel,
      exam_paper_type: paperType,
    });
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
    handleUploadExamPaper,
    handleCreateNote,
    handleDownload,
    handleGenerateShare,
    getFilesByTag,
  };
}

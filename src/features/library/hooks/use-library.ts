"use client";

import { useEffect } from "react";
import { useLibraryStore, selectFilteredLibraryItems } from "../store/library-store";
import { libraryService } from "../api/library-service";
import { LibraryItemType } from "../types";

// Helper: Upload file to Cloudflare R2 via Presigned Direct URL (supports files up to 500MB, bypassing Vercel 4.5MB limit)
async function uploadFileToR2(file: File): Promise<string> {
  try {
    const urlRes = await fetch("/api/library/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      }),
    });

    if (urlRes.ok) {
      const { uploadUrl, fileUrl } = await urlRes.json();
      if (uploadUrl && fileUrl) {
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (uploadRes.ok) {
          return fileUrl;
        }
      }
    }
  } catch (e) {
    console.warn("Presigned upload failed, attempting direct upload fallback:", e);
  }

  // Fallback endpoint for smaller files
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/library/upload", { method: "POST", body: formData });
  const result = await res.json().catch(() => ({ error: "Server response parse error" }));
  if (!res.ok) throw new Error(result.error || "Tải tệp lên Cloudflare R2 thất bại.");
  return result.url;
}

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

  const handleUploadFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      let itemType: LibraryItemType = "document";
      if (["mp3", "wav", "m4a", "ogg", "aac", "flac"].includes(ext)) itemType = "audio";
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
        contentText = `Tệp ${file.name} đã được lưu trữ. Xem/tải về qua đường dẫn tệp đính kèm.`;
      }

      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      let fileUrl: string | null = null;
      try {
        fileUrl = await uploadFileToR2(file);
      } catch (err) {
        console.error("Lỗi tải tệp lên Cloudflare R2:", err);
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

  // Upload Đề thi & File kèm chuyên biệt (Phân loại 5 Nhóm Thư Viện)
  const handleUploadExamPaper = async (input: {
    file?: File;
    examCategory: "TOPIK" | "TOEIC" | "IELTS" | "HSK";
    examLevel: string;
    paperType: "full_exam" | "reading_answer" | "listening_answer" | "combo_answer" | "writing_answer" | "audio_attachment";
    title?: string;
    pastedContent?: string;
    youtubeUrl?: string;
  }) => {
    const { file, examCategory, examLevel, paperType, title, pastedContent, youtubeUrl } = input;
    const ext = file ? file.name.split(".").pop()?.toLowerCase() || "" : "link";
    const formattedSize = file
      ? file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`
      : "Link";

    let fileUrl: string | null = youtubeUrl || null;

    let contentText = pastedContent && pastedContent.trim().length > 0
      ? pastedContent.trim()
      : `[PHÂN LOẠI 5 NHÓM: ${paperType.toUpperCase()}] ${title || (file ? file.name : "Tài liệu")} — Kỳ thi: ${examCategory} (${examLevel}).`;

    if (file) {
      if (!pastedContent && (ext === "txt" || ext === "md")) {
        try {
          contentText = await file.text();
        } catch {
          // keep placeholder
        }
      }

      try {
        fileUrl = await uploadFileToR2(file);
      } catch (err) {
        console.error("Lỗi tải đề thi lên R2:", err);
        contentText = `⚠️ Không thể tải "${file.name}" lên bộ nhớ đám mây. ${
          err instanceof Error ? err.message : ""
        }`;
      }
    }

    const tags = [
      "DE_THI",
      examCategory.toUpperCase(),
      examLevel.replace(/\s+/g, "_").toUpperCase(),
      paperType.toUpperCase(),
      ext.toUpperCase(),
    ];

    await store.createItem({
      title: title || (file ? file.name : `Bài Thi ${examCategory}`),
      item_type: "exam_paper",
      file_url: fileUrl,
      file_size: formattedSize,
      content_text: contentText,
      tags,
      is_favorite: false,
      folder_id: store.filter.folderId || null,
      exam_category: examCategory,
      exam_level: examLevel,
      exam_paper_type: paperType as any,
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

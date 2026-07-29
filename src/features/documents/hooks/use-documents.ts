"use client";

import { useEffect } from "react";
import {
  useDocumentStore,
  selectFilteredDocuments,
  selectDocumentStats,
} from "../store/document-store";
import { documentService } from "../api/document-service";
import { DocFileType } from "../types";

export function useDocuments() {
  const store = useDocumentStore();

  useEffect(() => {
    store.fetchDocuments();

    const unsubscribe = documentService.subscribeToRealtime(() => {
      store.fetchDocuments();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Global Clipboard Paste Listener (Ctrl+V Screenshot OCR)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (!blob) continue;

          // Convert blob to Base64 data URL
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = reader.result as string;
            const title = `Screenshot_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.png`;

            // Create document item
            const newDoc = await store.createDocument({
              title,
              file_type: "screenshot",
              file_size: `${Math.round(blob.size / 1024)} KB`,
              extracted_text: `[Image Screenshot Captured]\nData URL: ${dataUrl.slice(0, 50)}...`,
              language: "en",
            });

            // Automatically run AI OCR
            await store.runAiOcr(newDoc);
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Parse file and upload document helper
  const handleUploadFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      let fileType: DocFileType = "txt";
      if (ext === "pdf") fileType = "pdf";
      else if (ext === "docx" || ext === "doc") fileType = "docx";
      else if (ext === "pptx" || ext === "ppt") fileType = "ppt";
      else if (["png", "jpg", "jpeg", "webp"].includes(ext)) fileType = "image";
      else if (ext === "epub") fileType = "book";

      let extractedText = "";
      if (fileType === "txt") {
        try {
          extractedText = await file.text();
        } catch {
          extractedText = `Document contents of ${file.name}`;
        }
      } else {
        extractedText = `File content of ${file.name} (${file.type}). Click AI OCR to extract text.`;
      }

      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      const newDoc = await store.createDocument({
        title: file.name,
        file_type: fileType,
        file_size: formattedSize,
        extracted_text: extractedText,
        language: "en",
      });

      // If text file, auto OCR/normalize
      if (fileType === "txt" && extractedText.trim()) {
        store.runAiOcr(newDoc);
      }
    }
  };

  const handleDownloadDoc = (doc: any, format: "txt" | "md" | "json" = "txt") => {
    const filename = `${doc.title.replace(/\.[^/.]+$/, "")}.${format}`;
    let content = doc.extracted_text;

    if (format === "json") {
      content = JSON.stringify(
        {
          title: doc.title,
          fileType: doc.file_type,
          language: doc.language,
          extractedText: doc.extracted_text,
          createdAt: doc.created_at,
        },
        null,
        2
      );
    } else if (format === "md") {
      content = `# ${doc.title}\n\n**File Type:** ${doc.file_type}\n**Date:** ${doc.created_at}\n\n---\n\n${doc.extracted_text}`;
    }

    documentService.downloadTextFile(filename, content);
  };

  const filteredDocuments = selectFilteredDocuments(store.documents, store.filter);
  const stats = selectDocumentStats(store.documents);

  return {
    ...store,
    filteredDocuments,
    stats,
    handleUploadFiles,
    handleDownloadDoc,
  };
}

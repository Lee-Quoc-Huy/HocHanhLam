"use client";

import { useRef, useState } from "react";
import { Upload, Clipboard } from "lucide-react";

interface DocumentUploadDropzoneProps {
  onUpload: (files: FileList | File[]) => Promise<void>;
}

export function DocumentUploadDropzone({ onUpload }: DocumentUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await onUpload(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await onUpload(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragging
          ? "border-emerald-500 bg-emerald-500/10 shadow-lg scale-[1.01]"
          : "border-border/80 bg-surface/60 hover:border-emerald-500/50 hover:bg-surface"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.png,.jpg,.jpeg,.webp,.epub"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm border border-emerald-500/20 group-hover:scale-110 transition-transform">
        <Upload className="size-7" />
      </div>

      <h3 className="font-display text-lg font-bold text-foreground">
        Kéo thả tài liệu vào đây hoặc nhấp để chọn tệp
      </h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-md">
        Hỗ trợ PDF, DOCX, PPT, TXT, PNG, JPG, WebP, Sách (EPUB). Kích thước tối đa 50MB.
      </p>

      {/* Clipboard Paste Banner */}
      <div className="mt-4 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <Clipboard className="size-3.5" />
        <span>Bấm <kbd className="rounded border bg-background px-1 py-0.5 text-[10px]">Ctrl + V</kbd> để dán ảnh chụp màn hình OCR trực tiếp!</span>
      </div>
    </div>
  );
}

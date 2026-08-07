"use client";

import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  Music,
  FileText,
  CheckCircle2,
  Loader2,
  ClipboardPaste,
  BookOpen,
  Headphones,
  PenTool,
  Youtube,
  Link as LinkIcon,
} from "lucide-react";

export type PaperCategoryType =
  | "full_exam"
  | "reading_answer"
  | "listening_answer"
  | "combo_answer"
  | "writing_answer"
  | "audio_attachment";

interface UploadExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadExam: (input: {
    file?: File;
    examCategory: "TOPIK" | "TOEIC" | "IELTS" | "HSK";
    examLevel: string;
    paperType: PaperCategoryType;
    title?: string;
    pastedContent?: string;
    youtubeUrl?: string;
  }) => Promise<void>;
}

const EXAM_LEVELS: Record<string, string[]> = {
  TOPIK: [
    "TOPIK I - Cấp 1",
    "TOPIK I - Cấp 2",
    "TOPIK II - Cấp 3",
    "TOPIK II - Cấp 4",
    "TOPIK II - Cấp 5",
    "TOPIK II - Cấp 6",
    "TOPIK Speaking",
  ],
  TOEIC: [
    "Target 250 - 400",
    "Target 405 - 600",
    "Target 605 - 780",
    "Target 785 - 900",
    "Target 905 - 990",
    "TOEIC Speaking & Writing",
  ],
  IELTS: [
    "Band 4.0 - 4.5",
    "Band 5.0 - 5.5",
    "Band 6.0 - 6.5",
    "Band 7.0 - 7.5",
    "Band 8.0 - 9.0",
  ],
  HSK: [
    "HSK 1",
    "HSK 2",
    "HSK 3",
    "HSK 4",
    "HSK 5",
    "HSK 6",
    "HSK 7-9",
    "HSKK Sơ Cấp",
    "HSKK Trung Cấp",
    "HSKK Cao Cấp",
  ],
};

export function UploadExamModal({ isOpen, onClose, onUploadExam }: UploadExamModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [examCategory, setExamCategory] = useState<"TOPIK" | "TOEIC" | "IELTS" | "HSK">("TOPIK");
  const [examLevel, setExamLevel] = useState<string>("TOPIK I - Cấp 1");
  const [paperType, setPaperType] = useState<PaperCategoryType>("full_exam");
  const [title, setTitle] = useState("");
  const [pastedContent, setPastedContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const isAudioType = paperType === "audio_attachment";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));

      if (/\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(f.name)) {
        setPaperType("audio_attachment");
      }

      if (f.name.endsWith(".txt") || f.name.endsWith(".md")) {
        f.text().then((text) => {
          if (!pastedContent) setPastedContent(text);
        }).catch(() => {});
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !youtubeUrl.trim() && !pastedContent.trim()) return;

    setIsUploading(true);
    try {
      await onUploadExam({
        file: selectedFile || undefined,
        examCategory,
        examLevel,
        paperType,
        title: title.trim() || (selectedFile ? selectedFile.name : `Tài liệu ${examCategory}`),
        pastedContent: pastedContent.trim(),
        youtubeUrl: youtubeUrl.trim(),
      });
      setSelectedFile(null);
      setTitle("");
      setPastedContent("");
      setYoutubeUrl("");
      onClose();
    } catch (err) {
      console.error("Lỗi khi tải đề thi lên:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <Dialog.Title className="font-display text-lg font-bold text-foreground">
                  Upload Đề Thi & Tài Liệu (Phân Loại 5 Nhóm)
                </Dialog.Title>
                <p className="text-xs text-muted-foreground">
                  AI sẽ tự động đọc file và trộn các đề thi thông minh thành bài thi thật
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Category & Level */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">Kỳ Thi Chứng Chỉ:</label>
                <select
                  value={examCategory}
                  onChange={(e) => {
                    const cat = e.target.value as "TOPIK" | "TOEIC" | "IELTS" | "HSK";
                    setExamCategory(cat);
                    setExamLevel(EXAM_LEVELS[cat]?.[0] ?? "");
                  }}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-medium outline-none text-xs"
                >
                  <option value="TOPIK">TOPIK (Tiếng Hàn)</option>
                  <option value="TOEIC">TOEIC (Tiếng Anh)</option>
                  <option value="IELTS">IELTS (Tiếng Anh)</option>
                  <option value="HSK">HSK (Tiếng Trung)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">Cấp Độ Thi:</label>
                <select
                  value={examLevel}
                  onChange={(e) => setExamLevel(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-medium outline-none text-xs"
                >
                  {(EXAM_LEVELS[examCategory] ?? []).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5 Paper Categories */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">Phân Loại 5 Nhóm Thư Viện (AI Đọc Tự Động):</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "full_exam", label: "1. Đề thi (PDF / Text)", desc: "File đề bài thi thật", icon: FileSpreadsheet, color: "text-purple-500" },
                  { id: "reading_answer", label: "2. Đáp án Đọc riêng", desc: "Lời giải & đáp án bài đọc", icon: BookOpen, color: "text-emerald-500" },
                  { id: "listening_answer", label: "3. Đáp án Nghe riêng", desc: "Transcript & đáp án bài nghe", icon: Headphones, color: "text-blue-500" },
                  { id: "combo_answer", label: "2&3. Đáp án Đọc + Nghe Gộp Chung", desc: "File chứa cả đáp án Đọc & Nghe", icon: CheckCircle2, color: "text-teal-500" },
                  { id: "writing_answer", label: "4. Đáp án Viết (nếu có)", desc: "Bài viết mẫu & hướng dẫn", icon: PenTool, color: "text-amber-500" },
                  { id: "audio_attachment", label: "5. File nghe (Audio/Youtube)", desc: "File MP3 hoặc Link Youtube bài nghe", icon: Music, color: "text-rose-500" },
                ].map((pt) => {
                  const Icon = pt.icon;
                  const isSelected = paperType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setPaperType(pt.id as PaperCategoryType)}
                      className={`flex items-start gap-2.5 rounded-2xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/30"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className={`size-4 shrink-0 mt-0.5 ${pt.color}`} />
                      <div>
                        <span className="block text-xs font-bold text-foreground">{pt.label}</span>
                        <span className="block text-[11px] text-muted-foreground font-normal">{pt.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Choose File (PDF/DOCX/MP3) */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">Tải Lên Tệp (PDF, DOCX, MP3, TXT...):</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.mp3,.wav,.m4a,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-4 hover:border-primary hover:bg-muted transition-all"
              >
                {selectedFile ? (
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <CheckCircle2 className="size-5 text-emerald-500" />
                    <span className="line-clamp-1">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="size-7 text-muted-foreground mb-1" />
                    <span className="font-bold text-foreground text-xs">Nhấn để chọn tệp từ máy (AI sẽ tự động đọc trực tiếp file)</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">PDF, Word, MP3, Text file (Cloudflare R2 lưu trữ an toàn)</span>
                  </>
                )}
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">Tên Đề Thi / Tệp Mô Tả:</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: TOPIK II Đề 64 - Đề thi Đọc & Đáp án"
              />
            </div>

            {/* Youtube Link (If Audio Category 5 selected) */}
            {isAudioType && (
              <div className="space-y-1.5 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-3.5">
                <label className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 text-xs">
                  <Youtube className="size-4 text-rose-500" />
                  Hoặc Nhập Link Youtube Bài Nghe (nếu không có file .mp3):
                </label>
                <div className="flex items-center gap-2">
                  <LinkIcon className="size-4 text-muted-foreground shrink-0" />
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                    className="bg-background text-xs"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  AI sẽ phát trực tiếp video/audio Youtube này trong giao diện thi thật cho người làm bài!
                </p>
              </div>
            )}

            {/* Optional Manual Paste Text */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <ClipboardPaste className="size-4 text-emerald-500" />
                Ghi Chú Hoặc Paste Nội Dung (Tùy Chọn):
                <span className="text-[11px] text-muted-foreground font-normal">(AI tự đọc file, chỉ paste nếu muốn bổ sung)</span>
              </label>
              <textarea
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                placeholder="Dán thêm lời giải, ghi chú hoặc transcript nếu có..."
                className="w-full min-h-[70px] rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none resize-y"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
                Hủy Bỏ
              </Button>
              <Button
                type="submit"
                disabled={(!selectedFile && !youtubeUrl.trim() && !pastedContent.trim()) || isUploading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang lưu vào Thư Viện...
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-4" /> Tải Lên Thư Viện Đề Thi
                  </>
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileSpreadsheet, UploadCloud, Music, FileText, CheckCircle2, Loader2, ClipboardPaste } from "lucide-react";

interface UploadExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadExam: (input: {
    file: File;
    examCategory: "TOPIK" | "TOEIC" | "IELTS" | "HSK";
    examLevel: string;
    paperType: "full_exam" | "audio_attachment" | "reading_passage" | "answer_key";
    title?: string;
    pastedContent?: string;
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
  const [paperType, setPaperType] = useState<"full_exam" | "audio_attachment" | "reading_passage" | "answer_key">("full_exam");
  const [title, setTitle] = useState("");
  const [pastedContent, setPastedContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));

      // Auto-read .txt files for instant content_text
      if (f.name.endsWith(".txt") || f.name.endsWith(".md")) {
        f.text().then((text) => {
          if (!pastedContent) setPastedContent(text);
        }).catch(() => {});
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onUploadExam({
        file: selectedFile,
        examCategory,
        examLevel,
        paperType,
        title: title.trim() || selectedFile.name,
        pastedContent: pastedContent.trim(),
      });
      setSelectedFile(null);
      setTitle("");
      setPastedContent("");
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <Dialog.Title className="font-display text-lg font-bold text-foreground">
                  Upload Đề Thi & Tệp Đính Kèm
                </Dialog.Title>
                <p className="text-xs text-muted-foreground">
                  Phân loại đề thi để AI dễ dàng trích lọc & tạo đề thi thật chuẩn xác
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
            {/* Choose File */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">1. Chọn Tệp Đề Thi / Audio / Bài Đọc:</label>
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
                className="w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-5 hover:border-primary hover:bg-muted transition-all"
              >
                {selectedFile ? (
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <CheckCircle2 className="size-5 text-emerald-500" />
                    <span className="line-clamp-1">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="size-8 text-muted-foreground mb-1" />
                    <span className="font-bold text-foreground text-xs">Nhấn để chọn tệp (PDF, DOCX, MP3, Audio, Bài đọc...)</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">Tải lên tệp đề thi hoặc file nghe tương ứng</span>
                  </>
                )}
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">2. Tên Đề Thi / Tệp Mô Tả:</label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Đề Thi Thử TOPIK I Đề số 64 hoặc TOEIC Test 2026 Audio Part 1-4"
              />
            </div>

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

            {/* Paper Type */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">Phân Loại Nội Dung Tệp:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "full_exam", label: "Đề Thi Chính (PDF/DOC)", icon: FileSpreadsheet },
                  { id: "audio_attachment", label: "File Nghe (Audio MP3)", icon: Music },
                  { id: "reading_passage", label: "Bài Đọc / Đoạn Văn", icon: FileText },
                  { id: "answer_key", label: "Đáp Án & Lời Giải", icon: CheckCircle2 },
                ].map((pt) => {
                  const Icon = pt.icon;
                  const isSelected = paperType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setPaperType(pt.id as any)}
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{pt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ★ NEW: Paste Exam Content for AI ★ */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <ClipboardPaste className="size-4 text-emerald-500" />
                3. Dán Nội Dung Đề Thi Vào Đây (để AI trích lọc):
                <span className="text-[11px] text-muted-foreground font-normal">(Không bắt buộc nhưng giúp AI hiểu đề thi tốt hơn)</span>
              </label>
              <textarea
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                placeholder={`Copy & Paste toàn bộ nội dung đề thi vào đây (câu hỏi + đáp án + đoạn văn...).

Ví dụ:
1. 다음 중 맞는 것을 고르십시오.
① 저는 학생입니다  ② 저는 선생님입니다
정답: ①

AI sẽ đọc toàn bộ nội dung này và tạo ra bộ đề thi mới đa dạng hơn!`}
                className="w-full min-h-[120px] rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 resize-y transition-all"
              />
              {pastedContent.trim().length > 0 && (
                <p className="text-[11px] text-emerald-500 font-medium">
                  ✅ {pastedContent.trim().length.toLocaleString()} ký tự nội dung — AI sẽ trích lọc và tạo đề mới từ đây!
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
                Hủy Bỏ
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang tải lên...
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

"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ImageUp, Loader2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { aiCenterService } from "@/features/ai-center/api/ai-center-service";
import { ExtractionConfirmCard, type ExtractionData } from "@/features/ai-center/components/extraction-confirm-card";

interface ImageExtractModalProps {
  open: boolean;
  onClose: () => void;
  /** Which section to spotlight in the title/copy — extraction itself still
   *  returns all types found, since an image can mix vocabulary & grammar. */
  focus: "vocabulary" | "grammar";
}

export function ImageExtractModal({ open, onClose, focus }: ImageExtractModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ExtractionData | null>(null);

  const title = focus === "vocabulary" ? "Đọc Từ Vựng Từ Ảnh (AI)" : "Đọc Ngữ Pháp Từ Ảnh (AI)";
  const description =
    focus === "vocabulary"
      ? "Chụp hoặc tải lên ảnh bảng từ vựng, trang sách, ghi chú... AI sẽ đọc và đề xuất các từ tìm được."
      : "Chụp hoặc tải lên ảnh công thức ngữ pháp, bảng chia động từ, ghi chú... AI sẽ đọc và đề xuất cấu trúc tìm được.";

  function reset() {
    setPreview(null);
    setResult(null);
    setIsAnalyzing(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleAnalyze() {
    if (!preview) return;
    setIsAnalyzing(true);
    try {
      const data = await aiCenterService.analyzeAttachment({
        imageDataUrl: preview,
        targetLanguage: "en",
      });
      const hasCandidates = data.vocabulary.length > 0 || data.grammar.length > 0 || data.flashcards.length > 0;
      if (!hasCandidates) {
        toast.info(data.summary || "Không tìm thấy từ vựng hoặc ngữ pháp rõ ràng trong ảnh này.");
      }
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể phân tích ảnh.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-5 shadow-2xl animate-in zoom-in-95 fade-in max-h-[85vh] overflow-y-auto">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="size-4" />
              </div>
              <div>
                <Dialog.Title className="font-display text-base font-bold text-foreground">{title}</Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">{description}</Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          {!preview && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-10 text-muted-foreground transition-colors hover:border-emerald-500/50 hover:text-emerald-600"
            >
              <ImageUp className="size-8" />
              <span className="text-sm font-medium">Bấm để chọn ảnh</span>
            </button>
          )}

          {preview && (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-border">
                <img src={preview} alt="Ảnh đã chọn" className="max-h-64 w-full object-contain bg-muted" />
                {!result && (
                  <button
                    onClick={reset}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {!result && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Đang đọc ảnh…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Phân Tích Với AI
                    </>
                  )}
                </Button>
              )}

              {result && <ExtractionConfirmCard data={result} targetLanguage="en" />}

              {result && (
                <Button variant="outline" onClick={reset} className="w-full">
                  Chọn Ảnh Khác
                </Button>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

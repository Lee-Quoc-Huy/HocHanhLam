"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ImageUp, Loader2, X, Sparkles, CheckCircle2 } from "lucide-react";
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

/**
 * Split a potentially tall document image into horizontal slices (strips)
 * so that large lists with 50-100+ words can be processed in smaller chunks.
 * Each chunk runs within 4-5s, preventing Vercel serverless 10s timeouts while
 * preserving high resolution for crisp text OCR.
 */
async function createSlicesFromImage(imageSrc: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const TARGET_WIDTH = 1200;
      const scale = TARGET_WIDTH / img.width;
      const scaledWidth = TARGET_WIDTH;
      const scaledHeight = img.height * scale;

      // Slice height of ~700px at 1200px width (~20-25 lines of text per slice)
      const SLICE_HEIGHT = 700;
      const OVERLAP = 70; // 70px vertical overlap to catch boundary rows

      if (scaledHeight <= SLICE_HEIGHT * 1.3) {
        // Single slice for normal / square / landscape images
        const canvas = document.createElement("canvas");
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
          resolve([canvas.toDataURL("image/jpeg", 0.75)]);
          return;
        }
      }

      // Multi-slice for tall document photos (e.g. 50-100+ word tables)
      const slices: string[] = [];
      let currentY = 0;

      while (currentY < scaledHeight) {
        const sliceH = Math.min(SLICE_HEIGHT, scaledHeight - currentY);
        const canvas = document.createElement("canvas");
        canvas.width = scaledWidth;
        canvas.height = sliceH;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const srcY = currentY / scale;
          const srcH = sliceH / scale;

          ctx.drawImage(
            img,
            0,
            srcY,
            img.width,
            srcH,
            0,
            0,
            scaledWidth,
            sliceH
          );
          slices.push(canvas.toDataURL("image/jpeg", 0.75));
        }

        currentY += SLICE_HEIGHT - OVERLAP;
      }

      resolve(slices.length > 0 ? slices : [imageSrc]);
    };
    img.onerror = () => resolve([imageSrc]);
    img.src = imageSrc;
  });
}

export function ImageExtractModal({ open, onClose, focus }: ImageExtractModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rawFileSrc, setRawFileSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [result, setResult] = useState<ExtractionData | null>(null);

  const title = focus === "vocabulary" ? "Đọc Từ Vựng Từ Ảnh (AI)" : "Đọc Ngữ Pháp Từ Ảnh (AI)";
  const description =
    focus === "vocabulary"
      ? "Chụp hoặc tải lên ảnh bảng từ vựng, trang sách... AI hỗ trợ quét tự động phân đoạn các bảng dài (50-100+ từ)."
      : "Chụp hoặc tải lên ảnh công thức ngữ pháp, trang sách... AI hỗ trợ đọc và trích xuất cấu trúc tự động.";

  function reset() {
    setPreview(null);
    setRawFileSrc(null);
    setResult(null);
    setIsAnalyzing(false);
    setProgressStatus("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setRawFileSrc(dataUrl);

      // Create a quick display preview
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPreview(canvas.toDataURL("image/jpeg", 0.70));
        } else {
          setPreview(dataUrl);
        }
      };
      img.onerror = () => setPreview(dataUrl);
      img.src = dataUrl;
    };
    reader.readDataURL(file);
  }

  async function handleAnalyze() {
    const sourceImage = rawFileSrc || preview;
    if (!sourceImage) return;

    setIsAnalyzing(true);
    setResult(null);
    setProgressStatus("Đang chuẩn bị phân tích ảnh...");

    try {
      // Step 1: Create horizontal slices for tall images
      const slices = await createSlicesFromImage(sourceImage);
      const totalSlices = slices.length;

      const allVocabulary: any[] = [];
      const allGrammar: any[] = [];
      const allFlashcards: any[] = [];
      let summaryText = "";

      // Step 2: Send each slice in sequence to avoid timeouts and keep requests fast
      for (let i = 0; i < totalSlices; i++) {
        if (totalSlices > 1) {
          setProgressStatus(`Đang đọc phân đoạn ${i + 1}/${totalSlices} (${Math.round(((i + 1) / totalSlices) * 100)}%)...`);
        } else {
          setProgressStatus("Đang đọc và trích xuất dữ liệu từ ảnh...");
        }

        try {
          const data = await aiCenterService.analyzeAttachment({
            imageDataUrl: slices[i],
            targetLanguage: "en",
          });

          if (data.summary && !summaryText) {
            summaryText = data.summary;
          }

          if (Array.isArray(data.vocabulary)) {
            allVocabulary.push(...data.vocabulary);
          }
          if (Array.isArray(data.grammar)) {
            allGrammar.push(...data.grammar);
          }
          if (Array.isArray(data.flashcards)) {
            allFlashcards.push(...data.flashcards);
          }
        } catch (err) {
          console.warn(`Error analyzing slice ${i + 1}:`, err);
          // If a single slice fails, continue with remaining slices
          if (totalSlices === 1) throw err;
        }
      }

      // Step 3: Deduplicate extracted vocabulary & grammar items
      const vocabMap = new Map<string, any>();
      allVocabulary.forEach((item) => {
        const key = (item.word || "").toLowerCase().trim();
        if (key && !vocabMap.has(key)) {
          vocabMap.set(key, item);
        }
      });

      const grammarMap = new Map<string, any>();
      allGrammar.forEach((item) => {
        const key = (item.title || "").toLowerCase().trim();
        if (key && !grammarMap.has(key)) {
          grammarMap.set(key, item);
        }
      });

      const flashcardMap = new Map<string, any>();
      allFlashcards.forEach((item) => {
        const key = (item.front_text || "").toLowerCase().trim();
        if (key && !flashcardMap.has(key)) {
          flashcardMap.set(key, item);
        }
      });

      const mergedVocab = Array.from(vocabMap.values());
      const mergedGrammar = Array.from(grammarMap.values());
      const mergedFlashcards = Array.from(flashcardMap.values());

      const mergedResult: ExtractionData = {
        summary: summaryText || `Đã đọc thành công ${mergedVocab.length} từ vựng và ${mergedGrammar.length} ngữ pháp.`,
        vocabulary: mergedVocab,
        grammar: mergedGrammar,
        flashcards: mergedFlashcards,
      };

      const hasCandidates = mergedVocab.length > 0 || mergedGrammar.length > 0 || mergedFlashcards.length > 0;
      if (!hasCandidates) {
        toast.info("Không tìm thấy từ vựng hoặc ngữ pháp rõ ràng trong ảnh này.");
      } else {
        toast.success(`Đã quét thành công ${mergedVocab.length} từ vựng từ ${totalSlices} phần ảnh!`);
      }

      setResult(mergedResult);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể phân tích ảnh.");
    } finally {
      setIsAnalyzing(false);
      setProgressStatus("");
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
              <button type="button" className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          {!preview && (
            <button
              type="button"
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
                {!result && !isAnalyzing && (
                  <button
                    type="button"
                    onClick={reset}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {!result && (
                <Button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>{progressStatus || "Đang phân tích..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Phân Tích Với AI (Hỗ trợ ảnh 100+ từ)
                    </>
                  )}
                </Button>
              )}

              {result && <ExtractionConfirmCard data={result} targetLanguage="en" />}

              {result && (
                <Button type="button" variant="outline" onClick={reset} className="w-full mt-2">
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

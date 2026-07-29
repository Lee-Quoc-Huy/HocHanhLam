"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  FileText,
  Languages,
  BookOpenText,
  Layers,
  HelpCircle,
  Sparkles,
  Download,
  CheckCircle2,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentItem, DocumentQuiz, QuizQuestion } from "../types";

interface DocumentViewerModalProps {
  document: DocumentItem | null;
  isAiProcessing: boolean;
  aiTaskName: string | null;
  translatedText: string;
  minedVocabulary: any[];
  generatedFlashcards: any[];
  activeQuiz: DocumentQuiz | null;
  onClose: () => void;
  onRunOcr: (doc: DocumentItem) => Promise<void>;
  onRunTranslate: (doc: DocumentItem, lang: string) => Promise<void>;
  onRunVocabulary: (doc: DocumentItem) => Promise<number>;
  onRunFlashcards: (doc: DocumentItem) => Promise<number>;
  onRunQuiz: (doc: DocumentItem) => Promise<DocumentQuiz>;
  onDownload: (doc: DocumentItem, format: "txt" | "md" | "json") => void;
}

type TabType = "text" | "translate" | "vocabulary" | "flashcards" | "quiz";

export function DocumentViewerModal({
  document: doc,
  isAiProcessing,
  aiTaskName,
  translatedText,
  minedVocabulary,
  generatedFlashcards,
  activeQuiz,
  onClose,
  onRunOcr,
  onRunTranslate,
  onRunVocabulary,
  onRunFlashcards,
  onRunQuiz,
  onDownload,
}: DocumentViewerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const [targetLang, setTargetLang] = useState("vi");

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!doc) return null;

  const handleMineVocab = async () => {
    const count = await onRunVocabulary(doc);
    setSaveSuccessMsg(`Đã tự động lưu ${count} từ vựng vào Kho Từ Vựng!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleGenFlashcards = async () => {
    const count = await onRunFlashcards(doc);
    setSaveSuccessMsg(`Đã tự động tạo và lưu ${count} thẻ vào Hệ Thống Flashcards SRS!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const calculateQuizScore = () => {
    if (!activeQuiz) return 0;
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <Dialog.Root open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                {doc.file_type}
              </span>
              <div>
                <Dialog.Title className="font-display text-lg font-bold text-foreground line-clamp-1">
                  {doc.title}
                </Dialog.Title>
                <p className="text-xs text-muted-foreground">Kích thước: {doc.file_size}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(doc, "txt")}
                className="gap-1.5 text-xs"
              >
                <Download className="size-3.5" /> Tải TXT
              </Button>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                  <X className="size-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          {/* AI Status Banner */}
          {isAiProcessing && (
            <div className="my-3 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
              <Loader2 className="size-4 animate-spin" />
              <span>{aiTaskName || "AI đang xử lý..."}</span>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="my-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-border py-2 overflow-x-auto text-xs font-semibold">
            {[
              { id: "text", label: "Văn Bản Trích Xuất", icon: FileText },
              { id: "translate", label: "Dịch Thuật AI", icon: Languages },
              { id: "vocabulary", label: "Trích Xuất Từ Vựng", icon: BookOpenText },
              { id: "flashcards", label: "Tạo Flashcards SRS", icon: Layers },
              { id: "quiz", label: "Bài Kiểm Tra Quiz", icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Extracted Text */}
          {activeTab === "text" && (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Nội dung văn bản trích xuất:</span>
                <Button size="sm" onClick={() => onRunOcr(doc)} disabled={isAiProcessing} className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Sparkles className="size-3.5" /> Chạy AI OCR
                </Button>
              </div>

              <textarea
                readOnly
                value={doc.extracted_text}
                rows={12}
                className="w-full rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed outline-none"
              />
            </div>
          )}

          {/* Tab 2: AI Translation */}
          {activeTab === "translate" && (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Dịch Sang:</span>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none"
                  >
                    <option value="vi">🇻🇳 Tiếng Việt</option>
                    <option value="en">🇬🇧 Tiếng Anh</option>
                    <option value="ko">🇰🇷 Tiếng Hàn</option>
                    <option value="zh">🇨🇳 Tiếng Trung</option>
                  </select>
                </div>

                <Button size="sm" onClick={() => onRunTranslate(doc, targetLang)} disabled={isAiProcessing} className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Sparkles className="size-3.5" /> Bắt Đầu Dịch AI
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-background p-4 min-h-[220px] font-mono text-xs whitespace-pre-wrap leading-relaxed">
                {translatedText || "Nhấn nút 'Bắt Đầu Dịch AI' để dịch tài liệu..."}
              </div>
            </div>
          )}

          {/* Tab 3: Mined Vocabulary */}
          {activeTab === "vocabulary" && (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Trích xuất từ vựng quan trọng:</span>
                <Button size="sm" onClick={handleMineVocab} disabled={isAiProcessing} className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Sparkles className="size-3.5" /> Trích Xuất & Lưu Kho
                </Button>
              </div>

              {minedVocabulary.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {minedVocabulary.map((v, i) => (
                    <div key={i} className="rounded-xl border border-border bg-background p-3 space-y-1">
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span>{v.word}</span>
                        <span className="font-mono text-[10px] text-emerald-600">{v.ipa}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{v.vietnamese}</p>
                      <p className="text-[11px] font-mono text-muted-foreground line-clamp-1">Ex: {v.example}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  Nhấn &quot;Trích Xuất & Lưu Kho&quot; để AI quét từ vựng và tự động thêm vào Kho Từ Vựng.
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Generated Flashcards */}
          {activeTab === "flashcards" && (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Tạo bộ thẻ ghi nhớ SRS:</span>
                <Button size="sm" onClick={handleGenFlashcards} disabled={isAiProcessing} className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Sparkles className="size-3.5" /> Tạo Flashcards & Lưu Kho
                </Button>
              </div>

              {generatedFlashcards.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {generatedFlashcards.map((c, i) => (
                    <div key={i} className="rounded-xl border border-border bg-background p-4 space-y-2">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">Thẻ {i + 1}</span>
                      <p className="font-bold text-sm text-foreground">{c.front_text}</p>
                      <p className="text-xs text-muted-foreground font-medium">{c.back_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  Nhấn &quot;Tạo Flashcards & Lưu Kho&quot; để AI tự động soạn bộ thẻ học SRS.
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Interactive Quiz */}
          {activeTab === "quiz" && (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Bài kiểm tra trắc nghiệm AI:</span>
                <Button size="sm" onClick={() => onRunQuiz(doc)} disabled={isAiProcessing} className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Sparkles className="size-3.5" /> Soạn Bài Quiz Mới
                </Button>
              </div>

              {activeQuiz && activeQuiz.questions.length > 0 ? (
                <div className="space-y-6">
                  {activeQuiz.questions.map((q: QuizQuestion, qIdx: number) => (
                    <div key={q.id || qIdx} className="rounded-xl border border-border bg-background p-4 space-y-3">
                      <p className="font-bold text-foreground">
                        Câu {qIdx + 1}: {q.question}
                      </p>

                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswers[qIdx] === optIdx;
                          const isCorrect = optIdx === q.correctAnswer;

                          let btnStyle = "border-border bg-surface hover:bg-muted text-foreground";
                          if (isQuizSubmitted) {
                            if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold";
                            else if (isSelected) btnStyle = "border-rose-500 bg-rose-500/10 text-rose-600";
                          } else if (isSelected) {
                            btnStyle = "border-emerald-600 bg-emerald-500/10 text-emerald-600 font-bold";
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleOptionSelect(qIdx, optIdx)}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                              {isQuizSubmitted && isCorrect && <Check className="size-4 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>

                      {isQuizSubmitted && (
                        <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded-lg">
                          💡 Giải thích: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    {isQuizSubmitted ? (
                      <div className="font-bold text-emerald-600 text-sm">
                        Kết quả: {calculateQuizScore()} / {activeQuiz.questions.length} câu đúng 🎉
                      </div>
                    ) : (
                      <Button
                        onClick={() => setIsQuizSubmitted(true)}
                        disabled={Object.keys(userAnswers).length < activeQuiz.questions.length}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md"
                      >
                        Nộp Bài Chấm Điểm
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  Nhấn &quot;Soạn Bài Quiz Mới&quot; để AI tạo bộ câu hỏi kiểm tra bài đọc.
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

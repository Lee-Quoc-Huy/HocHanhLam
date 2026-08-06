"use client";

import { useState } from "react";
import { ExamPrepHeader } from "@/features/exam-prep/components/exam-prep-header";
import { ExamLibraryPickerModal } from "@/features/exam-prep/components/exam-library-picker-modal";
import { ExamPracticeEngine } from "@/features/exam-prep/components/exam-practice-engine";
import { ExamCertificate, ExamSkillMode, ExamPaper } from "@/features/exam-prep/types";
import { EXAM_LEVELS } from "@/features/exam-prep/lib/exam-service";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, BookOpen, Award, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ExamPrepPage() {
  const [selectedCertificate, setSelectedCertificate] = useState<ExamCertificate>("topik");
  const [selectedLevel, setSelectedLevel] = useState<string>("topik1_level2");
  const [selectedSkillMode, setSelectedSkillMode] = useState<ExamSkillMode>("all");

  // Linked library file state
  const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);
  const [linkedFileId, setLinkedFileId] = useState("");
  const [linkedFileName, setLinkedFileName] = useState("");
  const [linkedFileContent, setLinkedFileContent] = useState("");

  // Exam Paper state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePaper, setActivePaper] = useState<ExamPaper | null>(null);

  const handleStartExam = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificate: selectedCertificate,
          level: selectedLevel,
          skillMode: selectedSkillMode,
          libraryContext: linkedFileContent,
          libraryFileName: linkedFileName,
        }),
      });

      if (!res.ok) throw new Error("Không thể khởi tạo đề thi AI.");
      const paperData = await res.json();

      setActivePaper(paperData);
      toast.success(`🤖 AI đã khởi tạo đề thi ${selectedCertificate.toUpperCase()} (${selectedLevel}) thành công!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tạo đề thi AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectLibraryFile = (fileId: string, fileName: string, fileContent: string) => {
    setLinkedFileId(fileId);
    setLinkedFileName(fileName);
    setLinkedFileContent(fileContent);
    if (fileName) {
      toast.success(`📎 Đã trích xuất tài liệu "${fileName}" cho AI biên soạn đề!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Certificate Controls */}
      <ExamPrepHeader
        selectedCertificate={selectedCertificate}
        selectedLevel={selectedLevel}
        selectedSkillMode={selectedSkillMode}
        linkedLibraryFileName={linkedFileName}
        onSelectCertificate={setSelectedCertificate}
        onSelectLevel={setSelectedLevel}
        onSelectSkillMode={setSelectedSkillMode}
        onOpenLibraryPicker={() => setIsLibraryPickerOpen(true)}
        onStartExam={handleStartExam}
        isGenerating={isGenerating}
      />

      {/* Main View: Active Paper OR Overview Dashboard */}
      {activePaper ? (
        <ExamPracticeEngine
          paper={activePaper}
          isMockMode={selectedSkillMode === "mock_test"}
          onRestart={() => setActivePaper(null)}
        />
      ) : (
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Welcome Intro Card */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-md">
                <GraduationCap className="size-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-extrabold text-foreground">
                  Luyện Thi Chứng Chỉ Ngôn Ngữ Chuẩn Hóa
                </h2>
                <p className="text-xs text-muted-foreground">
                  Hệ thống AI tự động biên soạn câu hỏi nghe, đọc, ngữ pháp bám sát 100% cấu trúc đề thi thật
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-2 text-xs">
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-background/80 border border-border">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">Phân Luồng Cấp Độ</span>
                  <span className="text-[11px] text-muted-foreground">Hỗ trợ đầy đủ TOPIK I/II, TOEIC 300-900+, HSK 1-6, IELTS</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-background/80 border border-border">
                <CheckCircle2 className="size-4 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">Tích Hợp Thư Viện</span>
                  <span className="text-[11px] text-muted-foreground">Dùng file PDF/Audio đã upload để AI trích xuất câu hỏi bài thi</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-background/80 border border-border">
                <CheckCircle2 className="size-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-foreground">Thi Thử Có Đếm Giờ</span>
                  <span className="text-[11px] text-muted-foreground">Chấm điểm tự động và nhận lời giải chi tiết từng câu từ AI</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <Button
                onClick={handleStartExam}
                disabled={isGenerating}
                className="py-6 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 text-white font-bold text-sm gap-2 shadow-lg hover:opacity-95 active:scale-98"
              >
                <Sparkles className="size-4" />
                <span>{isGenerating ? "AI Đang Biên Soạn Đề..." : "Bắt Đầu Tạo Đề Thi Ngay"}</span>
              </Button>
            </div>
          </div>

          {/* Preset Syllabus Level Showcase */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Award className="size-4 text-indigo-500" /> Các Cấp Độ Thi {(selectedCertificate || "topik").toUpperCase()}:
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(EXAM_LEVELS[selectedCertificate] || []).map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => {
                    setSelectedLevel(lvl.id);
                    handleStartExam();
                  }}
                  className="p-4 rounded-2xl border border-border/80 bg-surface/80 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all active:scale-98 space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between font-bold text-xs sm:text-sm text-foreground">
                    <span>{lvl.name}</span>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      Mục tiêu: {lvl.targetScore}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{lvl.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Library Document Picker Modal */}
      <ExamLibraryPickerModal
        open={isLibraryPickerOpen}
        onClose={() => setIsLibraryPickerOpen(false)}
        onSelectFile={handleSelectLibraryFile}
        selectedFileId={linkedFileId}
      />
    </div>
  );
}

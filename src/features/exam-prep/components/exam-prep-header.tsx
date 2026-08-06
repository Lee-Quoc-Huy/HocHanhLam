"use client";

import { GraduationCap, Award, BookOpen, Headphones, FileText, Sparkles, FolderPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamCertificate, ExamSkillMode } from "../types";
import { EXAM_LEVELS } from "../lib/exam-service";
import { cn } from "@/lib/utils/cn";

interface ExamPrepHeaderProps {
  selectedCertificate: ExamCertificate;
  selectedLevel: string;
  selectedSkillMode: ExamSkillMode;
  linkedLibraryFileName?: string;
  onSelectCertificate: (cert: ExamCertificate) => void;
  onSelectLevel: (lvl: string) => void;
  onSelectSkillMode: (mode: ExamSkillMode) => void;
  onOpenLibraryPicker: () => void;
  onStartExam: () => void;
  isGenerating: boolean;
}

export function ExamPrepHeader({
  selectedCertificate,
  selectedLevel,
  selectedSkillMode,
  linkedLibraryFileName,
  onSelectCertificate,
  onSelectLevel,
  onSelectSkillMode,
  onOpenLibraryPicker,
  onStartExam,
  isGenerating,
}: ExamPrepHeaderProps) {
  const currentLevels = EXAM_LEVELS[selectedCertificate] || [];

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-md">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Trung Tâm Ôn Thi Chứng Chỉ
            </h1>
            <p className="text-xs text-muted-foreground">
              Luyện thi chuẩn TOPIK 🇰🇷, TOEIC 🇬🇧, HSK 🇨🇳 & IELTS 🇬🇧 · Tích hợp tài liệu Thư viện Cloudflare & AI Thời Gian Thực
            </p>
          </div>
        </div>

        {/* Start Exam Button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onStartExam}
            disabled={isGenerating}
            className="w-full sm:w-auto py-6 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 text-white font-bold text-sm gap-2 shadow-lg hover:opacity-95 active:scale-98"
          >
            <Sparkles className="size-4 animate-pulse" />
            <span>{isGenerating ? "AI Đang Tạo Đề..." : "Tạo Đề Ôn / Thi Thử AI"}</span>
          </Button>
        </div>
      </div>

      {/* Certificate Selector (TOPIK, TOEIC, HSK, IELTS) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { id: "topik", name: "TOPIK", flag: "🇰🇷", desc: "Chứng chỉ Tiếng Hàn", color: "from-blue-500/15 to-indigo-500/5 text-blue-600 border-blue-500/30" },
          { id: "toeic", name: "TOEIC", flag: "🇬🇧", desc: "Tiếng Anh Thương Mại", color: "from-emerald-500/15 to-teal-500/5 text-emerald-600 border-emerald-500/30" },
          { id: "hsk", name: "HSK", flag: "🇨🇳", desc: "Chứng chỉ Tiếng Trung", color: "from-rose-500/15 to-amber-500/5 text-rose-600 border-rose-500/30" },
          { id: "ielts", name: "IELTS", flag: "🇬🇧", desc: "Tiếng Anh Học Thuật", color: "from-purple-500/15 to-indigo-500/5 text-purple-600 border-purple-500/30" },
        ].map((cert) => {
          const isSelected = selectedCertificate === cert.id;
          return (
            <button
              key={cert.id}
              onClick={() => {
                onSelectCertificate(cert.id as ExamCertificate);
                const firstLvl = EXAM_LEVELS[cert.id as ExamCertificate]?.[0]?.id;
                if (firstLvl) onSelectLevel(firstLvl);
              }}
              className={cn(
                "flex flex-col items-start p-4 rounded-2xl border transition-all text-left relative overflow-hidden active:scale-98 shadow-sm",
                isSelected
                  ? "border-indigo-500 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent ring-2 ring-indigo-500/50 shadow-md"
                  : "border-border/80 bg-surface hover:border-border hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-2xl">{cert.flag}</span>
                {isSelected && (
                  <span className="rounded-full bg-indigo-500 text-white p-0.5">
                    <Award className="size-3.5" />
                  </span>
                )}
              </div>
              <span className="font-display font-bold text-base text-foreground">{cert.name}</span>
              <span className="text-[11px] text-muted-foreground">{cert.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Level Selector */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 space-y-3 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Award className="size-4 text-indigo-500" /> Chọn Cấp Độ Thi ({(selectedCertificate || "topik").toUpperCase()}):
          </span>

          {/* Library File Link Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenLibraryPicker}
            className="h-8 text-xs gap-1.5 rounded-xl border-dashed border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10"
          >
            <FolderPlus className="size-3.5" />
            {linkedLibraryFileName ? (
              <span className="truncate max-w-[140px]">📎 {linkedLibraryFileName}</span>
            ) : (
              "Trích Xuất File Thư Viện"
            )}
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {currentLevels.map((lvl) => {
            const isLvlSelected = selectedLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => onSelectLevel(lvl.id)}
                className={cn(
                  "p-3 rounded-xl border text-left text-xs transition-all active:scale-98",
                  isLvlSelected
                    ? "border-indigo-500 bg-indigo-500/15 font-bold text-indigo-600 dark:text-indigo-400 shadow-2xs"
                    : "border-border/60 bg-background/80 text-foreground hover:bg-muted/60"
                )}
              >
                <div className="font-bold">{lvl.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{lvl.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skill Mode Bar */}
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "Tất Cả Kỹ Năng", icon: BookOpen },
            { id: "listening", label: "Luyện Nghe Hiểu", icon: Headphones },
            { id: "reading", label: "Luyện Đọc Hiểu", icon: FileText },
            { id: "grammar", label: "Ngữ Pháp & Từ Vựng", icon: Sparkles },
            { id: "mock_test", label: "⏱️ Thi Thử Đếm Giờ", icon: Clock },
          ].map((mode) => {
            const Icon = mode.icon;
            const isModeActive = selectedSkillMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectSkillMode(mode.id as ExamSkillMode)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 active:scale-95",
                  isModeActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

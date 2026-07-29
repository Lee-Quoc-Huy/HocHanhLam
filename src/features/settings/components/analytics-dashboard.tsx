"use client";

import { BarChart3, Clock, BookOpen, Layers, Gamepad2, Bot, Sparkles } from "lucide-react";
import { StudyAnalytics } from "../types";

interface AnalyticsDashboardProps {
  analytics: StudyAnalytics;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const maxMins = Math.max(...analytics.weeklyMetrics.map((m) => m.studyMins), 60);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Báo Cáo & Thống Kê Tiến Độ Học Tập</span>
        </h3>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Clock className="size-4" /> Tổng Giờ Học Tập
          </div>
          <div className="font-display text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {analytics.totalStudyHours} Giờ
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 backdrop-blur-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
            <BookOpen className="size-4" /> Từ Vựng Đã Thuộc
          </div>
          <div className="font-display text-2xl font-bold text-blue-700 dark:text-blue-300">
            {analytics.totalWordsLearned} Từ
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 backdrop-blur-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
            <Layers className="size-4" /> Tỷ Lệ Ghi Nhớ SRS
          </div>
          <div className="font-display text-2xl font-bold text-purple-700 dark:text-purple-300">
            {analytics.srsRetentionRate}%
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Bot className="size-4" /> Lượt Hỏi Trợ Lý AI
          </div>
          <div className="font-display text-2xl font-bold text-amber-700 dark:text-amber-300">
            {analytics.aiInteractionsCount} Lượt
          </div>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="rounded-2xl border border-border/80 bg-surface/80 p-6 shadow-xs backdrop-blur-md space-y-4">
        <h4 className="font-display text-sm font-bold text-foreground">
          Biểu Đồ Thời Gian Học Trong Tuần (Phút / Ngày)
        </h4>

        <div className="flex items-end justify-between gap-2 h-48 pt-6 border-b border-border/60 pb-2">
          {analytics.weeklyMetrics.map((day, idx) => {
            const heightPercent = Math.min(100, Math.round((day.studyMins / maxMins) * 100));
            const dayLabel = new Date(day.date).toLocaleDateString("vi-VN", { weekday: "short" });

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.studyMins}m
                </span>

                <div className="w-full bg-muted rounded-xl h-full flex items-end overflow-hidden p-0.5">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-lg transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                <span className="text-[10px] font-semibold text-muted-foreground uppercase">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

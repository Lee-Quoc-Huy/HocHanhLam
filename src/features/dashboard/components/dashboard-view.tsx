"use client";

import type { DashboardData } from "../types";
import { DashboardHeader } from "./dashboard-header";
import { LearningProgressSection } from "./language-progress";
import { DailyMissionSection } from "./daily-missions";
import { ActivityHeatmapSection } from "./activity-heatmap";
import { TodayReviewSection } from "./today-review";
import { QuickFlashcardSection } from "./quick-flashcard";
import { RecentDocumentsSection } from "./recent-documents";
import { AiRecommendationSection } from "./ai-recommendations";
import { LearningStatsSection } from "./learning-stats";

/**
 * Layout: a responsive "bento" grid.
 * - Mobile: single column, most important first (missions/review keep
 *   people acting, heavy stats sink lower).
 * - Desktop (lg+): a 12-col grid so wide sections (progress, heatmap,
 *   recommendations, stats) span the full width while paired sections
 *   (missions/review, flashcard/documents) sit side by side.
 */
export function DashboardView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-5 pb-8">
      <DashboardHeader userName={data.userName} stats={data.stats} />

      <AiRecommendationSection recommendations={data.recommendations} />

      <LearningProgressSection languages={data.languages} />

      <div className="grid gap-5 lg:grid-cols-2">
        <DailyMissionSection missions={data.missions} />
        <TodayReviewSection reviews={data.reviews} />
      </div>

      <ActivityHeatmapSection days={data.heatmap} />

      <div className="grid gap-5 lg:grid-cols-2">
        <QuickFlashcardSection flashcards={data.flashcards} />
        <RecentDocumentsSection documents={data.documents} />
      </div>

      <LearningStatsSection stats={data.stats} />
    </div>
  );
}

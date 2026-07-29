import type { ActivityLevel, DashboardData, HeatmapDay } from "../types";

/**
 * PLACEHOLDER DATA — mirrors the same intentional stance as the previous
 * dashboard page: the learning-domain schema (srs_reviews, documents,
 * missions, ...) doesn't exist in Supabase yet, so this module fabricates a
 * realistic, deterministic snapshot. Swap for real queries once those
 * tables land — the component tree below only depends on the `DashboardData`
 * shape, not on where it comes from.
 */

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildHeatmap(): HeatmapDay[] {
  const rand = seededRandom(42);
  const days: HeatmapDay[] = [];
  const totalDays = 7 * 18; // ~18 weeks
  const today = new Date();

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const roll = rand();
    let level: ActivityLevel = 0;
    let minutes = 0;
    if (roll > 0.85) {
      level = 4;
      minutes = 45 + Math.round(rand() * 40);
    } else if (roll > 0.65) {
      level = 3;
      minutes = 25 + Math.round(rand() * 15);
    } else if (roll > 0.42) {
      level = 2;
      minutes = 10 + Math.round(rand() * 12);
    } else if (roll > 0.22) {
      level = 1;
      minutes = 2 + Math.round(rand() * 8);
    }
    days.push({ date: d.toISOString().slice(0, 10), level, minutes });
  }
  // Force a strong recent streak so the "current streak" stat feels alive
  for (let i = 1; i <= 6; i++) {
    const day = days[days.length - i];
    if (!day) continue;
    day.level = (2 + (i % 3)) as ActivityLevel;
    day.minutes = 18 + i * 4;
  }
  return days;
}

export function getDashboardData(userName = "Minh"): DashboardData {
  return {
    userName,
    languages: [
      {
        code: "en",
        level: "B2 · Upper-Intermediate",
        xp: 3120,
        xpToNext: 4000,
        wordsLearned: 1840,
        wordsGoal: 2500,
        weeklyDeltaPct: 6.4,
      },
      {
        code: "ko",
        level: "A2 · Elementary",
        xp: 980,
        xpToNext: 1500,
        wordsLearned: 420,
        wordsGoal: 1000,
        weeklyDeltaPct: 12.1,
      },
      {
        code: "zh",
        level: "A1 · Beginner",
        xp: 260,
        xpToNext: 800,
        wordsLearned: 95,
        wordsGoal: 500,
        weeklyDeltaPct: 21.3,
      },
    ],
    missions: [
      {
        id: "m1",
        title: "Review 20 flashcards",
        description: "Spaced-repetition queue across all languages",
        xp: 30,
        done: true,
        progress: 20,
        target: 20,
        icon: "flashcards",
      },
      {
        id: "m2",
        title: "Read 1 article",
        description: "Any saved document, 5+ minutes",
        xp: 25,
        done: true,
        progress: 1,
        target: 1,
        icon: "reading",
      },
      {
        id: "m3",
        title: "Listening practice — 10 min",
        description: "Podcast or shadowing audio",
        xp: 20,
        done: false,
        progress: 4,
        target: 10,
        icon: "listening",
      },
      {
        id: "m4",
        title: "Write 3 sentences",
        description: "Using today's new vocabulary",
        xp: 20,
        done: false,
        progress: 1,
        target: 3,
        icon: "writing",
      },
      {
        id: "m5",
        title: "Clear the review queue",
        description: "Finish everything due today",
        xp: 35,
        done: false,
        progress: 12,
        target: 18,
        icon: "review",
      },
    ],
    heatmap: buildHeatmap(),
    reviews: [
      { id: "r1", term: "procrastinate", translation: "trì hoãn", language: "en", dueLabel: "Due now", interval: "Interval: 6d" },
      { id: "r2", term: "억울하다", reading: "eok-ul-ha-da", translation: "cảm thấy oan ức", language: "ko", dueLabel: "Due now", interval: "Interval: 2d" },
      { id: "r3", term: "谦虚", reading: "qiānxū", translation: "khiêm tốn", language: "zh", dueLabel: "Due now", interval: "Interval: 1d" },
      { id: "r4", term: "albeit", translation: "mặc dù", language: "en", dueLabel: "In 2 hours", interval: "Interval: 10d" },
      { id: "r5", term: "눈치", reading: "nun-chi", translation: "sự nhạy bén xã giao", language: "ko", dueLabel: "In 3 hours", interval: "Interval: 4d" },
      { id: "r6", term: "顺其自然", reading: "shùn qí zì rán", translation: "thuận theo tự nhiên", language: "zh", dueLabel: "Tomorrow", interval: "Interval: 1d" },
    ],
    flashcards: [
      {
        id: "f1",
        language: "en",
        front: "procrastinate",
        back: "trì hoãn, chần chừ",
        example: "\"Stop procrastinating and start your essay.\"",
      },
      {
        id: "f2",
        language: "ko",
        front: "눈치",
        reading: "nun-chi",
        back: "sự nhạy bén, khả năng đọc không khí xã giao",
        example: "그는 눈치가 빠르다 — Anh ấy rất nhạy bén.",
      },
      {
        id: "f3",
        language: "zh",
        front: "顺其自然",
        reading: "shùn qí zì rán",
        back: "thuận theo tự nhiên, để mọi việc diễn ra tự nhiên",
        example: "凡事顺其自然就好 — Mọi việc cứ thuận theo tự nhiên là được.",
      },
    ],
    documents: [
      { id: "d1", title: "The Economist — AI & Jobs", type: "article", language: "en", updatedLabel: "2 hours ago", progressPct: 72 },
      { id: "d2", title: "TOPIK II 실전 모의고사 3회", type: "pdf", language: "ko", updatedLabel: "Yesterday", progressPct: 45 },
      { id: "d3", title: "HSK4 听力练习 — Unit 6", type: "audio", language: "zh", updatedLabel: "2 days ago", progressPct: 90 },
      { id: "d4", title: "My irregular verbs notes", type: "note", language: "en", updatedLabel: "3 days ago", progressPct: 100 },
    ],
    recommendations: [
      {
        id: "a1",
        title: "Review \"phrasal verbs with take\" before they decay",
        reason: "12 cards are entering their forgetting curve drop-off in the next 24h.",
        actionLabel: "Start focused review",
        language: "en",
        confidencePct: 92,
      },
      {
        id: "a2",
        title: "Try a shorter Korean listening clip today",
        reason: "Your listening completion rate dropped 18% this week — shorter clips tend to raise it back up.",
        actionLabel: "Pick a 3-min clip",
        language: "ko",
        confidencePct: 78,
      },
      {
        id: "a3",
        title: "You're ready for HSK4 Unit 7",
        reason: "97% accuracy on Unit 6 vocabulary over the last 3 sessions.",
        actionLabel: "Unlock next unit",
        language: "zh",
        confidencePct: 85,
      },
    ],
    stats: {
      currentStreak: 14,
      bestStreak: 41,
      totalWords: 2355,
      totalMinutesThisWeek: 263,
      accuracyPct: 88,
      weeklyMinutes: [
        { day: "Mon", minutes: 32 },
        { day: "Tue", minutes: 48 },
        { day: "Wed", minutes: 21 },
        { day: "Thu", minutes: 55 },
        { day: "Fri", minutes: 40 },
        { day: "Sat", minutes: 60 },
        { day: "Sun", minutes: 7 },
      ],
    },
  };
}

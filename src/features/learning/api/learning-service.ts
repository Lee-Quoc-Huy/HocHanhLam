import { createClient } from "@/lib/supabase/client";
import type {
  UserGamification,
  LeaderboardEntry,
  ChallengeItem,
  GameResult,
  QuizQuestion,
  SentenceBuilderQuestion,
  MatchingPair,
  TypingTarget,
} from "../types";

const STORAGE_GAMIFICATION_KEY = "linguaverse_user_gamification";
const STORAGE_CHALLENGES_KEY = "linguaverse_user_challenges";

export const MOCK_GAMIFICATION: UserGamification = {
  id: "user-gami-1",
  totalXp: 1250,
  level: 5,
  streakDays: 7,
  gamesPlayed: 14,
  lastActiveDate: new Date().toISOString().slice(0, 10),
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: "u1", userId: "u1", name: "Nguyễn Văn Minh", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80", totalXp: 4850, level: 18, streakDays: 24, rank: 1 },
  { id: "u2", userId: "u2", name: "Trần Thị Mai", avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80", totalXp: 3920, level: 15, streakDays: 19, rank: 2 },
  { id: "u3", userId: "u3", name: "Lê Hoàng Nam", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", totalXp: 2840, level: 11, streakDays: 12, rank: 3 },
  { id: "u4", userId: "u4", name: "Bạn (Học Viên)", avatarUrl: "", totalXp: 1250, level: 5, streakDays: 7, rank: 4 },
];

export const MOCK_CHALLENGES: ChallengeItem[] = [
  { id: "c1", challengeType: "daily", title: "Hoàn thành 2 Trận Game Bất Kỳ", description: "Luyện tập 2 game bất kỳ trong ngày hôm nay", targetCount: 2, currentCount: 1, rewardXp: 50, isCompleted: false, dueDate: new Date(Date.now() + 86400000).toISOString() },
  { id: "c2", challengeType: "daily", title: "Đạt Độ Chính Xác Trên 80%", description: "Hoàn thành 1 bài Quiz đạt chính xác từ 80% trở lên", targetCount: 1, currentCount: 1, rewardXp: 80, isCompleted: true, dueDate: new Date(Date.now() + 86400000).toISOString() },
  { id: "c3", challengeType: "weekly", title: "Thách Thức Tuần: Tích Lũy 500 XP", description: "Chiến thắng các trò chơi để tích lũy 500 XP trong tuần", targetCount: 500, currentCount: 280, rewardXp: 250, isCompleted: false, dueDate: new Date(Date.now() + 86400000 * 7).toISOString() },
];

// Content datasets for games
export const SAMPLE_QUIZZES: Record<string, QuizQuestion[]> = {
  quiz: [
    { id: "q1", question: "Từ nào đồng nghĩa với 'Serendipity'?", options: ["Luck / Coincidence", "Catastrophe", "Oblivion", "Reluctance"], correctAnswer: 0, explanation: "Serendipity có nghĩa là sự tình cờ may mắn.", category: "general" },
    { id: "q2", question: "Ý nghĩa ngữ pháp của 'Used to + V' là gì?", options: ["Thói quen ở hiện tại", "Thói quen trong quá khứ đã chấm dứt", "Dự định trong tương lai", "Khả năng xảy ra"], correctAnswer: 1, explanation: "Used to + V chỉ thói quen trong quá khứ nay không còn nữa.", category: "grammar" },
  ],
  listening_quiz: [
    { id: "l1", question: "Nghe & Chọn đáp án đúng: 'Climate resilience is the ability of a system to absorb disturbances.'", options: ["Khả năng hấp thụ biến động của hệ thống", "Sự suy giảm đa dạng sinh học", "Quá trình tái tạo năng lượng", "Tốc độ phát triển công nghiệp"], correctAnswer: 0, explanation: "Climate resilience là khả năng chống chịu khí hậu.", category: "listening" },
  ],
  grammar_quiz: [
    { id: "g1", question: "Chọn từ đúng: She is looking forward to _______ you.", options: ["see", "seeing", "saw", "seen"], correctAnswer: 1, explanation: "Look forward to + V-ing.", category: "grammar" },
  ],
  vocabulary_quiz: [
    { id: "v1", question: "Nghĩa của từ tiếng Hàn '설레다' là gì?", options: ["Hồi hộp, xao xuyến", "Tức giận, bất an", "Buồn bã, cô đơn", "Mệt mỏi, chán nản"], correctAnswer: 0, explanation: "설레다 (seol-le-da) chỉ cảm giác hồi hộp, xao xuyến vui vẻ.", category: "vocabulary" },
  ],
};

export const SAMPLE_SENTENCE_BUILDER: SentenceBuilderQuestion[] = [
  { id: "sb1", originalSentence: "We found this cafe by pure serendipity.", translation: "Chúng tôi tìm thấy quán cà phê này nhờ sự tình cờ may mắn.", words: ["We", "found", "this", "cafe", "by", "pure", "serendipity."] },
  { id: "sb2", originalSentence: "She is looking forward to seeing you.", translation: "Cô ấy rất mong chờ được gặp bạn.", words: ["She", "is", "looking", "forward", "to", "seeing", "you."] },
];

export const SAMPLE_MATCHING_PAIRS: MatchingPair[] = [
  { id: "m1", term: "Serendipity", definition: "Sự tình cờ may mắn" },
  { id: "m2", term: "Resilient", definition: "Kiên cường, dẻo dai" },
  { id: "m3", term: "설레다", definition: "Hồi hộp xao xuyến" },
  { id: "m4", term: "坚持", definition: "Kiên trì giữ vững" },
];

export const SAMPLE_TYPING_TARGETS: TypingTarget[] = [
  { id: "t1", text: "Practice makes perfect when learning new languages every single day.", translation: "Có công mài sắt có ngày nên kim khi học ngôn ngữ mới mỗi ngày.", language: "en" },
  { id: "t2", text: "내일 여행을 가려고 하니까 마음이 설렌다.", translation: "Vì ngày mai đi du lịch nên lòng tôi thấy rất hồi hộp xao xuyến.", language: "ko" },
];

class LearningService {
  private getLocalGamification(): UserGamification {
    if (typeof window === "undefined") return MOCK_GAMIFICATION;
    try {
      const data = localStorage.getItem(STORAGE_GAMIFICATION_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_GAMIFICATION_KEY, JSON.stringify(MOCK_GAMIFICATION));
        return MOCK_GAMIFICATION;
      }
      return JSON.parse(data);
    } catch {
      return MOCK_GAMIFICATION;
    }
  }

  private setLocalGamification(gami: UserGamification) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_GAMIFICATION_KEY, JSON.stringify(gami));
    } catch (e) {
      console.error("Localstorage error saving gamification:", e);
    }
  }

  private getLocalChallenges(): ChallengeItem[] {
    if (typeof window === "undefined") return MOCK_CHALLENGES;
    try {
      const data = localStorage.getItem(STORAGE_CHALLENGES_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(MOCK_CHALLENGES));
        return MOCK_CHALLENGES;
      }
      return JSON.parse(data);
    } catch {
      return MOCK_CHALLENGES;
    }
  }

  private setLocalChallenges(challenges: ChallengeItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(challenges));
    } catch (e) {
      console.error("Localstorage error saving challenges:", e);
    }
  }

  async fetchUserGamification(): Promise<UserGamification> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("user_gamification").select("*").single();
      if (error || !data) return this.getLocalGamification();

      const gami: UserGamification = {
        id: data.id,
        userId: data.user_id,
        totalXp: data.total_xp,
        level: data.level,
        streakDays: data.streak_days,
        gamesPlayed: data.games_played,
        lastActiveDate: data.last_active_date,
      };
      this.setLocalGamification(gami);
      return gami;
    } catch {
      return this.getLocalGamification();
    }
  }

  async submitGameResult(result: GameResult): Promise<UserGamification> {
    const current = this.getLocalGamification();
    const newTotalXp = current.totalXp + result.xpEarned;
    const newLevel = Math.floor(newTotalXp / 250) + 1;
    const newGamesPlayed = current.gamesPlayed + 1;

    const updated: UserGamification = {
      ...current,
      totalXp: newTotalXp,
      level: newLevel,
      gamesPlayed: newGamesPlayed,
    };

    const supabase = createClient();
    try {
      await supabase.from("game_scores").insert([
        {
          game_mode: result.gameMode,
          score: result.score,
          xp_earned: result.xpEarned,
          accuracy: result.accuracy,
          time_seconds: result.timeSeconds,
        },
      ]);
    } catch {
      // Offline fallback
    }

    this.setLocalGamification(updated);
    return updated;
  }

  async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    const currentGami = this.getLocalGamification();
    const list = [...MOCK_LEADERBOARD];
    const userIdx = list.findIndex((u) => u.userId === "u4");
    if (userIdx !== -1 && list[userIdx]) {
      list[userIdx].totalXp = currentGami.totalXp;
      list[userIdx].level = currentGami.level;
    }
    list.sort((a, b) => b.totalXp - a.totalXp);
    list.forEach((u, idx) => (u.rank = idx + 1));
    return list;
  }

  async fetchChallenges(): Promise<ChallengeItem[]> {
    return this.getLocalChallenges();
  }
}

export const learningService = new LearningService();

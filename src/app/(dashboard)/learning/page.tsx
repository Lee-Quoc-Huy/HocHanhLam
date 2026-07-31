"use client";

import { useLearningGame } from "@/features/learning/hooks/use-learning-game";
import { LearningHeader } from "@/features/learning/components/learning-header";
import { ChallengeBanner } from "@/features/learning/components/challenge-banner";
import { QuizGame } from "@/features/learning/components/quiz-game";
import { SentenceBuilderGame } from "@/features/learning/components/sentence-builder-game";
import { MatchingGame } from "@/features/learning/components/matching-game";
import { MemoryGame } from "@/features/learning/components/memory-game";
import { TypingGame } from "@/features/learning/components/typing-game";
import { LeaderboardModal } from "@/features/learning/components/leaderboard-modal";
import { GameMode } from "@/features/learning/types";
import {
  HelpCircle,
  Volume2,
  BookMarked,
  BookOpenText,
  Puzzle,
  Layers,
  Brain,
  Keyboard,
  Sparkles,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const GAME_CARDS: {
  id: GameMode;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  xpReward: string;
}[] = [
  {
    id: "quiz",
    title: "Quiz Trắc Nghiệm Tổng Hợp",
    subtitle: "Trắc nghiệm nhiều lựa chọn",
    description: "Bài kiểm tra trắc nghiệm 4 lựa chọn thử thách kiến thức tổng hợp.",
    icon: HelpCircle,
    color: "from-purple-500/20 via-purple-500/10 to-transparent text-purple-600 border-purple-500/20",
    xpReward: "+70 XP",
  },
  {
    id: "listening_quiz",
    title: "Listening Quiz Luyện Nghe",
    subtitle: "Luyện nghe âm thanh",
    description: "Nghe phát âm mẫu và lựa chọn đáp án câu hội thoại phù hợp.",
    icon: Volume2,
    color: "from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-600 border-emerald-500/20",
    xpReward: "+80 XP",
  },
  {
    id: "grammar_quiz",
    title: "Grammar Quiz Ngữ Pháp",
    subtitle: "Thử thách mẫu câu ngữ pháp",
    description: "Luyện tập phân tích mẫu câu & điền từ vào chỗ trống đúng cấu trúc.",
    icon: BookMarked,
    color: "from-indigo-500/20 via-indigo-500/10 to-transparent text-indigo-600 border-indigo-500/20",
    xpReward: "+75 XP",
  },
  {
    id: "vocabulary_quiz",
    title: "Vocabulary Quiz Từ Vựng",
    subtitle: "Kiểm tra liên tưởng từ vựng",
    description: "Kiểm tra vốn từ vựng, chọn nghĩa tiếng Việt & từ đồng nghĩa.",
    icon: BookOpenText,
    color: "from-rose-500/20 via-rose-500/10 to-transparent text-rose-600 border-rose-500/20",
    xpReward: "+75 XP",
  },
  {
    id: "sentence_builder",
    title: "Ghép Câu Hoàn Chỉnh",
    subtitle: "Trò chơi sắp xếp từ",
    description: "Kéo chọn các thẻ từ vựng xáo trộn để xếp thành câu hoàn chỉnh.",
    icon: Puzzle,
    color: "from-amber-500/20 via-amber-500/10 to-transparent text-amber-600 border-amber-500/20",
    xpReward: "+90 XP",
  },
  {
    id: "matching_game",
    title: "Matching Game Ghép Thẻ",
    subtitle: "Nối từ với nghĩa",
    description: "Nối cặp từ vựng với nghĩa tiếng Việt tương ứng nhanh nhất.",
    icon: Layers,
    color: "from-blue-500/20 via-blue-500/10 to-transparent text-blue-600 border-blue-500/20",
    xpReward: "+100 XP",
  },
  {
    id: "memory_game",
    title: "Memory Game Lật Thẻ",
    subtitle: "Lật thẻ ghi nhớ 3D",
    description: "Lật các thẻ bài úp để tìm cặp từ vựng trùng khớp trí nhớ.",
    icon: Brain,
    color: "from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-600 border-cyan-500/20",
    xpReward: "+120 XP",
  },
  {
    id: "typing_game",
    title: "Luyện Gõ Tốc Độ",
    subtitle: "Gõ nhanh và chính xác",
    description: "Luyện gõ bàn phím chính xác câu tiếng Anh/Hàn/Trung theo thời gian.",
    icon: Keyboard,
    color: "from-teal-500/20 via-teal-500/10 to-transparent text-teal-600 border-teal-500/20",
    xpReward: "+110 XP",
  },
];

export default function LearningPage() {
  const {
    activeGameMode,
    gamification,
    leaderboard,
    challenges,
    isLeaderboardOpen,
    lastGameResult,
    startGame,
    endGame,
    exitGame,
    setLeaderboardOpen,
  } = useLearningGame();

  // If a game is active, render the specific game view
  if (activeGameMode) {
    if (
      activeGameMode === "quiz" ||
      activeGameMode === "listening_quiz" ||
      activeGameMode === "grammar_quiz" ||
      activeGameMode === "vocabulary_quiz"
    ) {
      return <QuizGame mode={activeGameMode} onFinish={endGame} onExit={exitGame} />;
    }

    if (activeGameMode === "sentence_builder") {
      return <SentenceBuilderGame onFinish={endGame} onExit={exitGame} />;
    }

    if (activeGameMode === "matching_game") {
      return <MatchingGame onFinish={endGame} onExit={exitGame} />;
    }

    if (activeGameMode === "memory_game") {
      return <MemoryGame onFinish={endGame} onExit={exitGame} />;
    }

    if (activeGameMode === "typing_game") {
      return <TypingGame onFinish={endGame} onExit={exitGame} />;
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Banner & Gamification Stats */}
      <LearningHeader
        gamification={gamification}
        onOpenLeaderboard={() => setLeaderboardOpen(true)}
      />

      {/* Finished Game Score & XP Award Banner */}
      {lastGameResult && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-emerald-700 dark:text-emerald-300">
                Chúc Mừng! Bạn Đã Hoàn Thành {lastGameResult.gameMode.replace("_", " ").toUpperCase()} 🎉
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Chính xác: {lastGameResult.accuracy}% · Thời gian: {lastGameResult.timeSeconds}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2 border border-amber-500/30">
            <Zap className="size-5 text-amber-500" />
            <span className="font-display text-lg font-bold text-amber-600 dark:text-amber-400">
              +{lastGameResult.xpEarned} XP
            </span>
          </div>
        </div>
      )}

      {/* Daily & Weekly Challenges Banner */}
      <ChallengeBanner challenges={challenges} />

      {/* Game Modes Cards Grid */}
      <div className="space-y-3">
        <h3 className="font-display text-base font-bold text-foreground">
          Chọn Trò Chơi Học Tập & Luyện Tập AI
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GAME_CARDS.map((game) => {
            const Icon = game.icon;

            return (
              <div
                key={game.id}
                className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex size-10 items-center justify-center rounded-xl border bg-gradient-to-br ${game.color}`}>
                      <Icon className="size-5" />
                    </div>

                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {game.xpReward}
                    </span>
                  </div>

                  <h4 className="mt-4 font-display text-base font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                    {game.title}
                  </h4>
                  <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {game.subtitle}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <Button
                  onClick={() => startGame(game.id)}
                  className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs gap-1.5"
                >
                  <Sparkles className="size-3.5" /> Bắt Đầu Chơi
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        leaderboard={leaderboard}
      />
    </div>
  );
}

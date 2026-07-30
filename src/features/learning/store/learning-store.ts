"use client";

import { create } from "zustand";
import {
  GameMode,
  UserGamification,
  LeaderboardEntry,
  ChallengeItem,
  GameResult,
} from "../types";
import { learningService, MOCK_GAMIFICATION } from "../api/learning-service";

interface LearningState {
  activeGameMode: GameMode | null;
  gamification: UserGamification;
  leaderboard: LeaderboardEntry[];
  challenges: ChallengeItem[];

  isLeaderboardOpen: boolean;
  lastGameResult: GameResult | null;

  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUserData: () => Promise<void>;
  startGame: (mode: GameMode) => void;
  endGame: (result: GameResult) => Promise<void>;
  exitGame: () => void;

  setLeaderboardOpen: (open: boolean) => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  activeGameMode: null,
  gamification: MOCK_GAMIFICATION,
  leaderboard: [],
  challenges: [],

  isLeaderboardOpen: false,
  lastGameResult: null,

  isLoading: false,
  error: null,

  fetchUserData: async () => {
    set({ isLoading: true, error: null });
    try {
      const gami = await learningService.fetchUserGamification();
      const leaderboard = await learningService.fetchLeaderboard();
      const challenges = await learningService.fetchChallenges();
      set({ gamification: gami, leaderboard, challenges, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  startGame: (mode) => {
    set({ activeGameMode: mode, lastGameResult: null });
  },

  endGame: async (result) => {
    const updatedGami = await learningService.submitGameResult(result);
    const updatedLeaderboard = await learningService.fetchLeaderboard();
    set({
      gamification: updatedGami,
      leaderboard: updatedLeaderboard,
      lastGameResult: result,
      activeGameMode: null,
    });
  },

  exitGame: () => set({ activeGameMode: null, lastGameResult: null }),

  setLeaderboardOpen: (open) => set({ isLeaderboardOpen: open }),
}));

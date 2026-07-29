"use client";

import { create } from "zustand";
import {
  UserSettings,
  AchievementItem,
  StudyAnalytics,
  SettingsTab,
} from "../types";
import { settingsService, DEFAULT_SETTINGS, MOCK_ANALYTICS } from "../api/settings-service";

interface SettingsState {
  settings: UserSettings;
  activeTab: SettingsTab;
  achievements: AchievementItem[];
  analytics: StudyAnalytics;

  isLoading: boolean;
  isTestingKey: boolean;
  isApiKeyValid: boolean | null;
  saveMessage: string | null;
  error: string | null;

  // Actions
  fetchSettingsData: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  testApiKey: (apiKey: string) => Promise<boolean>;
  exportBackup: () => void;
  importBackup: (jsonText: string) => Promise<boolean>;

  setActiveTab: (tab: SettingsTab) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  activeTab: "profile",
  achievements: [],
  analytics: MOCK_ANALYTICS,

  isLoading: false,
  isTestingKey: false,
  isApiKeyValid: null,
  saveMessage: null,
  error: null,

  fetchSettingsData: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await settingsService.fetchSettings();
      const achievements = await settingsService.fetchAchievements();
      const analytics = await settingsService.fetchAnalytics();
      set({ settings, achievements, analytics, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    const updated = await settingsService.updateSettings(updates);
    set({ settings: updated, saveMessage: "Đã lưu thay đổi cài đặt thành công!" });
    setTimeout(() => set({ saveMessage: null }), 3000);
  },

  testApiKey: async (apiKey) => {
    set({ isTestingKey: true, isApiKeyValid: null });
    const isValid = await settingsService.testApiKey(apiKey);
    set({ isTestingKey: false, isApiKeyValid: isValid });
    return isValid;
  },

  exportBackup: () => {
    settingsService.downloadBackupFile();
  },

  importBackup: async (jsonText) => {
    const success = await settingsService.importBackupData(jsonText);
    if (success) {
      await get().fetchSettingsData();
    }
    return success;
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
}));

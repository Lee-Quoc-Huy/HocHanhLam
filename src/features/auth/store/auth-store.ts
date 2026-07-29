"use client";

/**
 * Client-side auth state. Holds only the UI-facing session snapshot —
 * source of truth is always Supabase; this store is kept in sync by
 * <AuthProvider> via onAuthStateChange and exists so components can read
 * the current user synchronously without prop drilling.
 */

import { create } from "zustand";
import type { AuthUser } from "../types";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, isLoading: false }),
}));

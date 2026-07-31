"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../api/auth-service";
import { useAuthStore } from "../store/auth-store";
import type { LoginInput, RegisterInput, AuthProvider } from "../types";

/**
 * Primary hook for auth actions. Combines React Query (mutation lifecycle:
 * loading/error state, retries) with the Zustand store (session snapshot).
 */
export function useAuth() {
  const router = useRouter();
  const { user, isLoading, clear } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => authService.signInWithPassword(input),
    onSuccess: () => router.push("/vocabulary"),
  });

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => authService.signUpWithPassword(input),
    onSuccess: () => router.push("/vocabulary"),
  });

  const oauthMutation = useMutation({
    mutationFn: (provider: AuthProvider) => authService.signInWithOAuth(provider),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      clear();
      router.push("/login");
      router.refresh();
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    loginWithOAuth: oauthMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}

"use client";

/**
 * Auth feature — client API layer. Wraps Supabase auth calls behind a
 * feature-specific service so UI/hooks never talk to the Supabase SDK
 * directly (keeps the SDK swappable and testable).
 */

import { createClient } from "@/lib/supabase/client";
import type { AuthProvider, LoginInput, RegisterInput } from "../types";

export const authService = {
  async signInWithPassword({ email, password }: LoginInput) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUpWithPassword({ email, password, fullName }: RegisterInput) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  },

  async signInWithOAuth(provider: AuthProvider) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async resetPasswordForEmail(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings/security`,
    });
    if (error) throw error;
  },
};

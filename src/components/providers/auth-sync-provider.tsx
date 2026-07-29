"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/features/auth/store/auth-store";

/**
 * Bridges Supabase's onAuthStateChange stream into the Zustand auth store,
 * so any client component can read `useAuthStore` synchronously instead of
 * awaiting a session check. Mount once near the root.
 */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? null,
              fullName: (session.user.user_metadata?.full_name as string) ?? null,
              avatarUrl: (session.user.user_metadata?.avatar_url as string) ?? null,
            }
          : null,
      );
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? null,
              fullName: (session.user.user_metadata?.full_name as string) ?? null,
              avatarUrl: (session.user.user_metadata?.avatar_url as string) ?? null,
            }
          : null,
      );
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}

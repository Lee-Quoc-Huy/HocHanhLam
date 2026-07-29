"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";

/**
 * Client-side guard for pages that also need Server Component data fetched
 * under the authenticated user. Middleware already blocks unauthenticated
 * requests server-side; this covers the client-render edge case (e.g. after
 * a session expires mid-session).
 */
export function useRequireAuth(redirectTo = "/login") {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, redirectTo, router]);

  return { user, isLoading };
}

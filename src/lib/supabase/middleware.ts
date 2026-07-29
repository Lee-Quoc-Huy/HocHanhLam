import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Personal Web App Session Handler.
 * Keeps Supabase session active if configured, but DOES NOT enforce login
 * so the application can be used as a personal learning workspace without authentication.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request: { headers: request.headers } });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options as CookieOptions),
            );
          },
        },
      });

      await supabase.auth.getUser();
    } catch {
      // Ignore auth errors in personal mode
    }
  }

  const path = request.nextUrl.pathname;

  // For root path, direct the user directly to the Vocabulary module
  if (path === "/") {
    return NextResponse.redirect(new URL("/vocabulary", request.url));
  }

  return response;
}

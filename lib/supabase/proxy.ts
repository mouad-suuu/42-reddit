import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Handles Supabase session cookies for incoming requests.
 * Accepts a NextRequest and returns a NextResponse with any Supabase cookie updates applied.
 * If Supabase environment variables are missing, it becomes a no-op but keeps the app running.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // In skeleton mode we don't require a valid Supabase URL.
  // If env vars are missing or invalid, we just skip Supabase and let the app run.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[supabase] SUPABASE_URL or SUPABASE_ANON_KEY is not set; skipping Supabase session handling."
    );
    return supabaseResponse;
  }

  try {
    createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });
  } catch (err) {
    console.warn(
      "[supabase] Failed to create Supabase server client. This is expected while the skeleton app has placeholder env vars.",
      err instanceof Error ? err.message : err
    );
    return supabaseResponse;
  }

  return supabaseResponse;
}


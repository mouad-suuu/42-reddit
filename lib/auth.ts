import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyToken, extractTokenFromHeader } from "./jwt";
import type { JWTPayload } from "./jwt";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role?: "user" | "admin" | "moderator";
  profile?: any;
}

/**
 * Gets the authenticated user from JWT token or Supabase session.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    // Try to get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (token) {
      try {
        const payload = verifyToken(token);
        const supabase = await createClient();

        // Get profile from database
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", payload.sub)
          .single();

        return {
          id: payload.sub,
          username: payload.username,
          email: payload.email,
          role: (profile?.role as "user" | "admin" | "moderator") || "user",
          profile: profile || null,
        };
      } catch (error) {
        // Token invalid, try Supabase session
        return await getSupabaseUser();
      }
    }

    // Fallback to Supabase session
    return await getSupabaseUser();
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

/**
 * Gets user from Supabase session.
 */
async function getSupabaseUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      username:
        profile?.username ||
        profile?.intra_login ||
        user.email?.split("@")[0] ||
        "user",
      email: user.email || profile?.email || "",
      role: (profile?.role as "user" | "admin" | "moderator") || "user",
      profile: profile || null,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Gets user from Authorization header (for API routes).
 */
export async function getAuthUserFromHeader(
  authHeader: string | null
): Promise<AuthUser | null> {
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", payload.sub)
      .single();

    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      role: (profile?.role as "user" | "admin" | "moderator") || "user",
      profile: profile || null,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Checks if user is an admin.
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin";
}

/**
 * Checks if user is a moderator or admin.
 */
export function isModerator(user: AuthUser | null): boolean {
  return user?.role === "moderator" || user?.role === "admin";
}

/**
 * Checks if user has a specific role.
 */
export function hasRole(
  user: AuthUser | null,
  role: "admin" | "moderator" | "user"
): boolean {
  return user?.role === role;
}

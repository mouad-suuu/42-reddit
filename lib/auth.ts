import { cookies } from "next/headers";
import { verifyToken, extractTokenFromHeader } from "./jwt";
import { prisma } from "./prisma";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  user?: {
    id: string;
    intraId: number | null;
    intraLogin: string;
    displayName: string | null;
    avatarUrl: string | null;
    campus: string | null;
  } | null;
}

/**
 * Gets the authenticated user from JWT token.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      user: user || null,
    };
  } catch (error) {
    console.error("Auth error:", error);
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

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      user: user || null,
    };
  } catch (error) {
    return null;
  }
}

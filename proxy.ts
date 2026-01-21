import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { getAuthUser } from "@/lib/auth";
import { isAdmin } from "@/lib/auth";

/**
 * Public routes that don't require authentication.
 */
const publicRoutes = ["/", "/rules"];

/**
 * Admin-only routes that require admin role.
 */
const adminRoutes = ["/projects/create"];

/**
 * API auth routes that should be accessible without authentication.
 */
const authApiRoutes = [
  "/api/auth/42",
  "/api/auth/callback",
  "/api/auth/session",
];

/**
 * Checks if a path matches a route pattern.
 */
function matchesRoute(pathname: string, route: string): boolean {
  if (route.includes("[id]")) {
    // Handle dynamic routes like /projects/[id]
    const routePattern = route.replace("[id]", "[^/]+");
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(pathname);
  }
  return pathname === route || pathname.startsWith(route + "/");
}

/**
 * Next.js proxy middleware with route protection and authentication.
 * Merges Supabase session handling with RBAC route protection.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes - handle Supabase session but don't require auth
  if (publicRoutes.some((route) => matchesRoute(pathname, route))) {
    return await updateSession(request);
  }

  // Allow auth API routes - handle Supabase session but don't require auth
  if (authApiRoutes.some((route) => pathname.startsWith(route))) {
    return await updateSession(request);
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.match(
      /\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/
    )
  ) {
    return await updateSession(request);
  }

  // Check authentication for protected routes
  const user = await getAuthUser();

  // Redirect to login if not authenticated
  if (!user) {
    const loginUrl = new URL("/api/auth/42", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes
  if (adminRoutes.some((route) => matchesRoute(pathname, route))) {
    if (!isAdmin(user)) {
      // Redirect non-admins to home with error message
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "admin_required");
      return NextResponse.redirect(homeUrl);
    }
  }

  // Allow authenticated users to proceed - continue with Supabase session handling
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - Praxis_new.png (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|Praxis_new.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

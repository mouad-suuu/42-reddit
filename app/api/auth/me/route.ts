import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAuthUser, getAuthUserFromHeader } from "@/lib/auth";

/**
 * Returns the current authenticated user.
 * Supports both cookie-based and header-based authentication.
 */
export async function GET() {
  try {
    // Try header first (for API calls)
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    let user;
    if (authHeader) {
      user = await getAuthUserFromHeader(authHeader);
    } else {
      user = await getAuthUser();
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

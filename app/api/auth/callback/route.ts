import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * Handles 42 OAuth callback, exchanges code for token, fetches user data,
 * and creates/updates user in database via Prisma.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${appUrl}/auth/callback?error=${encodeURIComponent(error)}`
    );
  }

  // Verify state parameter
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;

  if (!state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/auth/callback?error=invalid_state`);
  }

  // Clear state cookie
  cookieStore.delete("oauth_state");

  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth/callback?error=no_code`);
  }

  const clientId = process.env.FORTYTWO_CLIENT_ID;
  const clientSecret = process.env.FORTYTWO_CLIENT_SECRET;
  const redirectUri =
    process.env.FORTYTWO_CALLBACK_URL || `${appUrl}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/auth/callback?error=config_error`);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return NextResponse.redirect(
        `${appUrl}/auth/callback?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user data from 42 API
    const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(
        `${appUrl}/auth/callback?error=user_fetch_failed`
      );
    }

    const intraUser = await userResponse.json();

    // Extract campus name (first campus if multiple)
    const campusName = intraUser.campus?.[0]?.name || null;

    // Upsert user in database using Prisma
    const user = await prisma.user.upsert({
      where: { intraLogin: intraUser.login },
      update: {
        intraId: intraUser.id,
        displayName: `${intraUser.first_name} ${intraUser.last_name}`.trim(),
        avatarUrl: intraUser.image?.link || null,
        campus: campusName,
      },
      create: {
        intraId: intraUser.id,
        intraLogin: intraUser.login,
        displayName: `${intraUser.first_name} ${intraUser.last_name}`.trim(),
        avatarUrl: intraUser.image?.link || null,
        campus: campusName,
      },
    });

    // Generate JWT token for the user
    const token = generateToken({
      sub: user.id,
      username: user.intraLogin,
      email: intraUser.email || "",
    });

    // Redirect to frontend with token
    const response = NextResponse.redirect(
      `${appUrl}/auth/callback?token=${token}`
    );

    // Set session cookie
    response.cookies.set("sb-access-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${appUrl}/auth/callback?error=server_error`);
  }
}

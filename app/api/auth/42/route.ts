import { NextResponse } from "next/server";

/**
 * Initiates 42 Network OAuth flow.
 * Redirects user to 42's authorization endpoint.
 */
export async function GET() {
  const clientId = process.env.FORTYTWO_CLIENT_ID;
  const redirectUri =
    process.env.FORTYTWO_CALLBACK_URL ||
    `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/auth/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: "42 OAuth not configured. Please set FORTYTWO_CLIENT_ID." },
      { status: 500 }
    );
  }

  // Generate state parameter for CSRF protection
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  // Store state in a cookie (you could also use Redis or session storage)
  const response = NextResponse.redirect(
    `https://api.intra.42.fr/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=public&` +
      `state=${state}`
  );

  // Set state cookie (httpOnly for security)
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}

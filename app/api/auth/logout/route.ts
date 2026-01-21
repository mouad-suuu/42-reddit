import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Logs out the user by clearing the session cookie.
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");

  return NextResponse.json({ message: "Logged out successfully" });
}

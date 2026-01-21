import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { generateToken } from "@/lib/jwt";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Handles 42 OAuth callback, exchanges code for token, fetches user data,
 * and creates/updates user in Supabase.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/auth/callback?error=${encodeURIComponent(error)}`
    );
  }

  // Verify state parameter
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;

  if (!state || state !== storedState) {
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/auth/callback?error=invalid_state`
    );
  }

  // Clear state cookie
  cookieStore.delete("oauth_state");

  if (!code) {
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/auth/callback?error=no_code`
    );
  }

  const clientId = process.env.FORTYTWO_CLIENT_ID;
  const clientSecret = process.env.FORTYTWO_CLIENT_SECRET;
  const redirectUri =
    process.env.FORTYTWO_CALLBACK_URL ||
    `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/api/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/auth/callback?error=config_error`
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://api.intra.42.fr/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/auth/callback?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user data from 42 API
    const userResponse = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/auth/callback?error=user_fetch_failed`
      );
    }

    const intraUser = await userResponse.json();

    // Get Supabase client (regular for reads)
    const supabase = await createClient();

    // Get service role client for writes (bypasses RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = serviceRoleKey
      ? createServiceClient(process.env.SUPABASE_URL!, serviceRoleKey)
      : null;

    // Check if user exists by intra_id
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("intra_id", intraUser.id)
      .single();

    let userId: string;
    let profile: any;

    if (existingProfile) {
      // Update existing profile
      userId = existingProfile.id;
      const clientForUpdate = supabaseAdmin || supabase;
      const { data: updatedProfile, error: updateError } = await clientForUpdate
        .from("profiles")
        .update({
          intra_login: intraUser.login,
          intra_image_url: intraUser.image?.link,
          intra_email: intraUser.email,
          display_name: `${intraUser.first_name} ${intraUser.last_name}`.trim(),
          avatar_url: intraUser.image?.link || existingProfile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Profile update error:", updateError);
        return NextResponse.redirect(
          `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/auth/callback?error=update_failed`
        );
      }

      profile = updatedProfile;
    } else {
      // Check if user exists by intra_email
      const { data: emailProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("intra_email", intraUser.email)
        .single();

      if (emailProfile) {
        // Update existing user with 42 info
        userId = emailProfile.id;
        const clientForUpdate = supabaseAdmin || supabase;
        const { data: updatedProfile, error: updateError } =
          await clientForUpdate
            .from("profiles")
            .update({
              intra_id: intraUser.id,
              intra_login: intraUser.login,
              intra_image_url: intraUser.image?.link,
              intra_email: intraUser.email,
              avatar_url: intraUser.image?.link || emailProfile.avatar_url,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .select()
            .single();

        if (updateError) {
          console.error("Profile update error:", updateError);
          return NextResponse.redirect(
            `${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/auth/callback?error=update_failed`
          );
        }

        profile = updatedProfile;
      } else {
        // Create new user
        // First, create user in Supabase Auth (required due to foreign key constraint)
        if (!supabaseAdmin) {
          console.error(
            "SUPABASE_SERVICE_ROLE_KEY is required to create new users"
          );
          return NextResponse.redirect(
            `${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/auth/callback?error=service_role_required`
          );
        }

        // Try to get existing auth user by email first
        const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = usersList?.users?.find(
          (u) => u.email === intraUser.email
        );

        if (existingAuthUser) {
          // Auth user exists, use their ID
          userId = existingAuthUser.id;
          // Check if profile exists (use maybeSingle to avoid errors if not found)
          const { data: existingProfileById, error: profileCheckError } =
            await supabaseAdmin
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .maybeSingle();

          if (existingProfileById) {
            // Profile exists, update it
            const { data: updatedProfile, error: updateError } =
              await supabaseAdmin
                .from("profiles")
                .update({
                  intra_id: intraUser.id,
                  intra_login: intraUser.login,
                  intra_image_url: intraUser.image?.link,
                  intra_email: intraUser.email,
                  display_name:
                    `${intraUser.first_name} ${intraUser.last_name}`.trim(),
                  avatar_url:
                    intraUser.image?.link || existingProfileById.avatar_url,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", userId)
                .select()
                .single();

            if (updateError) {
              console.error("Profile update error:", updateError);
              return NextResponse.redirect(
                `${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/auth/callback?error=update_failed`
              );
            }

            profile = updatedProfile;
          } else {
            // Profile doesn't exist, create it (use upsert to handle race conditions)
            const { data: newProfile, error: profileError } =
              await supabaseAdmin
                .from("profiles")
                .upsert(
                  {
                    id: userId,
                    intra_id: intraUser.id,
                    intra_login: intraUser.login,
                    intra_image_url: intraUser.image?.link,
                    intra_email: intraUser.email,
                    username: intraUser.login,
                    display_name:
                      `${intraUser.first_name} ${intraUser.last_name}`.trim(),
                    avatar_url: intraUser.image?.link,
                    level: 1,
                    total_xp: 0,
                  },
                  {
                    onConflict: "id",
                    ignoreDuplicates: false,
                  }
                )
                .select()
                .single();

            if (profileError) {
              // If it's a duplicate key error, try to fetch the existing profile
              if (profileError.code === "23505") {
                const { data: existingProfile } = await supabaseAdmin
                  .from("profiles")
                  .select("*")
                  .eq("id", userId)
                  .single();

                if (existingProfile) {
                  profile = existingProfile;
                } else {
                  console.error("Profile creation error:", profileError);
                  return NextResponse.redirect(
                    `${
                      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                    }/auth/callback?error=profile_creation_failed`
                  );
                }
              } else {
                console.error("Profile creation error:", profileError);
                return NextResponse.redirect(
                  `${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  }/auth/callback?error=profile_creation_failed`
                );
              }
            } else {
              profile = newProfile;
            }
          }
        } else {
          // Create new auth user
          const { data: authData, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
              email: intraUser.email,
              email_confirm: true,
              user_metadata: {
                intra_id: intraUser.id,
                intra_login: intraUser.login,
                display_name:
                  `${intraUser.first_name} ${intraUser.last_name}`.trim(),
              },
            });

          if (authError || !authData.user) {
            console.error("Auth user creation error:", authError);
            return NextResponse.redirect(
              `${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/auth/callback?error=auth_creation_failed`
            );
          }

          userId = authData.user.id;

          // Create profile using service role client to bypass RLS
          // Use upsert to handle race conditions where profile might already exist
          const { data: newProfile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .upsert(
              {
                id: userId,
                intra_id: intraUser.id,
                intra_login: intraUser.login,
                intra_image_url: intraUser.image?.link,
                intra_email: intraUser.email,
                username: intraUser.login,
                display_name:
                  `${intraUser.first_name} ${intraUser.last_name}`.trim(),
                avatar_url: intraUser.image?.link,
                level: 1,
                total_xp: 0,
              },
              {
                onConflict: "id",
                ignoreDuplicates: false,
              }
            )
            .select()
            .single();

          if (profileError) {
            // If it's a duplicate key error, try to fetch the existing profile
            if (profileError.code === "23505") {
              const { data: existingProfile } = await supabaseAdmin
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

              if (existingProfile) {
                profile = existingProfile;
              } else {
                console.error("Profile creation error:", profileError);
                // Try to clean up the auth user if profile creation fails
                await supabaseAdmin.auth.admin.deleteUser(userId);
                return NextResponse.redirect(
                  `${
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  }/auth/callback?error=profile_creation_failed`
                );
              }
            } else {
              console.error("Profile creation error:", profileError);
              // Try to clean up the auth user if profile creation fails
              await supabaseAdmin.auth.admin.deleteUser(userId);
              return NextResponse.redirect(
                `${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/auth/callback?error=profile_creation_failed`
              );
            }
          } else {
            profile = newProfile;
          }
        }
      }
    }

    // Generate JWT token for the user
    const token = generateToken({
      sub: userId,
      username: profile.username || profile.intra_login,
      email: profile.email || profile.intra_email,
    });

    // Redirect to frontend with token
    const frontendUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = NextResponse.redirect(
      `${frontendUrl}/auth/callback?token=${token}`
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
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/auth/callback?error=server_error`
    );
  }
}

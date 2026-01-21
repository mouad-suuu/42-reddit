"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * OAuth callback page that handles 42 Network authentication redirect.
 * Stores JWT token and refreshes user data.
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      console.error("Authentication error:", error);
      // Clear any existing token
      localStorage.removeItem("auth_token");
      // Redirect to home with error message
      router.push("/?error=auth_failed");
      return;
    }

    if (token) {
      // Store token in localStorage
      localStorage.setItem("auth_token", token);

      // Refresh user data
      refreshUser().then(() => {
        // Redirect to home page
        router.push("/");
      });
    } else {
      // No token, redirect to home
      router.push("/");
    }
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cyan-500 font-mono">Authenticating...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cyan-500 font-mono">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

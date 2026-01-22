"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Hero section for 42 Reddit homepage.
 * Redirects logged-in users to their profile.
 * Shows login CTA for unauthenticated users.
 */
export function Hero() {
  const { theme } = useTheme();
  const { authenticated, loading } = useAuth();
  const router = useRouter();
  const isCyberpunk = theme === "cyberpunk";

  // Redirect authenticated users to profile
  useEffect(() => {
    if (!loading && authenticated) {
      router.push("/profile");
    }
  }, [loading, authenticated, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center">
        <Loader2
          className={`h-12 w-12 animate-spin ${
            isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-primary"
          }`}
        />
      </section>
    );
  }

  // Don't render if authenticated (will redirect)
  if (authenticated) {
    return null;
  }

  return (
    <section className="min-h-[80vh] flex items-center">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo/Brand */}
          <div
            className={`inline-flex items-center justify-center w-24 h-24 mb-8 text-5xl font-display font-black ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border-2 border-[var(--cyber-cyan)] text-[var(--cyber-cyan)]"
                : "bg-card border-4 border-border manga-shadow"
            }`}
          >
            42
          </div>

          {/* Title */}
          <h1
            className={`text-5xl md:text-6xl font-display font-black uppercase mb-6 leading-tight ${
              isCyberpunk ? "cyber-gradient-text" : "text-foreground"
            }`}
          >
            42 Reddit
          </h1>

          {/* Description */}
          <p
            className={`text-xl md:text-2xl mb-4 max-w-xl mx-auto ${
              isCyberpunk ? "text-gray-300" : "text-foreground"
            }`}
          >
            The community platform for{" "}
            <span
              className={
                isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-primary font-bold"
              }
            >
              42 students
            </span>
          </p>

          <p
            className={`text-lg mb-10 max-w-lg mx-auto ${
              isCyberpunk ? "text-gray-500" : "text-muted-foreground"
            }`}
          >
            Share READMEs, discuss projects, ask questions, and help fellow
            students on their 42 journey.
          </p>

          {/* Login CTA */}
          <Button
            asChild
            size="lg"
            className={`text-xl px-12 py-7 font-display font-bold uppercase ${
              isCyberpunk
                ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80 hover:scale-105 transition-transform"
                : "manga-shadow hover:manga-shadow-lg transition-shadow"
            }`}
          >
            <Link href="/api/auth/42">Login with 42</Link>
          </Button>

          {/* Subtle tagline */}
          <p
            className={`mt-8 text-sm font-mono ${
              isCyberpunk ? "text-gray-600" : "text-muted-foreground"
            }`}
          >
            Authenticate with your 42 intra account to join
          </p>
        </div>
      </div>
    </section>
  );
}

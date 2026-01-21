"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Hero section for 42 Reddit homepage.
 * Displays main value prop and CTA to browse projects.
 */
export function Hero() {
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-mono ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border border-[var(--cyber-cyan)] text-[var(--cyber-cyan)]"
                : "bg-card border-2 border-border manga-shadow-sm"
            }`}
          >
            <span className="animate-pulse">●</span>
            <span>A community for 42 students</span>
          </div>

          {/* Title */}
          <h1
            className={`text-5xl md:text-7xl font-display font-black uppercase mb-6 leading-tight ${
              isCyberpunk ? "cyber-gradient-text" : "text-foreground"
            }`}
          >
            Share Your
            <br />
            <span
              className={
                isCyberpunk ? "text-[var(--cyber-purple)]" : "text-manga-seal"
              }
            >
              42 Journey
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-xl md:text-2xl mb-10 max-w-2xl mx-auto ${
              isCyberpunk ? "text-gray-400" : "text-muted-foreground"
            }`}
          >
            Discover READMEs, tips, and discussions about 42 projects. Learn
            from peers who&apos;ve been there.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className={`text-lg px-8 py-6 font-display font-bold uppercase ${
                isCyberpunk
                  ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80"
                  : "manga-shadow hover:manga-shadow-lg"
              }`}
            >
              <Link href="/42-projects">Browse Projects</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className={`text-lg px-8 py-6 font-display font-bold uppercase ${
                isCyberpunk
                  ? "border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)] hover:text-[var(--cyber-cyan)]"
                  : ""
              }`}
            >
              <Link href="/api/auth/42">Login with 42</Link>
            </Button>
          </div>

          {/* Stats teaser */}
          <div
            className={`mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto ${
              isCyberpunk
                ? "border-t border-[var(--cyber-border)] pt-8"
                : "border-t-2 border-border pt-8"
            }`}
          >
            <div>
              <div
                className={`text-3xl font-display font-black ${
                  isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                }`}
              >
                15+
              </div>
              <div
                className={`text-sm uppercase font-bold ${
                  isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}
              >
                Projects
              </div>
            </div>
            <div>
              <div
                className={`text-3xl font-display font-black ${
                  isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                }`}
              >
                —
              </div>
              <div
                className={`text-sm uppercase font-bold ${
                  isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}
              >
                READMEs
              </div>
            </div>
            <div>
              <div
                className={`text-3xl font-display font-black ${
                  isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                }`}
              >
                —
              </div>
              <div
                className={`text-sm uppercase font-bold ${
                  isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}
              >
                Students
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

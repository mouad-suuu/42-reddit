"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Call-to-action section for the home page.
 * Shows different buttons based on authentication state.
 */
export function HomeCTA() {
  const { authenticated, loading } = useAuth();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <Card className="p-8 text-center manga-shadow-lg">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 uppercase tracking-wider">
          Ready to <span className="text-accent">Build</span>?
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Explore projects. Read the rules. Join when you're ready.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!loading && (
            <>
              {authenticated ? (
                <Button
                  asChild
                  size="lg"
                  className="manga-shadow hover:manga-shadow-lg"
                >
                  <Link href="/projects">Explore Projects</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="manga-shadow hover:manga-shadow-lg"
                >
                  <Link href="/api/auth/42">Login via 42</Link>
                </Button>
              )}
            </>
          )}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="manga-shadow hover:manga-shadow-lg"
          >
            <a href="/rules">Explore Rules</a>
          </Button>
        </div>
      </Card>
    </section>
  );
}

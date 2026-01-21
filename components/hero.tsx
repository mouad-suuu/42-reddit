"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export function Hero() {
  const { authenticated, loading } = useAuth();
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Cyberpunk: Glow effects */}
      {isCyberpunk && (
        <>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[var(--cyber-cyan)]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-[var(--cyber-purple)]/10 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}
      
      {/* Manga: Decorative corner marks */}
      {!isCyberpunk && (
        <>
          <div className="absolute top-8 left-8 w-12 h-12 border-l-3 border-t-3 border-border"></div>
          <div className="absolute top-8 right-8 w-12 h-12 border-r-3 border-t-3 border-border"></div>
          <div className="absolute bottom-8 left-8 w-12 h-12 border-l-3 border-b-3 border-border"></div>
          <div className="absolute bottom-8 right-8 w-12 h-12 border-r-3 border-b-3 border-border"></div>
        </>
      )}

      <div className="text-center max-w-3xl mx-auto relative z-10">
        {/* Status badge */}
        <div className={`inline-flex items-center px-4 py-2 mb-8 tracking-widest uppercase ${
          isCyberpunk
            ? "border border-[var(--cyber-border)] bg-[var(--cyber-panel)] text-[var(--cyber-cyan)] text-xs font-mono"
            : "border-2 border-border bg-card text-foreground text-xs font-bold rotate-[-1deg] manga-shadow-sm"
        }`}>
          <span className={`w-2 h-2 rounded-full mr-3 ${
            isCyberpunk 
              ? "bg-[var(--cyber-cyan)] animate-pulse" 
              : "bg-primary"
          }`}></span>
          System Online
        </div>
        
        <h1 className={`text-5xl md:text-7xl font-display font-black mb-6 leading-tight ${
          isCyberpunk 
            ? "text-white" 
            : "text-foreground uppercase tracking-tight"
        }`}>
          {isCyberpunk ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cyber-cyan)] to-[var(--cyber-purple)]">
              Praxis
            </span>
          ) : (
            "Praxis"
          )}
        </h1>
        
        <p className={`text-xl mb-4 uppercase tracking-wider ${
          isCyberpunk
            ? "text-[var(--cyber-cyan)] font-mono"
            : "text-foreground font-bold"
        }`}>
          The project incubator club at 1337 Rabat.
        </p>
        
        <p className={`text-lg mb-10 max-w-2xl mx-auto ${
          isCyberpunk
            ? "text-gray-400 font-light"
            : "text-muted-foreground"
        }`}>
          We build large, real software projects — not tutorials, not clones —
          and we build them the way the industry actually works.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!loading && (
            <>
              {authenticated ? (
                <Button
                  asChild
                  size="lg"
                  className={isCyberpunk
                    ? "px-8 py-4 bg-[var(--cyber-cyan)] text-black font-bold text-lg uppercase tracking-widest hover:shadow-[0_0_5px_var(--cyber-cyan),0_0_10px_var(--cyber-cyan)] transition-all clip-corner"
                    : "manga-shadow hover:manga-shadow-lg"
                  }
                >
                  <Link href="/projects">Explore Projects</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className={isCyberpunk
                    ? "px-8 py-4 bg-[var(--cyber-cyan)] text-black font-bold text-lg uppercase tracking-widest hover:shadow-[0_0_5px_var(--cyber-cyan),0_0_10px_var(--cyber-cyan)] transition-all clip-corner"
                    : "manga-shadow hover:manga-shadow-lg"
                  }
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
            className={isCyberpunk
              ? "px-8 py-4 bg-transparent border border-[var(--cyber-purple)] text-[var(--cyber-purple)] font-bold text-lg uppercase tracking-widest hover:bg-[var(--cyber-purple)] hover:text-white hover:shadow-[0_0_5px_var(--cyber-purple),0_0_10px_var(--cyber-purple)] transition-all clip-corner"
              : "manga-shadow hover:manga-shadow-lg"
            }
          >
            <Link href="/rules">Explore Rules</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

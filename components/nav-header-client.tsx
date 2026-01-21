"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/ThemeContext";

export function NavHeaderClient() {
  const { user, authenticated, loading } = useAuth();
  const { theme } = useTheme();
  
  const logoSrc = theme === "cyberpunk" ? "/Praxis_cyberpunk.png" : "/Praxis_manga.png";

  const isCyberpunk = theme === "cyberpunk";

  return (
    <nav className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
      isCyberpunk 
        ? "bg-[var(--cyber-dark)]/90 backdrop-blur-md border-[var(--cyber-border)]" 
        : "bg-card border-b-2 border-border"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center cursor-pointer">
            <div className="mr-3 flex items-center">
              <Image
                src={logoSrc}
                alt="Logo"
                width={64}
                height={64}
                className="object-contain w-12 h-12 transition-opacity duration-300"
              />
            </div>
            <span className={`font-display font-bold text-2xl tracking-wider ${
              isCyberpunk ? "text-white" : "text-foreground"
            }`}>
              42 Reddit
            </span>
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className={`px-3 py-2 text-sm transition-colors uppercase tracking-widest border-b-2 border-transparent ${
                  isCyberpunk
                    ? "font-medium text-gray-400 hover:text-white hover:border-[var(--cyber-cyan)]"
                    : "font-bold text-muted-foreground hover:text-foreground hover:border-primary"
                }`}
              >
                Home
              </Link>
  
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {loading ? (
              <div className={`h-8 w-8 animate-pulse ${
                isCyberpunk 
                  ? "bg-gray-700" 
                  : "bg-muted border-2 border-border"
              }`} />
            ) : authenticated && user ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className={`text-sm font-medium ${
                    isCyberpunk ? "text-white" : "text-foreground"
                  }`}>
                    {user.profile?.displayName || user.username}
                  </span>
                  {user.profile?.campus && (
                    <span className={`text-xs ${
                      isCyberpunk ? "text-gray-400" : "text-muted-foreground"
                    }`}>
                      {user.profile.campus}
                    </span>
                  )}
                </div>
   
                <Avatar className={`h-9 w-9 cursor-pointer ${
                  isCyberpunk 
                    ? "border border-gray-600 overflow-hidden" 
                    : "theme-shadow-sm"
                }`}>
                  <AvatarImage
                    src={user.profile?.avatarUrl || "/placeholder.svg"}
                    alt={user.profile?.displayName || user.username}
                  />
                  <AvatarFallback className={isCyberpunk ? "bg-gray-700 border border-gray-600" : undefined}>
                    {(user.profile?.intraLogin || user.username)
                      ?.slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Button
                asChild
                className={isCyberpunk 
                  ? "bg-transparent border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black px-4 py-1.5 text-sm font-bold uppercase tracking-wider transition-all clip-corner"
                  : undefined
                }
                variant={isCyberpunk ? undefined : "outline"}
                size="sm"
              >
                <Link href="/api/auth/42">LOGIN WITH 42</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

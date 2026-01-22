"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { FolderOpen, User, LogOut, LayoutDashboard } from "lucide-react";

/**
 * Client-side navigation header with auth state and navigation links.
 * Shows different nav items based on auth status.
 */
export function NavHeaderClient() {
  const { user, authenticated, loading, logout } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();

  const logoSrc =
    theme === "cyberpunk" ? "/Praxis_cyberpunk.png" : "/Praxis_manga.png";
  const isCyberpunk = theme === "cyberpunk";

  const isAdmin = user?.profile?.role === "ADMIN";

  const navLinks = [
    { href: "/projects", label: "Projects", icon: FolderOpen, authRequired: true },
    { href: "/profile", label: "Profile", icon: User, authRequired: true },
    ...(isAdmin
      ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, authRequired: true }]
      : []),
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        isCyberpunk
          ? "bg-[var(--cyber-dark)]/90 backdrop-blur-md border-[var(--cyber-border)]"
          : "bg-card border-b-2 border-border"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer group">
            <div className="mr-3 flex items-center">
              <Image
                src={logoSrc}
                alt="Logo"
                width={64}
                height={64}
                className="object-contain w-12 h-12 transition-opacity duration-300 group-hover:opacity-80"
              />
            </div>
            <span
              className={cn(
                "font-display font-bold text-2xl tracking-wider",
                isCyberpunk ? "text-white" : "text-foreground"
              )}
            >
              42 Reddit
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              // Skip auth-required links if not authenticated
              if (link.authRequired && !authenticated) return null;

              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all",
                    isCyberpunk
                      ? cn(
                          "border border-transparent",
                          active
                            ? "bg-[var(--cyber-cyan)]/20 border-[var(--cyber-cyan)] text-[var(--cyber-cyan)]"
                            : "text-gray-400 hover:text-white hover:border-[var(--cyber-border)]"
                        )
                      : cn(
                          "border-2 border-transparent",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:border-border"
                        )
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: Theme toggle + Auth */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {loading ? (
              <div
                className={cn(
                  "h-9 w-9 animate-pulse rounded",
                  isCyberpunk ? "bg-gray-700" : "bg-muted border-2 border-border"
                )}
              />
            ) : authenticated && user ? (
              <div className="flex items-center gap-3">
                {/* User info (desktop) */}
                <div className="hidden lg:flex flex-col items-end">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCyberpunk ? "text-white" : "text-foreground"
                    )}
                  >
                    {user.profile?.displayName || user.username}
                  </span>
                  {user.profile?.campus && (
                    <span
                      className={cn(
                        "text-xs",
                        isCyberpunk ? "text-gray-400" : "text-muted-foreground"
                      )}
                    >
                      {user.profile.campus}
                    </span>
                  )}
                </div>

                {/* Avatar link to profile */}
                <Link href="/profile">
                  <Avatar
                    className={cn(
                      "h-9 w-9 cursor-pointer transition-transform hover:scale-105",
                      isCyberpunk
                        ? "border border-gray-600 overflow-hidden"
                        : "theme-shadow-sm"
                    )}
                  >
                    <AvatarImage
                      src={user.profile?.avatarUrl || "/placeholder.svg"}
                      alt={user.profile?.displayName || user.username}
                    />
                    <AvatarFallback
                      className={isCyberpunk ? "bg-gray-700 border border-gray-600" : undefined}
                    >
                      {(user.profile?.intraLogin || user.username)?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* Logout button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className={cn(
                    "h-9 w-9 p-0",
                    isCyberpunk
                      ? "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      : "text-muted-foreground hover:text-destructive"
                  )}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                asChild
                className={cn(
                  isCyberpunk &&
                    "bg-transparent border border-[var(--cyber-cyan)] text-[var(--cyber-cyan)] hover:bg-[var(--cyber-cyan)] hover:text-black px-4 py-1.5 text-sm font-bold uppercase tracking-wider transition-all"
                )}
                variant={isCyberpunk ? undefined : "outline"}
                size="sm"
              >
                <Link href="/api/auth/42">LOGIN WITH 42</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {authenticated && (
          <div className="md:hidden flex items-center gap-2 pb-3 overflow-x-auto">
            {navLinks.map((link) => {
              if (link.authRequired && !authenticated) return null;

              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                    isCyberpunk
                      ? cn(
                          "border",
                          active
                            ? "bg-[var(--cyber-cyan)]/20 border-[var(--cyber-cyan)] text-[var(--cyber-cyan)]"
                            : "border-[var(--cyber-border)] text-gray-400"
                        )
                      : cn(
                          "border-2",
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground"
                        )
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}

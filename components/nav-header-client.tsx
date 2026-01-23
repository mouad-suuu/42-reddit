"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { FolderOpen, User, LogOut, LayoutDashboard } from "lucide-react";

/**
 * Client-side navigation header with auth state and navigation links.
 * Shows different nav items based on auth status.
 * Uses CSS-only theme styling for performance.
 */
export function NavHeaderClient() {
  const { user, authenticated, loading, logout } = useAuth();
  const pathname = usePathname();

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
    <nav className="sticky top-0 z-40 t-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer group">
            <div className="mr-3 flex items-center relative">
              {/* Manga logo - shown by default, hidden in cyberpunk */}
              <Image
                src="/Praxis_manga.png"
                alt="Logo"
                width={64}
                height={64}
                className="object-contain w-12 h-12 group-hover:opacity-80 transition-opacity t-logo-manga"
              />
              {/* Cyberpunk logo - hidden by default, shown in cyberpunk */}
              <Image
                src="/Praxis_cyberpunk.png"
                alt="Logo"
                width={64}
                height={64}
                className="object-contain w-12 h-12 group-hover:opacity-80 transition-opacity t-logo-cyber"
              />
            </div>
            <span className="font-bold tracking-wider t-brand-text">
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
                    active ? "t-nav-link-active" : "t-nav-link"
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
              <div className="h-9 w-9 animate-pulse rounded t-loading-placeholder" />
            ) : authenticated && user ? (
              <div className="flex items-center gap-3">
                {/* User info (desktop) */}
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-sm font-medium t-text-primary">
                    {user.profile?.displayName || user.username}
                  </span>
                  {user.profile?.campus && (
                    <span className="text-xs t-text-muted">
                      {user.profile.campus}
                    </span>
                  )}
                </div>

                {/* Avatar link to profile */}
                <Link href="/profile">
                  <Avatar className="h-9 w-9 cursor-pointer transition-transform hover:scale-105 t-avatar">
                    <AvatarImage
                      src={user.profile?.avatarUrl || "/placeholder.svg"}
                      alt={user.profile?.displayName || user.username}
                    />
                    <AvatarFallback className="t-avatar-fallback">
                      {(user.profile?.intraLogin || user.username)?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                {/* Logout button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="h-9 w-9 p-0 t-logout-btn"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                asChild
                className="t-login-btn"
                variant="outline"
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
                    active ? "t-nav-link-active" : "t-nav-link"
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

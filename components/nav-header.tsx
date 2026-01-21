import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { ThemeToggle } from "./theme-toggle";

/**
 * Server-side navigation header for 42 Reddit.
 * Displays branding, nav links, and user auth state.
 */
export async function NavHeader() {
  const authUser = await getAuthUser();
  const user = authUser ? { id: authUser.id } : null;
  const profile = authUser?.user;

  return (
    <header className="sticky top-0 z-50 border-b-3 border-border bg-card">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-border bg-card">
            <span className="text-lg font-bold">42</span>
          </div>
          <span className="text-xl font-bold font-display text-foreground">Reddit</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-bold transition-colors uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            HOME
          </Link>
          <Link
            href="/projects"
            className="text-sm font-bold transition-colors uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            PROJECTS
          </Link>
          {user && (
            <Link
              href="/profile"
              className="text-sm font-bold transition-colors uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              PROFILE
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && profile ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-xs text-muted-foreground font-mono">
                  @{profile.intraLogin}
                </span>
              </div>
              <Link href="/profile">
                <Avatar className="h-9 w-9 manga-shadow-sm">
                  <AvatarImage
                    src={profile.avatarUrl || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {profile.intraLogin?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <Button
              asChild
              size="sm"
              variant="outline"
            >
              <Link href="/api/auth/42">LOGIN WITH 42</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { getAuthUser, isAdmin } from "@/lib/auth";

export async function NavHeader() {
  const authUser = await getAuthUser();
  const user = authUser ? { id: authUser.id } : null;
  const profile = authUser?.profile;

  return (
    <header className="sticky top-0 z-50 border-b-3 border-border bg-card">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-border bg-card">
            <svg
              className="h-5 w-5 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold font-display text-foreground">Praxis</span>
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
          {user && profile ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-sm text-muted-foreground font-bold">
                  LVL {profile.level}
                </span>
              </div>
              {isAdmin(authUser) && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                >
                  <Link href="/projects/create">+ CREATE</Link>
                </Button>
              )}
              <Link href="/profile">
                <Avatar className="h-9 w-9 manga-shadow-sm">
                  <AvatarImage
                    src={
                      profile.intra_image_url ||
                      profile.avatar_url ||
                      "/placeholder.svg"
                    }
                  />
                  <AvatarFallback>
                    {(profile.intra_login || profile.username)
                      ?.slice(0, 2)
                      .toUpperCase()}
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

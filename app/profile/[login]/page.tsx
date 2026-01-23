"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface UserProfile {
  user: {
    id: number;
    login: string;
    displayName: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    location: string | null;
    correctionPoints: number;
    wallet: number;
    poolMonth: string;
    poolYear: string;
    campus: { id: number; name: string; country: string; city: string } | null;
  };
  cursus: {
    level: number;
    grade: string | null;
    blackholedAt: string | null;
    skills: { id: number; name: string; level: number }[];
  } | null;
  inProgressProjects: {
    id: number;
    projectId: number;
    name: string;
    slug: string;
    status: string;
    teamId: number | null;
    occurrence: number;
    createdAt: string;
    updatedAt: string;
  }[];
  finishedProjects: {
    id: number;
    projectId: number;
    name: string;
    slug: string;
    finalMark: number | null;
    validated: boolean | null;
    markedAt: string | null;
    occurrence: number;
  }[];
  achievements: {
    id: number;
    name: string;
    description: string;
    tier: string;
    kind: string;
    image: string;
  }[];
  stats: {
    totalProjects: number;
    finishedProjects: number;
    inProgressProjects: number;
  };
}

/**
 * Public profile page showing another user's 42 data.
 * Uses CSS-only theming for instant theme switches.
 */
export default function UserProfilePage() {
  const params = useParams();
  const login = params.login as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!login) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/42/users/${encodeURIComponent(login)}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError(`User "${login}" not found`);
          } else {
            throw new Error("Failed to fetch profile");
          }
          return;
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [login]);

  // Status config - using CSS utility classes
  const statusConfig: Record<string, { label: string; className: string }> = {
    in_progress: {
      label: "In Progress",
      className: "text-status-in-progress bg-status-in-progress-bg border-status-in-progress-border",
    },
    searching_a_group: {
      label: "Looking for Team",
      className: "text-status-searching bg-status-searching-bg border-status-searching-border",
    },
    creating_group: {
      label: "Creating Team",
      className: "text-status-searching bg-status-searching-bg border-status-searching-border",
    },
    waiting_for_correction: {
      label: "Awaiting Eval",
      className: "text-status-waiting bg-status-waiting-bg border-status-waiting-border",
    },
    parent: {
      label: "Parent Project",
      className: "text-status-neutral bg-status-neutral-bg border-status-neutral-border",
    },
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="font-mono t-text-accent">
            Loading profile for @{login}...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="text-center py-20 bg-card border-2 border-destructive manga-shadow">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2 text-foreground">
            {error}
          </h3>
          <p className="mb-4 text-muted-foreground">
            Check the login and try again.
          </p>
          <Button asChild>
            <Link href="/profile">Back to My Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { user, cursus, inProgressProjects, finishedProjects, stats } = profile;

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm font-mono text-muted-foreground">
        <Link href="/profile" className="hover:underline t-text-accent">
          Profile
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">@{user.login}</span>
      </div>

      {/* Profile Header */}
      <div className="p-8 mb-8 bg-card border-2 border-border manga-shadow">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 manga-shadow">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl font-bold">
                {user.login.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-display font-black uppercase mb-1 text-foreground">
                {user.displayName}
              </h1>
              <p className="text-lg font-mono text-muted-foreground">
                @{user.login}
              </p>
              {user.campus && (
                <p className="text-sm mt-1 text-muted-foreground">
                  📍 {user.campus.name}, {user.campus.country}
                </p>
              )}
              <p className="text-xs mt-1 text-muted-foreground">
                Pool: {user.poolMonth} {user.poolYear}
              </p>
            </div>
          </div>

          {/* Stats - Responsive grid (matching main profile page) */}
          <div className="w-full md:w-auto md:flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {/* Level */}
              {cursus && (
                <div className="text-center p-3 animate-in-up delay-100 bg-secondary border-2 border-border">
                  <div className="text-2xl md:text-3xl font-display font-black text-foreground">
                    {cursus.level.toFixed(2)}
                  </div>
                  <div className="text-xs uppercase font-bold text-muted-foreground">
                    Level
                  </div>
                </div>
              )}

              {/* Black Hole */}
              {cursus?.blackholedAt && (
                <div className="text-center p-3 animate-in-up delay-150 bg-status-dev-fail-bg border-2 border-status-dev-fail-border">
                  <div className="text-lg md:text-xl font-mono font-bold text-status-dev-fail">
                    {new Date(cursus.blackholedAt).toLocaleDateString("en-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                  <div className="text-xs uppercase font-bold text-muted-foreground">
                    Black Hole
                  </div>
                </div>
              )}

              {/* Eval Points */}
              <div className="text-center p-3 animate-in-up delay-200 bg-secondary border-2 border-border">
                <div className="text-2xl md:text-3xl font-display font-black text-foreground">
                  {user.correctionPoints}
                </div>
                <div className="text-xs uppercase font-bold text-muted-foreground">
                  Eval Points
                </div>
              </div>

              {/* Wallet */}
              <div className="text-center p-3 animate-in-up delay-250 bg-secondary border-2 border-border">
                <div className="text-2xl md:text-3xl font-display font-black text-foreground">
                  {user.wallet}
                </div>
                <div className="text-xs uppercase font-bold text-muted-foreground">
                  Wallet
                </div>
              </div>

              {/* Location - only shown if logged in at school */}
              {user.location && (
                <div className="text-center p-3 animate-in-up delay-300 bg-status-success-bg border-2 border-status-success-border col-span-2 sm:col-span-1">
                  <div className="text-lg md:text-xl font-mono font-bold text-status-success">
                    {user.location}
                  </div>
                  <div className="text-xs uppercase font-bold text-muted-foreground">
                    Location
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* In Progress Projects */}
      {inProgressProjects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-display font-black uppercase mb-6 text-foreground">
            Current Projects ({inProgressProjects.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressProjects.map((project) => {
              const config = statusConfig[project.status] || statusConfig.in_progress;
              return (
                <Link href={`/projects/${project.slug}`} key={project.id}>
                  <Card className="p-5 h-full transition-all cursor-pointer border-2 border-border manga-shadow-hover bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display font-bold uppercase text-foreground">
                        {project.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${config.className} shrink-0`}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">
                      Started{" "}
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Finished Projects */}
      <div className="mb-8">
        <h2 className="text-2xl font-display font-black uppercase mb-6 text-foreground">
          Recently Completed ({stats.finishedProjects})
        </h2>

        {finishedProjects.length === 0 ? (
          <Card className="p-8 text-center border-2 border-border bg-card">
            <p className="text-muted-foreground">
              No completed projects yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {finishedProjects.map((project) => {
              const badgeClass = project.validated
                ? "border-status-success border text-status-success bg-status-success-bg"
                : "border-status-dev-fail border text-status-dev-fail bg-status-dev-fail-bg";

              return (
                <Link href={`/projects/${project.slug}`} key={project.id}>
                  <Card className="p-4 h-full transition-all cursor-pointer border-2 border-border manga-shadow-hover bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display font-bold text-sm uppercase truncate text-foreground">
                        {project.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`font-mono font-bold ${badgeClass}`}
                      >
                        {project.finalMark}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {project.markedAt &&
                          new Date(project.markedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Skills */}
      {cursus?.skills && cursus.skills.length > 0 && (
        <div>
          <h2 className="text-2xl font-display font-black uppercase mb-6 text-foreground">
            Skills
          </h2>
          <Card className="p-6 border-2 border-border bg-card">
            <div className="space-y-4">
              {cursus.skills
                .sort((a, b) => b.level - a.level)
                .map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-foreground">
                        {skill.name}
                      </span>
                      <span className="text-sm font-mono text-foreground">
                        {skill.level.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${Math.min((skill.level / 20) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

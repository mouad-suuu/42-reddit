"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";

interface UserProfile {
  user: {
    id: number;
    login: string;
    displayName: string;
    firstName: string;
    lastName: string;
    email: string;
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
 * Profile page showing user's 42 data and in-progress projects.
 * Requires authentication.
 */
export default function ProfilePage() {
  const { authenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push("/");
    }
  }, [authLoading, authenticated, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (authLoading) return;
      if (!authenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/42/me");

        if (!response.ok) {
          if (response.status === 401) {
            setError("Please log in to view your profile");
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
  }, [authenticated, authLoading]);

  // Status config
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

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in - will redirect
  if (!authenticated) {
    return null;
  }

  // Loading profile data
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="text-center py-20 bg-card border-2 border-destructive manga-shadow">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-display font-bold mb-4 text-foreground">
            Error Loading Profile
          </h2>
          <p className="mb-8 text-muted-foreground">
            {error}
          </p>
          <Button
            onClick={() => window.location.reload()}
            size="lg"
            className="manga-shadow"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { user, cursus, inProgressProjects, finishedProjects, stats } = profile;

  return (
    <div className="container mx-auto px-6 py-10">
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
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:ml-auto">
            {cursus && (
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="text-center p-2 animate-in-up delay-100 bg-secondary border-2 border-border">
                  <div className="text-2xl font-display font-black text-foreground">
                    <CountUp end={cursus.level} decimals={2} duration={2000} />
                  </div>
                  <div className="text-xs uppercase font-bold text-muted-foreground">
                    Level
                  </div>
                </div>

                {cursus.blackholedAt && (
                  <div className="text-center p-2 animate-in-up delay-200 bg-status-dev-fail-bg border border-status-dev-fail-border">
                    <div className="text-sm font-mono font-bold mt-1 text-status-dev-fail">
                      <span className="block text-xs uppercase opacity-70 mb-1 text-foreground">Black Hole</span>
                      {new Date(cursus.blackholedAt).toLocaleDateString("en-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-center p-2 animate-in-up delay-300 bg-secondary border-2 border-border">
              <div className="text-2xl font-display font-black text-foreground">
                <CountUp end={user.correctionPoints} duration={2500} />
              </div>
              <div className="text-xs uppercase font-bold text-muted-foreground">
                Eval Points
              </div>
            </div>
            <div className="text-center p-2 animate-in-up delay-300 bg-secondary border-2 border-border">
              <div className="text-2xl font-display font-black text-foreground">
                <CountUp end={user.wallet} duration={2500} />
              </div>
              <div className="text-xs uppercase font-bold text-muted-foreground">
                Wallet
              </div>
            </div>
            {user.location && (
              <div className="text-center p-2 animate-in-up delay-300 bg-status-success-bg border-2 border-status-success-border">
                <div className="text-lg font-mono font-bold text-status-success">
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

      {/* In Progress Projects */}
      <div className="mb-8">
        <h2 className="text-2xl font-display font-black uppercase mb-6 text-foreground">
          Current Projects ({inProgressProjects.length})
        </h2>

        {inProgressProjects.length === 0 ? (
          <Card className="p-8 text-center border-2 border-border bg-card">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-muted-foreground">
              No projects in progress. Subscribe to a new project on the intra!
            </p>
          </Card>
        ) : (
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
                      {project.occurrence > 0 && (
                        <span className="ml-2">• Retry #{project.occurrence}</span>
                      )}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Finished Projects */}
      <div className="mb-8">
        <h2 className="text-2xl font-display font-black uppercase mb-6 text-foreground">
          Recently Completed ({stats.finishedProjects})
        </h2>

        {finishedProjects.length === 0 ? (
          <Card className="p-8 text-center border-2 border-border bg-card">
            <p className="text-muted-foreground">
              No completed projects yet. Keep going!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {finishedProjects.map((project) => {
              // Determine style details based on validation
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
              )
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

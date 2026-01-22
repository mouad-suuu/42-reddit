"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Loader2, Copy } from "lucide-react";

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
  const { theme } = useTheme();
  const { authenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const isCyberpunk = theme === "cyberpunk";

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
  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    in_progress: {
      label: "In Progress",
      color: isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-blue-700",
      bgColor: isCyberpunk ? "bg-[var(--cyber-cyan)]/10 border-[var(--cyber-cyan)]/30" : "bg-blue-50 border-blue-200",
    },
    searching_a_group: {
      label: "Looking for Team",
      color: isCyberpunk ? "text-[var(--cyber-purple)]" : "text-purple-700",
      bgColor: isCyberpunk ? "bg-[var(--cyber-purple)]/10 border-[var(--cyber-purple)]/30" : "bg-purple-50 border-purple-200",
    },
    creating_group: {
      label: "Creating Team",
      color: isCyberpunk ? "text-[var(--cyber-purple)]" : "text-purple-700",
      bgColor: isCyberpunk ? "bg-[var(--cyber-purple)]/10 border-[var(--cyber-purple)]/30" : "bg-purple-50 border-purple-200",
    },
    waiting_for_correction: {
      label: "Awaiting Eval",
      color: isCyberpunk ? "text-orange-400" : "text-orange-700",
      bgColor: isCyberpunk ? "bg-orange-500/10 border-orange-500/30" : "bg-orange-50 border-orange-200",
    },
    parent: {
      label: "Parent Project",
      color: isCyberpunk ? "text-gray-400" : "text-gray-600",
      bgColor: isCyberpunk ? "bg-gray-500/10 border-gray-500/30" : "bg-gray-50 border-gray-200",
    },
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2
          className={`h-12 w-12 animate-spin ${
            isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-primary"
          }`}
        />
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
        <Loader2
          className={`h-12 w-12 animate-spin ${
            isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-primary"
          }`}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div
          className={`text-center py-20 ${
            isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-red-500/50"
              : "bg-card border-2 border-destructive manga-shadow"
          }`}
        >
          <div className="text-6xl mb-6">⚠️</div>
          <h2
            className={`text-2xl font-display font-bold mb-4 ${
              isCyberpunk ? "text-white" : "text-foreground"
            }`}
          >
            Error Loading Profile
          </h2>
          <p
            className={`mb-8 ${
              isCyberpunk ? "text-gray-400" : "text-muted-foreground"
            }`}
          >
            {error}
          </p>
          <Button
            onClick={() => window.location.reload()}
            size="lg"
            className={
              isCyberpunk
                ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80"
                : "manga-shadow"
            }
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
      <div
        className={`p-4 mb-8 ${
          isCyberpunk
            ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
            : "bg-card border-2 border-border manga-shadow"
        }`}
      >
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-6">
            <Avatar className={`h-24 w-24 ${isCyberpunk ? "" : "manga-shadow"}`}>
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl font-bold">
                {user.login.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1
                className={`text-3xl font-display font-black uppercase mb-1 ${
                  isCyberpunk ? "cyber-gradient-text" : "text-foreground"
                }`}
              >
                {user.displayName}
              </h1>
              <p
                className={`text-lg font-mono ${
                  isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-muted-foreground"
                }`}
              >
                {" " + user.login + " "}
        {cursus?.blackholedAt && (
          <div
          className={`inline-block mt-3 p-1 ${
              isCyberpunk
                ? "bg-red-500/10 border border-red-500/50"
                : "bg-red-50 border-2 border-red-200"
            }`}
          >
            <p className={`font-mono text-sm ${isCyberpunk ? "text-red-400" : "text-red-700"}`}>
               Black Hole:{" "}
              <span className="font-bold">
                {new Date(cursus.blackholedAt).toLocaleDateString("en-FR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>
        )}
              </p>
              {user.campus && (
                <p
                  className={`text-sm mt-1 ${
                    isCyberpunk ? "text-gray-400" : "text-muted-foreground"
                  }`}
                >
                  📍 {user.campus.name}, {user.campus.country}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:ml-auto">
            {cursus && (
              <div
                className={`text-center p-4 ${
                  isCyberpunk
                    ? "bg-[var(--cyber-dark)] border border-[var(--cyber-border)]"
                    : "bg-secondary border-2 border-border"
                }`}
              >
                <div
                  className={`text-2xl font-display font-black ${
                    isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                  }`}
                >
                  {cursus.level.toFixed(2)}
                </div>
                <div
                  className={`text-xs uppercase font-bold ${
                    isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                  }`}
                >
                  Level
                </div>
              </div>
            )}
            <div
              className={`text-center p-4 ${
                isCyberpunk
                  ? "bg-[var(--cyber-dark)] border border-[var(--cyber-border)]"
                  : "bg-secondary border-2 border-border"
              }`}
            >
              <div
                className={`text-2xl font-display font-black ${
                  isCyberpunk ? "text-[var(--cyber-green)]" : "text-foreground"
                }`}
              >
                {user.correctionPoints}
              </div>
              <div
                className={`text-xs uppercase font-bold ${
                  isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}
              >
                Eval Points
              </div>
            </div>
            <div
              className={`text-center p-4 ${
                isCyberpunk
                  ? "bg-[var(--cyber-dark)] border border-[var(--cyber-border)]"
                  : "bg-secondary border-2 border-border"
              }`}
            >
              <div
                className={`text-2xl font-display font-black ${
                  isCyberpunk ? "text-[var(--cyber-purple)]" : "text-foreground"
                }`}
              >
                {user.wallet}
              </div>
              <div
                className={`text-xs uppercase font-bold ${
                  isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}
              >
                Wallet
              </div>
            </div>
            {user.location && (
              <div
                className={`text-center p-4 ${
                  isCyberpunk
                    ? "bg-[var(--cyber-dark)] border border-[var(--cyber-cyan)]/50"
                    : "bg-green-50 border-2 border-green-200"
                }`}
              >
                <div
                  className={`text-lg font-mono font-bold ${
                    isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-green-700"
                  }`}
                >
                  {user.location}
                </div>
                <div
                  className={`text-xs uppercase font-bold ${
                    isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                  }`}
                >
                  Location
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Blackhole warning */}
      </div>

      {/* In Progress Projects */}
      <div className="mb-8">
        <h2
          className={`text-2xl font-display font-black uppercase mb-6 ${
            isCyberpunk ? "text-white" : "text-foreground"
          }`}
        >
          Current Projects ({inProgressProjects.length})
        </h2>

        {inProgressProjects.length === 0 ? (
          <Card
            className={`p-8 text-center ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border-[var(--cyber-border)]"
                : "border-2 border-border"
            }`}
          >
            <div className="text-4xl mb-4">🎉</div>
            <p className={isCyberpunk ? "text-gray-400" : "text-muted-foreground"}>
              No projects in progress. Subscribe to a new project on the intra!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressProjects.map((project) => {
              const config = statusConfig[project.status] || statusConfig.in_progress;
              return (
                <Link href={`/projects/${project.slug}`} key={project.id}>
                  <Card
                    className={`p-5 h-full transition-all cursor-pointer ${
                      isCyberpunk
                        ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
                        : "border-2 border-border hover:manga-shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3
                        className={`font-display font-bold uppercase ${
                          isCyberpunk ? "text-white" : "text-foreground"
                        }`}
                      >
                        {project.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${config.color} ${config.bgColor} shrink-0`}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <p
                      className={`text-xs font-mono ${
                        isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                      }`}
                    >
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
        <h2
          className={`text-2xl font-display font-black uppercase mb-6 ${
            isCyberpunk ? "text-white" : "text-foreground"
          }`}
        >
          Recently Completed ({stats.finishedProjects})
        </h2>

        {finishedProjects.length === 0 ? (
          <Card
            className={`p-8 text-center ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border-[var(--cyber-border)]"
                : "border-2 border-border"
            }`}
          >
            <p className={isCyberpunk ? "text-gray-400" : "text-muted-foreground"}>
              No completed projects yet. Keep going!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {finishedProjects.map((project) => (
              <Link href={`/projects/${project.slug}`} key={project.id}>
                <Card
                  className={`p-4 h-full transition-all cursor-pointer ${
                    isCyberpunk
                      ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
                      : "border-2 border-border hover:manga-shadow"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`font-display font-bold text-sm uppercase truncate ${
                        isCyberpunk ? "text-white" : "text-foreground"
                      }`}
                    >
                      {project.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`font-mono font-bold ${
                        project.validated
                          ? isCyberpunk
                            ? "border-[var(--cyber-green)] text-[var(--cyber-green)] bg-[var(--cyber-green)]/10"
                            : "border-green-600 text-green-700 bg-green-50"
                          : isCyberpunk
                          ? "border-red-500 text-red-500 bg-red-500/10"
                          : "border-red-600 text-red-700 bg-red-50"
                      }`}
                    >
                      {project.finalMark}%
                    </Badge>
                    <span
                      className={`text-xs ${
                        isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                      }`}
                    >
                      {project.markedAt &&
                        new Date(project.markedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Skills */}
      {cursus?.skills && cursus.skills.length > 0 && (
        <div>
          <h2
            className={`text-2xl font-display font-black uppercase mb-6 ${
              isCyberpunk ? "text-white" : "text-foreground"
            }`}
          >
           Skills
          </h2>
          <Card
            className={`p-6 ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border-[var(--cyber-border)]"
                : "border-2 border-border"
            }`}
          >
            <div className="space-y-4">
              {cursus.skills
                .sort((a, b) => b.level - a.level)
                .map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between mb-1">
                      <span
                        className={`text-sm font-bold ${
                          isCyberpunk ? "text-white" : "text-foreground"
                        }`}
                      >
                        {skill.name}
                      </span>
                      <span
                        className={`text-sm font-mono ${
                          isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                        }`}
                      >
                        {skill.level.toFixed(2)}
                      </span>
                    </div>
                    <div
                      className={`h-2 ${
                        isCyberpunk ? "bg-[var(--cyber-dark)]" : "bg-secondary"
                      }`}
                    >
                      <div
                        className={`h-full ${
                          isCyberpunk
                            ? "bg-gradient-to-r from-[var(--cyber-cyan)] to-[var(--cyber-purple)]"
                            : "bg-foreground"
                        }`}
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

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * A 42 project from the intra API.
 */
export interface FortyTwoProject {
  id: number;
  name: string;
  slug: string;
  description?: string;
  tier?: number;
  difficulty?: number;
  sessions_count?: number;
  parent?: { id: number; name: string; slug: string } | null;
}

/**
 * Displays a 42 project in list or grid view.
 * Links to project detail page; shows tier, difficulty, and description.
 */
export function FortyTwoProjectCard({
  project,
  viewMode = "list",
}: {
  project: FortyTwoProject;
  viewMode?: "grid" | "list";
}) {
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";

  // Tier colors
  const tierColors: Record<number, string> = {
    0: isCyberpunk ? "text-gray-400" : "text-muted-foreground",
    1: isCyberpunk ? "text-[var(--cyber-green)]" : "text-green-700",
    2: isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-blue-700",
    3: isCyberpunk ? "text-[var(--cyber-purple)]" : "text-purple-700",
    4: isCyberpunk ? "text-orange-400" : "text-orange-700",
    5: isCyberpunk ? "text-red-400" : "text-red-700",
  };

  const tierLabels: Record<number, string> = {
    0: "Piscine",
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert",
    5: "Master",
  };

  if (viewMode === "list") {
    return (
      <Link href={`/42-projects/${project.slug}`}>
        <Card
          className={`group flex items-center gap-6 p-5 transition-all cursor-pointer ${
            isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
              : "hover:manga-shadow-lg border-2 border-border"
          }`}
        >
          {/* Project icon */}
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center border-2 ${
              isCyberpunk
                ? "border-[var(--cyber-border)] bg-[var(--cyber-dark)]"
                : "border-border bg-secondary"
            }`}
          >
            <span
              className={`text-2xl font-display font-black ${
                tierColors[project.tier ?? 0]
              }`}
            >
              {project.tier ?? "?"}
            </span>
          </div>

          {/* Project info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3
                className={`font-display font-bold uppercase truncate ${
                  isCyberpunk
                    ? "text-white group-hover:text-[var(--cyber-cyan)]"
                    : "text-foreground group-hover:underline"
                }`}
              >
                {project.name}
              </h3>
              {project.tier !== undefined && (
                <Badge
                  variant={isCyberpunk ? "outline" : "secondary"}
                  className={`shrink-0 ${
                    isCyberpunk ? "border-[var(--cyber-border)]" : ""
                  }`}
                >
                  {tierLabels[project.tier] || `Tier ${project.tier}`}
                </Badge>
              )}
              {project.parent && (
                <span
                  className={`text-xs font-mono shrink-0 ${
                    isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                  }`}
                >
                  from {project.parent.name}
                </span>
              )}
            </div>
            <p
              className={`text-sm line-clamp-1 ${
                isCyberpunk ? "text-gray-400" : "text-muted-foreground"
              }`}
            >
              {project.description || "No description available."}
            </p>
          </div>

          {/* Stats */}
          <div className="flex shrink-0 items-center gap-6 text-center">
            {project.difficulty !== undefined && (
              <div>
                <div
                  className={`text-xs uppercase font-bold ${
                    isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                  }`}
                >
                  XP
                </div>
                <div
                  className={`font-bold text-lg font-mono ${
                    isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                  }`}
                >
                  {project.difficulty?.toLocaleString()}
                </div>
              </div>
            )}
            <div
              className={`text-xs uppercase font-bold ${
                isCyberpunk
                  ? "text-gray-500 group-hover:text-white"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            >
              View →
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid view
  return (
    <Link href={`/42-projects/${project.slug}`}>
      <Card
        className={`group transition-all duration-300 cursor-pointer relative overflow-hidden h-full ${
          isCyberpunk
            ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
            : "hover:manga-shadow-lg border-2 border-border"
        }`}
      >
        {/* Top accent */}
        {isCyberpunk ? (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--cyber-cyan)] to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        ) : (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div
              className={`flex h-12 w-12 items-center justify-center border-2 ${
                isCyberpunk
                  ? "border-[var(--cyber-border)] bg-[var(--cyber-dark)]"
                  : "border-border bg-secondary"
              }`}
            >
              <span
                className={`text-xl font-display font-black ${
                  tierColors[project.tier ?? 0]
                }`}
              >
                {project.tier ?? "?"}
              </span>
            </div>
            {project.tier !== undefined && (
              <Badge
                variant={isCyberpunk ? "outline" : "secondary"}
                className={isCyberpunk ? "border-[var(--cyber-border)]" : ""}
              >
                {tierLabels[project.tier] || `Tier ${project.tier}`}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-display font-bold text-lg uppercase mb-2 transition-colors ${
              isCyberpunk
                ? "text-white group-hover:text-[var(--cyber-cyan)]"
                : "text-foreground group-hover:underline"
            }`}
          >
            {project.name}
          </h3>

          {/* Description */}
          <p
            className={`text-sm mb-4 line-clamp-2 ${
              isCyberpunk ? "text-gray-400" : "text-muted-foreground"
            }`}
          >
            {project.description || "No description available."}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {project.difficulty !== undefined && (
              <div
                className={`text-sm font-mono font-bold ${
                  isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                }`}
              >
                {project.difficulty?.toLocaleString()} XP
              </div>
            )}
            <span
              className={`text-xs font-bold uppercase ${
                isCyberpunk
                  ? "text-gray-500 group-hover:text-white"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            >
              View →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

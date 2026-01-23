"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
 * Uses CSS-only theme styling for performance.
 */
export function FortyTwoProjectCard({
  project,
  viewMode = "list",
}: {
  project: FortyTwoProject;
  viewMode?: "grid" | "list";
}) {
  // Tier color classes - use CSS theme-aware classes
  const tierColors: Record<number, string> = {
    0: "t-tier-0",
    1: "t-tier-1",
    2: "t-tier-2",
    3: "t-tier-3",
    4: "t-tier-4",
    5: "t-tier-5",
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
      <Link href={`/projects/${project.slug}`}>
        <Card className="group flex items-center gap-6 p-5 cursor-pointer t-card t-card-interactive">
          {/* Project icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center t-icon-box-subtle">
            <span className={`text-2xl font-display font-black ${tierColors[project.tier ?? 0]}`}>
              {project.tier ?? "?"}
            </span>
          </div>

          {/* Project info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-display font-bold uppercase truncate t-text-primary t-text-accent-hover">
                {project.name}
              </h3>
              {project.tier !== undefined && (
                <Badge variant="secondary" className="shrink-0">
                  {tierLabels[project.tier] || `Tier ${project.tier}`}
                </Badge>
              )}
              {project.parent && (
                <span className="text-xs font-mono shrink-0 t-text-subtle">
                  from {project.parent.name}
                </span>
              )}
            </div>
            <p className="text-sm line-clamp-1 t-text-muted">
              {project.description || "No description available."}
            </p>
          </div>

          {/* Stats */}
          <div className="flex shrink-0 items-center gap-6 text-center">
            {project.difficulty !== undefined && (
              <div>
                <div className="text-xs uppercase font-bold t-text-subtle">XP</div>
                <div className="font-bold text-lg font-mono t-text-accent">
                  {project.difficulty?.toLocaleString()}
                </div>
              </div>
            )}
            <div className="text-xs uppercase font-bold t-text-muted group-hover:t-text-primary transition-colors">
              View →
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid view
  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className="group transition-all duration-300 cursor-pointer relative overflow-hidden h-full t-card t-card-interactive">
        {/* Top accent */}
        <div className="absolute top-0 left-0 w-full h-1 t-accent-line" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-12 w-12 items-center justify-center t-icon-box-subtle">
              <span className={`text-xl font-display font-black ${tierColors[project.tier ?? 0]}`}>
                {project.tier ?? "?"}
              </span>
            </div>
            {project.tier !== undefined && (
              <Badge variant="secondary">
                {tierLabels[project.tier] || `Tier ${project.tier}`}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-lg uppercase mb-2 t-text-primary t-text-accent-hover">
            {project.name}
          </h3>

          {/* Description */}
          <p className="text-sm mb-4 line-clamp-2 t-text-muted">
            {project.description || "No description available."}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {project.difficulty !== undefined && (
              <div className="text-sm font-mono font-bold t-text-accent">
                {project.difficulty?.toLocaleString()} XP
              </div>
            )}
            <span className="text-xs font-bold uppercase t-text-muted group-hover:t-text-primary transition-colors">
              View →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type ProjectCategory = "NEW_CORE" | "OLD_CORE" | "PISCINE" | "OTHER";

interface Project {
  id: string;
  slug: string;
  title: string;
  fortyTwoProjectId: number | null;
  category: ProjectCategory;
  circle: number;
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
  };
}

/**
 * Project detail page showing project info, posts, and comments.
 */
export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/projects/${encodeURIComponent(slug)}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Project not found");
          } else {
            throw new Error("Failed to fetch project");
          }
          return;
        }

        const data = await response.json();
        setProject(data.project);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProject();
    }
  }, [slug]);

  const categoryConfig: Record<ProjectCategory, { label: string; color: string; bgColor: string }> = {
    NEW_CORE: {
      label: "New Core",
      color: isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-blue-700",
      bgColor: isCyberpunk ? "bg-[var(--cyber-cyan)]/10 border-[var(--cyber-cyan)]/30" : "bg-blue-50 border-blue-200",
    },
    OLD_CORE: {
      label: "Old Core",
      color: isCyberpunk ? "text-[var(--cyber-purple)]" : "text-purple-700",
      bgColor: isCyberpunk ? "bg-[var(--cyber-purple)]/10 border-[var(--cyber-purple)]/30" : "bg-purple-50 border-purple-200",
    },
    PISCINE: {
      label: "Piscine",
      color: isCyberpunk ? "text-orange-400" : "text-orange-600",
      bgColor: isCyberpunk ? "bg-orange-500/10 border-orange-500/30" : "bg-orange-50 border-orange-200",
    },
    OTHER: {
      label: "Other",
      color: isCyberpunk ? "text-gray-400" : "text-gray-600",
      bgColor: isCyberpunk ? "bg-gray-500/10 border-gray-500/30" : "bg-gray-50 border-gray-200",
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div
          className={`text-center py-20 ${
            isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
              : "bg-card border-2 border-border manga-shadow"
          }`}
        >
          <div
            className={`w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4 ${
              isCyberpunk
                ? "border-[var(--cyber-cyan)] border-t-transparent"
                : "border-foreground border-t-transparent"
            }`}
          />
          <p className={`font-mono ${isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"}`}>
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div
          className={`text-center py-20 ${
            isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-red-500/50"
              : "bg-card border-2 border-destructive manga-shadow"
          }`}
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className={`text-xl font-bold mb-2 ${isCyberpunk ? "text-white" : ""}`}>
            {error || "Project not found"}
          </h3>
          <p className={`mb-4 ${isCyberpunk ? "text-gray-400" : "text-muted-foreground"}`}>
            This project may not have been discovered yet.
          </p>
          <Button asChild>
            <Link href="/projects">← Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  const config = categoryConfig[project.category];

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className={`mb-6 text-sm font-mono ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"}`}>
        <Link href="/projects" className={`hover:underline ${isCyberpunk ? "hover:text-[var(--cyber-cyan)]" : ""}`}>
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className={isCyberpunk ? "text-white" : "text-foreground"}>{project.title}</span>
      </div>

      {/* Project Header */}
      <Card
        className={`p-8 mb-8 ${
          isCyberpunk
            ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
            : "border-2 border-border manga-shadow"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1
                className={`text-3xl font-display font-black uppercase ${
                  isCyberpunk ? "cyber-gradient-text" : "text-foreground"
                }`}
              >
                {project.title}
              </h1>
              <Badge variant="outline" className={`${config.color} ${config.bgColor}`}>
                {config.label}
              </Badge>
            </div>
            <p className={`text-sm font-mono ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"}`}>
              slug: {project.slug}
              {project.fortyTwoProjectId && ` • 42 ID: ${project.fortyTwoProjectId}`}
            </p>
          </div>

          <div className={`flex gap-4 text-sm ${isCyberpunk ? "text-gray-400" : "text-muted-foreground"}`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"}`}>
                {project._count.posts}
              </div>
              <div className="text-xs uppercase">Posts</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isCyberpunk ? "text-[var(--cyber-purple)]" : "text-foreground"}`}>
                {project._count.comments}
              </div>
              <div className="text-xs uppercase">Comments</div>
            </div>
          </div>
        </div>

      </Card>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - Posts */}
        <div className="lg:col-span-2">
          <Card
            className={`p-6 ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
                : "border-2 border-border manga-shadow"
            }`}
          >
            <h2
              className={`text-xl font-display font-bold uppercase mb-4 ${
                isCyberpunk ? "text-white" : "text-foreground"
              }`}
            >
              📝 Posts & READMEs
            </h2>

            <div
              className={`text-center py-12 ${
                isCyberpunk ? "text-gray-500" : "text-muted-foreground"
              }`}
            >
              <div className="text-4xl mb-4">📭</div>
              <p className="mb-4">No posts yet. Be the first to share!</p>
              <Button disabled className="opacity-50">
                Share your README (coming soon)
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card
            className={`p-6 ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
                : "border-2 border-border manga-shadow"
            }`}
          >
            <h3
              className={`text-lg font-display font-bold uppercase mb-4 ${
                isCyberpunk ? "text-white" : "text-foreground"
              }`}
            >
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button className="w-full" disabled>
                📝 Share README
              </Button>
              <Button variant="outline" className="w-full" disabled>
                💬 Start Discussion
              </Button>
              {project.fortyTwoProjectId && (
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a
                    href={`https://projects.intra.42.fr/projects/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 View on Intra
                  </a>
                </Button>
              )}
            </div>
          </Card>

          {/* Who completed this */}
          <Card
            className={`p-6 ${
              isCyberpunk
                ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
                : "border-2 border-border manga-shadow"
            }`}
          >
            <h3
              className={`text-lg font-display font-bold uppercase mb-4 ${
                isCyberpunk ? "text-white" : "text-foreground"
              }`}
            >
              👥 Who Completed This
            </h3>
            <p className={`text-sm ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"}`}>
              Coming soon - see students who completed this project
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

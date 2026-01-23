"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Loader2 } from "lucide-react";

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

// Circle labels for display
const circleLabels: Record<number, string> = {
  0: "Circle 0",
  1: "Circle 1",
  2: "Circle 2",
  3: "Circle 3",
  4: "Circle 4",
  5: "Circle 5",
  6: "Circle 6",
  13: "No Circle",
};

/**
 * Projects listing page.
 * Shows projects grouped by circle in horizontal rows.
 * Requires authentication.
 */
export default function ProjectsPage() {
  const { theme } = useTheme();
  const { authenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const isCyberpunk = theme === "cyberpunk";

  // All hooks must be declared before any conditional returns
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | null>("NEW_CORE");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push("/");
    }
  }, [authLoading, authenticated, router]);

  // Fetch projects from database
  useEffect(() => {
    if (!authenticated) return; // Don't fetch if not authenticated

    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ per_page: "200" });
        if (selectedCategory) {
          params.set("category", selectedCategory);
        }

        const response = await fetch(`/api/projects?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [selectedCategory, authenticated]);

  // Filter and group projects by circle (must be before conditional returns)
  const projectsByCircle = useMemo(() => {
    // Filter by search
    const filtered = projects.filter((project) => {
      if (!searchQuery) return true;
      return (
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Group by circle
    const grouped = new Map<number, Project[]>();
    filtered.forEach((project) => {
      const circle = project.circle;
      if (!grouped.has(circle)) {
        grouped.set(circle, []);
      }
      grouped.get(circle)!.push(project);
    });

    // Sort circles (0, 1, 2, ... 6, then 13)
    const sortedCircles = Array.from(grouped.keys()).sort((a, b) => {
      if (a === 13) return 1;
      if (b === 13) return -1;
      return a - b;
    });

    return sortedCircles.map((circle) => ({
      circle,
      label: circleLabels[circle] || `Circle ${circle}`,
      projects: grouped.get(circle)!.sort((a, b) => a.title.localeCompare(b.title)),
    }));
  }, [projects, searchQuery]);

  const totalProjects = projectsByCircle.reduce((sum, g) => sum + g.projects.length, 0);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2
          className={`h-12 w-12 animate-spin ${isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-primary"
            }`}
        />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!authenticated) {
    return null;
  }

  const categoryConfig: Record<ProjectCategory, { label: string; color: string; bgColor: string }> = {
    NEW_CORE: {
      label: "Core",
      color: isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-blue-700",
      bgColor: isCyberpunk ? "bg-[var(--cyber-cyan)]/10 border-[var(--cyber-cyan)]/30" : "bg-blue-50 border-blue-200",
    },
    OLD_CORE: {
      label: "Old",
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

  const categories: { value: ProjectCategory | null; label: string }[] = [
    { value: null, label: "All" },
    { value: "NEW_CORE", label: "New Core" },
    { value: "OLD_CORE", label: "Old Core" },
    { value: "OTHER", label: "Other" },
  ];

  // Circle colors for visual distinction
  const circleColors: Record<number, string> = {
    0: isCyberpunk ? "border-l-green-500" : "border-l-green-500",
    1: isCyberpunk ? "border-l-blue-500" : "border-l-blue-500",
    2: isCyberpunk ? "border-l-cyan-500" : "border-l-cyan-500",
    3: isCyberpunk ? "border-l-purple-500" : "border-l-purple-500",
    4: isCyberpunk ? "border-l-pink-500" : "border-l-pink-500",
    5: isCyberpunk ? "border-l-orange-500" : "border-l-orange-500",
    6: isCyberpunk ? "border-l-red-500" : "border-l-red-500",
    13: isCyberpunk ? "border-l-gray-500" : "border-l-gray-500",
  };

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          className={`text-4xl font-display font-black uppercase mb-2 ${isCyberpunk ? "cyber-gradient-text" : "text-foreground"
            }`}
        >
          42 Projects
        </h1>
        <p className={`text-lg ${isCyberpunk ? "text-gray-400" : "text-muted-foreground"}`}>
          Browse projects organized by circle. Click any project to see tips, READMEs, and discussions.
        </p>
      </div>

      {/* Controls */}
      <div
        className={`flex flex-col md:flex-row gap-4 mb-8 p-4 ${isCyberpunk
            ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
            : "bg-card border-2 border-border manga-shadow"
          }`}
      >
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <svg
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${isCyberpunk
                  ? "bg-[var(--cyber-dark)] border-[var(--cyber-border)] focus:border-[var(--cyber-cyan)]"
                  : "border-2 border-border"
                }`}
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.label}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className={
                isCyberpunk && selectedCategory === cat.value
                  ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80"
                  : ""
              }
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div
          className={`text-center py-20 ${isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
              : "bg-card border-2 border-border manga-shadow"
            }`}
        >
          <div
            className={`w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4 ${isCyberpunk
                ? "border-[var(--cyber-cyan)] border-t-transparent"
                : "border-foreground border-t-transparent"
              }`}
          />
          <p className={`font-mono ${isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"}`}>
            Loading projects...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div
          className={`text-center py-20 ${isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-red-500/50"
              : "bg-card border-2 border-destructive manga-shadow"
            }`}
        >
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className={`text-xl font-display font-bold mb-2 ${isCyberpunk ? "text-white" : "text-foreground"}`}>
            Failed to load projects
          </h3>
          <p className={`mb-4 ${isCyberpunk ? "text-gray-400" : "text-muted-foreground"}`}>{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className={isCyberpunk ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80" : ""}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Projects by Circle */}
      {!loading && !error && (
        <>
          {/* Results count */}
          <div className={`mb-6 text-sm font-mono ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"}`}>
            {totalProjects} project{totalProjects !== 1 ? "s" : ""} in {projectsByCircle.length} circle
            {projectsByCircle.length !== 1 ? "s" : ""}
          </div>

          {/* Circle rows */}
          <div className="space-y-8">
            {projectsByCircle.map(({ circle, label, projects: circleProjects }) => (
              <div
                key={circle}
                className={`border-l-4 ${circleColors[circle] || "border-l-gray-500"} ${isCyberpunk ? "bg-[var(--cyber-panel)]/50" : "bg-card/50"
                  }`}
              >
                {/* Circle header */}
                <div
                  className={`px-4 py-3 border-b ${isCyberpunk ? "border-[var(--cyber-border)]" : "border-border"
                    }`}
                >
                  <h2
                    className={`text-xl font-display font-bold uppercase ${isCyberpunk ? "text-white" : "text-foreground"
                      }`}
                  >
                    {label}
                    <span className={`ml-2 text-sm font-normal ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"}`}>
                      ({circleProjects.length} project{circleProjects.length !== 1 ? "s" : ""})
                    </span>
                  </h2>
                </div>

                {/* Projects in this circle - horizontal scroll */}
                <div className="p-4 overflow-x-auto">
                  <div className="flex gap-4" style={{ minWidth: "min-content" }}>
                    {circleProjects.map((project) => (
                      <Link href={`/projects/${project.slug}`} key={project.id}>
                        <Card
                          className={`p-4 w-64 shrink-0 transition-all cursor-pointer hover:scale-105 ${isCyberpunk
                              ? "bg-[var(--cyber-dark)] border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)] hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                              : "border-2 border-border hover:manga-shadow"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3
                              className={`font-display font-bold text-sm uppercase leading-tight ${isCyberpunk ? "text-white" : "text-foreground"
                                }`}
                            >
                              {project.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs shrink-0 ${categoryConfig[project.category].color} ${categoryConfig[project.category].bgColor}`}
                            >
                              {categoryConfig[project.category].label}
                            </Badge>
                          </div>
                          <div
                            className={`flex gap-3 text-xs ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"
                              }`}
                          >
                            <span>📝 {project._count.posts}</span>
                            <span>💬 {project._count.comments}</span>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {projectsByCircle.length === 0 && (
            <div
              className={`text-center py-20 ${isCyberpunk
                  ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
                  : "bg-card border-2 border-border manga-shadow"
                }`}
            >
              <div className={`text-6xl mb-4 ${isCyberpunk ? "text-gray-700" : "text-muted-foreground/30"}`}>
                📚
              </div>
              <h3 className={`text-xl font-display font-bold mb-2 ${isCyberpunk ? "text-white" : "text-foreground"}`}>
                No projects found
              </h3>
              <p className={`mb-4 ${isCyberpunk ? "text-gray-400" : "text-muted-foreground"}`}>
                {searchQuery
                  ? "Try a different search term."
                  : "Projects with assigned circles will appear here."}
              </p>
              <Button asChild className={isCyberpunk ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80" : ""}>
                <Link href="/profile">View your profile to discover projects</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

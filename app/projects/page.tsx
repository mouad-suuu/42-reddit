"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";

type ProjectCategory = "NEW_CORE" | "OLD_CORE" | "OTHER";

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  fortyTwoProjectId: number | null;
  category: ProjectCategory;
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
  };
}

/**
 * Projects listing page.
 * Shows projects stored in the database (discovered from user profiles).
 */
export default function ProjectsPage() {
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Fetch projects from database
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ per_page: "100" });
        if (selectedCategory) {
          params.set("category", selectedCategory);
        }
        if (searchQuery) {
          params.set("search", searchQuery);
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
  }, [selectedCategory, searchQuery]);

  // Filter projects locally for instant feedback
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [projects, searchQuery]);

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

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1
          className={`text-4xl font-display font-black uppercase mb-2 ${
            isCyberpunk ? "cyber-gradient-text" : "text-foreground"
          }`}
        >
          42 Projects
        </h1>
        <p
          className={`text-lg ${
            isCyberpunk ? "text-gray-400" : "text-muted-foreground"
          }`}
        >
          Browse projects, share tips, READMEs, and help other students.
        </p>
        <p
          className={`text-sm mt-2 ${
            isCyberpunk ? "text-gray-500" : "text-muted-foreground"
          }`}
        >
          💡 Projects are discovered when users view their profiles. Visit your{" "}
          <Link href="/profile" className={`underline ${isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-primary"}`}>
            profile
          </Link>{" "}
          to add your projects!
        </p>
      </div>

      {/* Controls */}
      <div
        className={`flex flex-col md:flex-row gap-4 mb-8 p-4 ${
          isCyberpunk
            ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
            : "bg-card border-2 border-border manga-shadow"
        }`}
      >
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <svg
              className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isCyberpunk ? "text-gray-500" : "text-muted-foreground"
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
              className={`pl-10 ${
                isCyberpunk
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

        {/* View toggle */}
        <div
          className={`flex border-2 ${
            isCyberpunk ? "border-[var(--cyber-border)]" : "border-border"
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("list")}
            className={`rounded-none ${
              viewMode === "list"
                ? isCyberpunk
                  ? "bg-[var(--cyber-cyan)]/20 text-[var(--cyber-cyan)]"
                  : "bg-primary text-primary-foreground"
                : ""
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`rounded-none ${
              viewMode === "grid"
                ? isCyberpunk
                  ? "bg-[var(--cyber-cyan)]/20 text-[var(--cyber-cyan)]"
                  : "bg-primary text-primary-foreground"
                : ""
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
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
            Loading projects...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div
          className={`text-center py-20 ${
            isCyberpunk
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

      {/* Results */}
      {!loading && !error && (
        <>
          {/* Results count */}
          <div className={`mb-4 text-sm font-mono ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"}`}>
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
          </div>

          {/* Projects list/grid */}
          {viewMode === "list" ? (
            <div className="space-y-4">
              {filteredProjects.map((project, index) => (
                <Link href={`/projects/${project.slug}`} key={project.id}>
                  <Card
                    className={`p-5 transition-all cursor-pointer animate-fade-in ${
                      isCyberpunk
                        ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
                        : "border-2 border-border hover:manga-shadow-lg"
                    }`}
                    style={{ animationDelay: `${Math.min(index * 30, 500)}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-display font-bold text-lg uppercase ${isCyberpunk ? "text-white" : "text-foreground"}`}>
                            {project.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`${categoryConfig[project.category].color} ${categoryConfig[project.category].bgColor}`}
                          >
                            {categoryConfig[project.category].label}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className={`text-sm line-clamp-1 ${isCyberpunk ? "text-gray-400" : "text-muted-foreground"}`}>
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className={`flex gap-4 text-sm ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"}`}>
                        <span title="Posts">📝 {project._count.posts}</span>
                        <span title="Comments">💬 {project._count.comments}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <Link href={`/projects/${project.slug}`} key={project.id}>
                  <Card
                    className={`p-5 h-full transition-all cursor-pointer animate-fade-in ${
                      isCyberpunk
                        ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
                        : "border-2 border-border hover:manga-shadow"
                    }`}
                    style={{ animationDelay: `${Math.min(index * 30, 500)}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`font-display font-bold uppercase ${isCyberpunk ? "text-white" : "text-foreground"}`}>
                        {project.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${categoryConfig[project.category].color} ${categoryConfig[project.category].bgColor} shrink-0`}
                      >
                        {categoryConfig[project.category].label}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className={`text-sm line-clamp-2 mb-4 ${isCyberpunk ? "text-gray-400" : "text-muted-foreground"}`}>
                        {project.description}
                      </p>
                    )}
                    <div className={`flex gap-4 text-sm ${isCyberpunk ? "text-gray-500" : "text-muted-foreground"}`}>
                      <span>📝 {project._count.posts}</span>
                      <span>💬 {project._count.comments}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Empty state */}
          {filteredProjects.length === 0 && (
            <div
              className={`text-center py-20 ${
                isCyberpunk
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
                Projects are discovered when users view their profiles.
              </p>
              <Button asChild className={isCyberpunk ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80" : ""}>
                <Link href="/profile">View your profile to add projects</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FortyTwoProjectCard,
  FortyTwoProject,
} from "@/components/fortytwo-project-card";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * 42 Projects listing page.
 * Shows all 42 curriculum projects for browsing and discovery.
 * User-specific projects are shown in the Profile page.
 */
export default function FortyTwoProjectsPage() {
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";

  const [projects, setProjects] = useState<FortyTwoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  // Fetch projects from API
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/42/projects?per_page=100");

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
  }, []);

  // Filter projects based on search and tier
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier =
        selectedTier === null || project.tier === selectedTier;
      return matchesSearch && matchesTier;
    });
  }, [projects, searchQuery, selectedTier]);

  // Get unique tiers from projects
  const availableTiers = useMemo(() => {
    const tiers = new Set(projects.map((p) => p.tier).filter((t) => t !== undefined));
    return Array.from(tiers).sort((a, b) => (a ?? 0) - (b ?? 0));
  }, [projects]);

  const tierLabels: Record<number, string> = {
    0: "Piscine",
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert",
    5: "Master",
    6: "Outer Circle",
  };

  const tiers = [
    { value: null, label: "All" },
    ...availableTiers.map((tier) => ({
      value: tier ?? 0,
      label: tierLabels[tier ?? 0] || `Tier ${tier}`,
    })),
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
          Browse the 42 curriculum. Share tips, READMEs, and help other students.
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

        {/* Tier filter */}
        <div className="flex gap-2 flex-wrap">
          {tiers.map((tier) => (
            <Button
              key={tier.label}
              variant={selectedTier === tier.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTier(tier.value)}
              className={
                isCyberpunk && selectedTier === tier.value
                  ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80"
                  : ""
              }
            >
              {tier.label}
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
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
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
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled
            title="Graph view coming soon"
            className={`rounded-none opacity-50 cursor-not-allowed ${
              isCyberpunk ? "text-gray-500" : "text-muted-foreground"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
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
          <p
            className={`font-mono ${
              isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
            }`}
          >
            Loading projects from 42 API...
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
          <h3
            className={`text-xl font-display font-bold mb-2 ${
              isCyberpunk ? "text-white" : "text-foreground"
            }`}
          >
            Failed to load projects
          </h3>
          <p
            className={`mb-4 ${
              isCyberpunk ? "text-gray-400" : "text-muted-foreground"
            }`}
          >
            {error}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className={
              isCyberpunk
                ? "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80"
                : ""
            }
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {/* Results count */}
          <div
            className={`mb-4 text-sm font-mono ${
              isCyberpunk ? "text-gray-500" : "text-muted-foreground"
            }`}
          >
            {filteredProjects.length} project
            {filteredProjects.length !== 1 ? "s" : ""} found
            {projects.length > 0 && filteredProjects.length !== projects.length && (
              <span> (of {projects.length} total)</span>
            )}
          </div>

          {/* Projects list/grid */}
          {viewMode === "list" ? (
            <div className="space-y-4">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 30, 500)}ms` }}
                >
                  <FortyTwoProjectCard project={project} viewMode="list" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 30, 500)}ms` }}
                >
                  <FortyTwoProjectCard project={project} viewMode="grid" />
                </div>
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
              <div
                className={`text-6xl mb-4 ${
                  isCyberpunk ? "text-gray-700" : "text-muted-foreground/30"
                }`}
              >
                ¯\_(ツ)_/¯
              </div>
              <h3
                className={`text-xl font-display font-bold mb-2 ${
                  isCyberpunk ? "text-white" : "text-foreground"
                }`}
              >
                No projects found
              </h3>
              <p
                className={`${
                  isCyberpunk ? "text-gray-400" : "text-muted-foreground"
                }`}
              >
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

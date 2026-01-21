"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type ProjectCategory = "NEW_CORE" | "OLD_CORE" | "PISCINE" | "OTHER";

interface Project {
  id: string;
  slug: string;
  title: string;
  fortyTwoProjectId: number | null;
  category: ProjectCategory;
  circle: number;
}

/**
 * Admin dashboard for categorizing projects.
 * Requires ADMIN role to access.
 */
export default function DashboardPage() {
  const { user, loading: authLoading, authenticated } = useAuth();
  const router = useRouter();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<"uncategorized" | "all">("uncategorized");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      if (!authenticated) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          // data.user is AuthUser, data.user.user is the database User with role
          const role = data.user?.user?.role;
          console.log("[Dashboard] User role:", role);
          setIsAdmin(role === "ADMIN");
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    }

    if (!authLoading) {
      checkAdmin();
    }
  }, [authenticated, authLoading]);

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      if (isAdmin !== true) return;
      
      try {
        setLoading(true);
        const params = new URLSearchParams({ per_page: "500" });
        
        if (filter === "uncategorized") {
          params.set("circle", "-1");
        }
        
        const response = await fetch(`/api/projects?${params}`);
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [filter, isAdmin]);

  // Filter projects by search
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // Update project
  const updateProject = async (slug: string, updates: { category?: ProjectCategory; circle?: number }) => {
    setSaving(slug);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/projects/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      // Update local state
      setProjects((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, ...updates } : p))
      );
      
      setMessage(`✓ Updated ${slug}`);
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error("Error updating project:", err);
      setMessage(`✗ Failed to update ${slug}`);
    } finally {
      setSaving(null);
    }
  };

  const categories: ProjectCategory[] = ["NEW_CORE", "OLD_CORE", "PISCINE", "OTHER"];
  const circles = [-1, 0, 1, 2, 3, 4, 5, 6, 13];

  const categoryColors: Record<ProjectCategory, string> = {
    NEW_CORE: "bg-blue-500 hover:bg-blue-600",
    OLD_CORE: "bg-purple-500 hover:bg-purple-600",
    PISCINE: "bg-orange-500 hover:bg-orange-600",
    OTHER: "bg-gray-500 hover:bg-gray-600",
  };

  // Loading auth
  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">🔒 Login Required</h1>
          <p className="text-muted-foreground mb-4">
            You must be logged in to access the dashboard.
          </p>
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">⛔ Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this page.
            <br />
            Admin role is required.
          </p>
          <Button onClick={() => router.push("/")}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔧 Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Categorize projects by setting their circle and category.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === "uncategorized" ? "default" : "outline"}
            onClick={() => setFilter("uncategorized")}
          >
            Uncategorized ({projects.filter(p => filter === "uncategorized" || p.circle === -1).length})
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All Projects
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.startsWith("✓") 
            ? "bg-green-500/20 border border-green-500/50 text-green-500"
            : "bg-red-500/20 border border-red-500/50 text-red-500"
        }`}>
          {message}
        </div>
      )}

      {/* Loading */}
      {loading && <p className="text-center py-10">Loading projects...</p>}

      {/* Projects list */}
      {!loading && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>

          {filteredProjects.map((project) => (
            <Card key={project.id} className="p-4">
              <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                {/* Project info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{project.title}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{project.slug}</p>
                </div>

                {/* Current values */}
                <div className="flex gap-2 items-center shrink-0">
                  <Badge variant="outline" className="font-mono">
                    C{project.circle}
                  </Badge>
                  <Badge className={categoryColors[project.category]}>
                    {project.category}
                  </Badge>
                </div>

                {/* Circle selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Circle</span>
                  <div className="flex gap-1 flex-wrap">
                    {circles.map((c) => (
                      <Button
                        key={c}
                        size="sm"
                        variant={project.circle === c ? "default" : "outline"}
                        className={`w-9 h-7 text-xs p-0 ${project.circle === c ? "bg-primary" : ""}`}
                        onClick={() => updateProject(project.slug, { circle: c })}
                        disabled={saving === project.slug}
                      >
                        {c}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase text-muted-foreground">Category</span>
                  <div className="flex gap-1 flex-wrap">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        size="sm"
                        variant={project.category === cat ? "default" : "outline"}
                        className={`h-7 text-xs px-2 ${project.category === cat ? categoryColors[cat] : ""}`}
                        onClick={() => updateProject(project.slug, { category: cat })}
                        disabled={saving === project.slug}
                      >
                        {cat.replace("_", "")}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredProjects.length === 0 && (
            <div className="text-center py-20 bg-card border rounded-lg">
              {searchQuery ? (
                <>
                  <p className="text-xl mb-2">🔍 No matches</p>
                  <p className="text-muted-foreground">Try a different search term.</p>
                </>
              ) : (
                <>
                  <p className="text-xl mb-2">✅ All done!</p>
                  <p className="text-muted-foreground">No uncategorized projects remaining.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

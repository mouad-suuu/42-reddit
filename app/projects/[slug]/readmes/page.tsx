"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReadmePreviewCard, ReadmePreviewData } from "@/components/readme-preview-card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FileText, Loader2, Plus, ArrowLeft } from "lucide-react";

type ProjectCategory = "NEW_CORE" | "OLD_CORE" | "PISCINE" | "OTHER";

interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
}

/**
 * READMEs listing page for a project.
 */
export default function ReadmesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";
  const { authenticated, loading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [readmes, setReadmes] = useState<ReadmePreviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [readmesLoading, setReadmesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push("/");
    }
  }, [authLoading, authenticated, router]);

  // Fetch project
  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(slug)}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data.project);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProject();
    }
  }, [slug]);

  // Fetch READMEs
  useEffect(() => {
    if (!project) return;

    async function fetchReadmes() {
      setReadmesLoading(true);
      try {
        const response = await fetch(`/api/projects/${slug}/posts`);
        if (response.ok) {
          const data = await response.json();
          setReadmes(data.posts || []);
        }
      } catch (err) {
        console.error("Failed to fetch READMEs:", err);
      } finally {
        setReadmesLoading(false);
      }
    }

    fetchReadmes();
  }, [project, slug]);

  // Auth loading
  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2
          className={cn(
            "h-12 w-12 animate-spin",
            isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-primary"
          )}
        />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div
          className={cn(
            "text-center py-20",
            isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-red-500/50"
              : "bg-card border-2 border-destructive manga-shadow"
          )}
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className={cn("text-xl font-bold mb-2", isCyberpunk && "text-white")}>
            {error || "Project not found"}
          </h3>
          <Button asChild className="mt-4">
            <Link href="/projects">← Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className={cn("mb-6 text-sm font-mono", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
        <Link href="/projects" className={cn("hover:underline", isCyberpunk && "hover:text-[var(--cyber-cyan)]")}>
          Projects
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/projects/${slug}`} className={cn("hover:underline", isCyberpunk && "hover:text-[var(--cyber-cyan)]")}>
          {project.title}
        </Link>
        <span className="mx-2">/</span>
        <span className={isCyberpunk ? "text-white" : "text-foreground"}>READMEs</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className={cn(
              "text-4xl font-display font-black uppercase mb-2",
              isCyberpunk ? "cyber-gradient-text" : "text-foreground"
            )}
          >
            READMEs
          </h1>
          <p className={cn("text-lg", isCyberpunk ? "text-gray-400" : "text-muted-foreground")}>
            Project notes, guides, and tips from the community
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Discussion
            </Link>
          </Button>
          <Button
            size="sm"
            className={cn(isCyberpunk && "bg-[var(--cyber-purple)] hover:bg-[var(--cyber-purple)]/80")}
            asChild
          >
            <Link href={`/projects/${slug}/readmes/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Share README
            </Link>
          </Button>
        </div>
      </div>

      {/* READMEs list */}
      {readmesLoading ? (
        <div className="text-center py-20">
          <Loader2 className={cn("h-8 w-8 animate-spin mx-auto", isCyberpunk ? "text-[var(--cyber-purple)]" : "text-muted-foreground")} />
        </div>
      ) : readmes.length === 0 ? (
        <Card
          className={cn(
            "p-12 text-center",
            isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
              : "border-2 border-border"
          )}
        >
          <div className="text-6xl mb-4">📚</div>
          <h3 className={cn("text-xl font-bold mb-2", isCyberpunk ? "text-white" : "text-foreground")}>
            No READMEs yet
          </h3>
          <p className={cn("mb-6", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
            Be the first to share your project notes and guides!
          </p>
          <Button
            asChild
            className={cn(isCyberpunk && "bg-[var(--cyber-purple)] hover:bg-[var(--cyber-purple)]/80")}
          >
            <Link href={`/projects/${slug}/readmes/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Share Your First README
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {readmes.map((readme) => (
            <ReadmePreviewCard
              key={readme.id}
              readme={readme}
              projectSlug={slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}

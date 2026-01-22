"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FileText, Loader2, Send, ArrowLeft, X, Trash2, Eye, Edit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ProjectCategory = "NEW_CORE" | "OLD_CORE" | "PISCINE" | "OTHER";

interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
}

interface ExistingReadme {
  id: string;
  title: string;
  content: string;
}

/**
 * New/Edit README page with split preview (like GitHub/VS Code).
 * Handles one README per user per project.
 */
export default function NewReadmePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";
  const { authenticated, loading: authLoading, user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingReadme, setExistingReadme] = useState<ExistingReadme | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push("/");
    }
  }, [authLoading, authenticated, router]);

  // Fetch project and check for existing README
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch project
        const projectResponse = await fetch(`/api/projects/${encodeURIComponent(slug)}`);
        if (!projectResponse.ok) {
          setError("Project not found");
          return;
        }
        const projectData = await projectResponse.json();
        setProject(projectData.project);

        // Check if user already has a README
        const readmesResponse = await fetch(`/api/projects/${slug}/posts`);
        if (readmesResponse.ok) {
          const readmesData = await readmesResponse.json();
          const userReadme = readmesData.posts.find(
            (r: any) => r.author.id === user?.profile?.id
          );
          if (userReadme) {
            setExistingReadme({
              id: userReadme.id,
              title: userReadme.title || "",
              content: userReadme.content,
            });
            setTitle(userReadme.title || "");
            setContent(userReadme.content);
            setIsEditing(true);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    if (slug && authenticated && user?.profile?.id) {
      fetchData();
    }
  }, [slug, authenticated, user]);

  // Update existing README
  const handleUpdateReadme = async () => {
    if (!existingReadme || !title.trim() || !content.trim() || isPosting) return;

    setIsPosting(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${slug}/posts/${existingReadme.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update README");
      }

      // Redirect to READMEs page
      router.push(`/projects/${slug}/readmes`);
    } catch (err) {
      console.error("Failed to update README:", err);
      setError(err instanceof Error ? err.message : "Failed to update README. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  // Create new README
  const handlePostReadme = async () => {
    if (!title.trim() || !content.trim() || isPosting) return;

    setIsPosting(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${slug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409 && data.existingPost) {
          setError("You already have a README. Please update or delete it first.");
          setExistingReadme(data.existingPost);
          setIsEditing(true);
          return;
        }
        throw new Error(data.error || "Failed to post README");
      }

      // Redirect to READMEs page
      router.push(`/projects/${slug}/readmes`);
    } catch (err) {
      console.error("Failed to post README:", err);
      setError(err instanceof Error ? err.message : "Failed to publish README. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  // Delete README
  const handleDeleteReadme = async () => {
    if (!existingReadme || !confirm("Are you sure you want to delete your README? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${slug}/posts/${existingReadme.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete README");
      }

      // Reset form and redirect
      setExistingReadme(null);
      setTitle("");
      setContent("");
      setIsEditing(false);
      router.push(`/projects/${slug}/readmes`);
    } catch (err) {
      console.error("Failed to delete README:", err);
      setError("Failed to delete README. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (error && !project) {
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
            {error}
          </h3>
          <Button asChild className="mt-4">
            <Link href="/projects">← Back to Projects</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
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
        <Link href={`/projects/${slug}/readmes`} className={cn("hover:underline", isCyberpunk && "hover:text-[var(--cyber-cyan)]")}>
          READMEs
        </Link>
        <span className="mx-2">/</span>
        <span className={isCyberpunk ? "text-white" : "text-foreground"}>
          {isEditing ? "Edit" : "New"}
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={cn(
                "text-4xl font-display font-black uppercase mb-2",
                isCyberpunk ? "cyber-gradient-text" : "text-foreground"
              )}
            >
              {isEditing ? "Edit Your README" : "Share Your README"}
            </h1>
            <p className={cn("text-lg", isCyberpunk ? "text-gray-400" : "text-muted-foreground")}>
              {isEditing
                ? "Update your README or delete it to create a new one"
                : `Write a guide, share tips, or document your approach for ${project.title}`}
            </p>
          </div>
          {existingReadme && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteReadme}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      {/* Split view: Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Editor */}
        <Card
          className={cn(
            "p-6",
            isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
              : "border-2 border-border"
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <Edit className={cn("h-5 w-5", isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-primary")} />
            <h2 className={cn("text-lg font-bold", isCyberpunk ? "text-white" : "text-foreground")}>
              Editor
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className={cn(
                  "block text-sm font-bold mb-2",
                  isCyberpunk ? "text-white" : "text-foreground"
                )}
              >
                Title
              </label>
              <Input
                placeholder="e.g., Getting Started Guide, Common Pitfalls, My Solution"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(
                  isCyberpunk && "bg-[var(--cyber-dark)] border-[var(--cyber-border)]"
                )}
                maxLength={200}
              />
              <p className={cn("text-xs mt-1", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                {title.length}/200 characters
              </p>
            </div>

            <div>
              <label
                className={cn(
                  "block text-sm font-bold mb-2",
                  isCyberpunk ? "text-white" : "text-foreground"
                )}
              >
                Content (Markdown)
              </label>
              <Textarea
                placeholder="Write your README in Markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={cn(
                  "min-h-[500px] font-mono text-sm",
                  isCyberpunk && "bg-[var(--cyber-dark)] border-[var(--cyber-border)]"
                )}
                maxLength={50000}
              />
              <p className={cn("text-xs mt-1", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                {content.length}/50,000 characters
              </p>
            </div>
          </div>
        </Card>

        {/* Preview */}
        <Card
          className={cn(
            "p-6",
            isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
              : "border-2 border-border"
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <Eye className={cn("h-5 w-5", isCyberpunk ? "text-[var(--cyber-purple)]" : "text-primary")} />
            <h2 className={cn("text-lg font-bold", isCyberpunk ? "text-white" : "text-foreground")}>
              Preview
            </h2>
          </div>

          <div
            className={cn(
              "prose prose-sm max-w-none overflow-auto",
              "min-h-[500px] max-h-[600px]",
              isCyberpunk
                ? "prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-[var(--cyber-cyan)] prose-code:text-[var(--cyber-purple)] prose-code:bg-[var(--cyber-dark)] prose-pre:bg-[var(--cyber-dark)]"
                : "prose-headings:text-foreground prose-p:text-foreground"
            )}
          >
            {content.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <div className={cn("text-center py-20", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Preview will appear here as you type...</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Error message */}
      {error && (
        <Card
          className={cn(
            "p-4 mb-6",
            isCyberpunk
              ? "bg-red-900/20 border-red-500/50 text-red-400"
              : "bg-destructive/10 border-destructive text-destructive"
          )}
        >
          {error}
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={isEditing ? handleUpdateReadme : handlePostReadme}
          disabled={!title.trim() || !content.trim() || isPosting}
          className={cn(
            "flex-1",
            isCyberpunk && "bg-[var(--cyber-purple)] hover:bg-[var(--cyber-purple)]/80"
          )}
        >
          <Send className="h-4 w-4 mr-2" />
          {isPosting
            ? isEditing
              ? "Updating..."
              : "Publishing..."
            : isEditing
              ? "Update README"
              : "Publish README"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/projects/${slug}/readmes`)}
          disabled={isPosting || isDeleting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButton } from "@/components/vote-button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FileText, Loader2, ArrowLeft, CheckCircle2, Edit, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns";

type ProjectCategory = "NEW_CORE" | "OLD_CORE" | "PISCINE" | "OTHER";

interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
}

interface ReadmeDetail {
  id: string;
  title: string | null;
  content: string;
  author: {
    id: string;
    intraLogin: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
  score: number;
  voteCount: number;
  hasCompleted: boolean;
}

/**
 * Individual README detail page showing full content with voting.
 */
export default function ReadmeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const readmeId = params.readmeId as string;
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";
  const { authenticated, loading: authLoading, user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [readme, setReadme] = useState<ReadmeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<number | undefined>(undefined);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push("/");
    }
  }, [authLoading, authenticated, router]);

  // Fetch project and README
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch project
        const projectResponse = await fetch(`/api/projects/${encodeURIComponent(slug)}`);
        if (!projectResponse.ok) {
          setError("Project not found");
          return;
        }
        const projectData = await projectResponse.json();
        setProject(projectData.project);

        // Fetch READMEs to find the specific one
        const readmesResponse = await fetch(`/api/projects/${slug}/posts`);
        if (!readmesResponse.ok) {
          setError("Failed to load README");
          return;
        }

        const readmesData = await readmesResponse.json();
        const foundReadme = readmesData.posts.find((r: any) => r.id === readmeId);

        if (!foundReadme) {
          setError("README not found");
          return;
        }

        setReadme(foundReadme);

        // Fetch user's vote if authenticated
        if (authenticated && user?.profile?.id) {
          const votesResponse = await fetch(
            `/api/votes?targetType=POST&targetIds=${readmeId}`
          );
          if (votesResponse.ok) {
            const votesData = await votesResponse.json();
            setUserVote(votesData.votes[readmeId] || 0);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load README");
      } finally {
        setLoading(false);
      }
    }

    if (slug && readmeId) {
      fetchData();
    }
  }, [slug, readmeId, authenticated, user]);

  const isAuthor = readme && user?.profile?.id === readme.author.id;

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

  if (error || !project || !readme) {
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
            {error || "README not found"}
          </h3>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline" asChild>
              <Link href={`/projects/${slug}/readmes`}>← Back to READMEs</Link>
            </Button>
            <Button asChild>
              <Link href={`/projects/${slug}`}>← Back to Project</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-5xl">
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
        <span className={isCyberpunk ? "text-white" : "text-foreground"}>{readme.title || "README"}</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${slug}/readmes`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to READMEs
          </Link>
        </Button>
        {isAuthor && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/projects/${slug}/readmes/new`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* README Content */}
      <Card
        className={cn(
          "p-8",
          isCyberpunk
            ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
            : "border-2 border-border"
        )}
      >
        <div className="flex gap-6">
          {/* Vote buttons */}
          <div className="shrink-0">
            <VoteButton
              targetType="POST"
              targetId={readme.id}
              initialScore={readme.score}
              initialUserVote={userVote !== undefined && userVote !== 0 ? userVote : undefined}
              size="md"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Author */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <FileText
                    className={cn(
                      "h-6 w-6 shrink-0",
                      isCyberpunk ? "text-[var(--cyber-purple)]" : "text-primary"
                    )}
                  />
                  <h1
                    className={cn(
                      "text-3xl font-display font-black uppercase",
                      isCyberpunk ? "text-white" : "text-foreground"
                    )}
                  >
                    {readme.title || "Untitled README"}
                  </h1>
                </div>
                {readme.hasCompleted && (
                  <Badge
                    className={cn(
                      "flex items-center gap-1 px-3 py-1",
                      isCyberpunk
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-green-50 text-green-700 border border-green-200"
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Author completed this project
                  </Badge>
                )}
              </div>

              {/* Author info */}
              <div className="flex items-center gap-3">
                <Link href={`/profile/${readme.author.intraLogin}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={readme.author.avatarUrl || undefined}
                      alt={readme.author.intraLogin}
                    />
                    <AvatarFallback>
                      {readme.author.intraLogin.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link
                    href={`/profile/${readme.author.intraLogin}`}
                    className={cn(
                      "font-medium hover:underline block",
                      isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                    )}
                  >
                    {readme.author.displayName || readme.author.intraLogin}
                  </Link>
                  <div className={cn("text-xs", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                    {formatDistanceToNow(new Date(readme.createdAt), { addSuffix: true })}
                    {readme.updatedAt !== readme.createdAt && (
                      <span className="ml-2 italic">(edited {formatDistanceToNow(new Date(readme.updatedAt), { addSuffix: true })})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Markdown content */}
            <div
              className={cn(
                "prose prose-lg max-w-none",
                isCyberpunk
                  ? "prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-[var(--cyber-cyan)] prose-code:text-[var(--cyber-purple)] prose-code:bg-[var(--cyber-dark)] prose-pre:bg-[var(--cyber-dark)] prose-pre:border prose-pre:border-[var(--cyber-border)]"
                  : "prose-headings:text-foreground prose-p:text-foreground"
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {readme.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Comment, CommentData } from "@/components/comment";
import { ReadmePreviewCard, ReadmePreviewData } from "@/components/readme-preview-card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MessageSquare, FileText, Send, Loader2, Plus, Users, CheckCircle2, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

type ViewType = "comments" | "readmes";

/**
 * Project detail page with Comments and READMEs views.
 * Posting controls are in the sidebar.
 */
export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";
  const { authenticated, loading: authLoading, login } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("comments");

  // Comment state
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  // READMEs state
  const [readmes, setReadmes] = useState<ReadmePreviewData[]>([]);
  const [readmesLoading, setReadmesLoading] = useState(false);

  // Project users state
  const [projectUsers, setProjectUsers] = useState<any[]>([]);
  const [projectUsersLoading, setProjectUsersLoading] = useState(false);
  const [projectUsersPage, setProjectUsersPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const { user } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push("/");
    }
  }, [authLoading, authenticated, router]);

  // Fetch project data
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

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!project) return;
    setCommentsLoading(true);
    try {
      const response = await fetch(`/api/projects/${slug}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [project, slug]);

  // Fetch READMEs
  const fetchReadmes = useCallback(async () => {
    if (!project) return;
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
  }, [project, slug]);

  useEffect(() => {
    if (project) {
      if (activeView === "comments") {
        fetchComments();
      } else {
        fetchReadmes();
      }
    }
  }, [project, activeView, fetchComments, fetchReadmes]);

  // Fetch project users from user's campus
  const fetchProjectUsers = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!project?.fortyTwoProjectId || !user?.profile?.campus) return;

    if (append) {
      setLoadingMoreUsers(true);
    } else {
      setProjectUsersLoading(true);
    }

    try {
      const response = await fetch(
        `/api/42/projects/${project.slug}/users?page=${page}&per_page=20&campus=${encodeURIComponent(user.profile.campus)}`
      );
      if (response.ok) {
        const data = await response.json();
        const newUsers = data.users || [];

        if (append) {
          setProjectUsers((prev) => [...prev, ...newUsers]);
        } else {
          setProjectUsers(newUsers);
        }

        // Check if rate limited
        if (data.rateLimited) {
          setRateLimited(true);
          setHasMoreUsers(false);
        } else {
          setRateLimited(false);
          // Check if there are more users to load
          setHasMoreUsers(newUsers.length === 20); // If we got 20, there might be more
        }

        setProjectUsersPage(page);
      } else {
        // On any error, return empty array gracefully
        if (append) {
          // Don't clear existing users if loading more fails
          setHasMoreUsers(false);
        } else {
          setProjectUsers([]);
          setRateLimited(true); // Assume rate limited on error
        }
      }
    } catch (err) {
      console.error("Failed to fetch project users:", err);
      setHasMoreUsers(false);
    } finally {
      if (append) {
        setLoadingMoreUsers(false);
      } else {
        setProjectUsersLoading(false);
      }
    }
  }, [project, user]);

  useEffect(() => {
    if (project && user?.profile?.campus) {
      fetchProjectUsers(1, false);
    }
  }, [project, user, fetchProjectUsers]);

  const handleLoadMoreUsers = () => {
    if (!loadingMoreUsers && hasMoreUsers) {
      fetchProjectUsers(projectUsersPage + 1, true);
    }
  };

  // Post new comment
  const handlePostComment = async () => {
    if (!newComment.trim() || isPostingComment) return;

    setIsPostingComment(true);
    try {
      const response = await fetch(`/api/projects/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      const data = await response.json();
      setComments((prev) => [data.comment, ...prev]);
      setNewComment("");
      setShowCommentForm(false);
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsPostingComment(false);
    }
  };

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

  // Auth loading state
  if (authLoading) {
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

  // Don't render if not authenticated
  if (!authenticated) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div
          className={cn(
            "text-center py-20",
            isCyberpunk
              ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
              : "bg-card border-2 border-border manga-shadow"
          )}
        >
          <Loader2
            className={cn(
              "w-12 h-12 animate-spin mx-auto mb-4",
              isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
            )}
          />
          <p className={cn("font-mono", isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground")}>
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
          <p className={cn("mb-4", isCyberpunk ? "text-gray-400" : "text-muted-foreground")}>
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
      <div className={cn("mb-6 text-sm font-mono", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
        <Link href="/projects" className={cn("hover:underline", isCyberpunk && "hover:text-[var(--cyber-cyan)]")}>
          Projects
        </Link>
        <span className="mx-2">/</span>
        <span className={isCyberpunk ? "text-white" : "text-foreground"}>{project.title}</span>
      </div>

      {/* Project Header */}
      <Card
        className={cn(
          "p-6 mb-8",
          isCyberpunk
            ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
            : "border-2 border-border manga-shadow"
        )}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1
                className={cn(
                  "text-3xl font-display font-black uppercase",
                  isCyberpunk ? "cyber-gradient-text" : "text-foreground"
                )}
              >
                {project.title}
              </h1>
              <Badge variant="outline" className={cn(config.color, config.bgColor)}>
                {config.label}
              </Badge>
              {project.fortyTwoProjectId && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={cn(
                    "ml-2",
                    isCyberpunk && "border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
                  )}
                >
                  <a
                    href={`https://projects.intra.42.fr/projects/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 See in 42
                  </a>
                </Button>
              )}
            </div>
            <p className={cn("text-sm font-mono", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
              slug: {project.slug}
              {project.fortyTwoProjectId && ` • 42 ID: ${project.fortyTwoProjectId}`}
            </p>
          </div>

          <div className={cn("flex gap-4 text-sm", isCyberpunk ? "text-gray-400" : "text-muted-foreground")}>
            <div className="text-center">
              <div className={cn("text-2xl font-bold", isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground")}>
                {project._count.posts}
              </div>
              <div className="text-xs uppercase">READMEs</div>
            </div>
            <div className="text-center">
              <div className={cn("text-2xl font-bold", isCyberpunk ? "text-[var(--cyber-purple)]" : "text-foreground")}>
                {project._count.comments}
              </div>
              <div className="text-xs uppercase">Comments</div>
            </div>
          </div>
        </div>
      </Card>

      {/* View Toggle Buttons */}
      <div className="flex gap-4 mb-8">
        <Button
          size="lg"
          variant={activeView === "comments" ? "default" : "outline"}
          onClick={() => setActiveView("comments")}
          className={cn(
            "flex-1 text-lg font-bold uppercase py-6",
            activeView === "comments" && isCyberpunk && "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80",
            activeView !== "comments" && isCyberpunk && "border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
          )}
        >
          <MessageSquare className="h-5 w-5 mr-3" />
          Discussion ({comments.length})
        </Button>
        <Button
          size="lg"
          variant={activeView === "readmes" ? "default" : "outline"}
          onClick={() => setActiveView("readmes")}
          className={cn(
            "flex-1 text-lg font-bold uppercase py-6",
            activeView === "readmes" && isCyberpunk && "bg-[var(--cyber-purple)] text-white hover:bg-[var(--cyber-purple)]/80",
            activeView !== "readmes" && isCyberpunk && "border-[var(--cyber-border)] hover:border-[var(--cyber-purple)]"
          )}
        >
          <FileText className="h-5 w-5 mr-3" />
          READMEs ({readmes.length})
        </Button>
      </div>

      {/* Main content with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Comments View */}
          {activeView === "comments" && (
            <Card
              className={cn(
                "p-6",
                isCyberpunk
                  ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
                  : "border-2 border-border"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={cn("text-xl font-display font-bold uppercase", isCyberpunk ? "text-white" : "text-foreground")}>
                  💬 Discussion
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!authenticated) {
                      login();
                      return;
                    }
                    setShowCommentForm(!showCommentForm);
                  }}
                  className={cn(
                    isCyberpunk && "border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)] text-[var(--cyber-cyan)]"
                  )}
                >
                  <Plus className={cn("h-4 w-4 mr-2", showCommentForm && "rotate-45 transition-transform")} />
                  {showCommentForm ? "Cancel" : "Add Comment"}
                </Button>
              </div>

              {/* Inline Comment Form */}
              {showCommentForm && (
                <div className="mb-6 flex gap-4 animate-in fade-in slide-in-from-top-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage
                      src={user?.profile?.avatarUrl || undefined}
                      alt={user?.profile?.intraLogin || "User"}
                    />
                    <AvatarFallback>
                      {user?.profile?.intraLogin?.slice(0, 2).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Ask a question, share a tip..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className={cn(
                        "min-h-[100px] text-sm",
                        isCyberpunk && "bg-[var(--cyber-dark)] border-[var(--cyber-border)]"
                      )}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCommentForm(false);
                          setNewComment("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePostComment}
                        disabled={!newComment.trim() || isPostingComment}
                        size="sm"
                        className={cn(
                          isCyberpunk && "bg-[var(--cyber-cyan)] text-black hover:bg-[var(--cyber-cyan)]/80"
                        )}
                      >
                        <Send className="h-3 w-3 mr-2" />
                        {isPostingComment ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {commentsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className={cn("h-8 w-8 animate-spin mx-auto", isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-muted-foreground")} />
                </div>
              ) : comments.length === 0 ? (
                <div className={cn("text-center py-12", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                  <div className="text-5xl mb-4">💬</div>
                  <p className="text-lg mb-2">No comments yet.</p>
                  <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      projectSlug={slug}
                      userVotes={{}}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* READMEs View */}
          {activeView === "readmes" && (
            <Card
              className={cn(
                "p-6",
                isCyberpunk
                  ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
                  : "border-2 border-border"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={cn("text-xl font-display font-bold uppercase", isCyberpunk ? "text-white" : "text-foreground")}>
                  📚 READMEs
                </h2>
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    isCyberpunk && "bg-[var(--cyber-purple)] text-white hover:bg-[var(--cyber-purple)]/80"
                  )}
                >
                  <Link href={`/projects/${slug}/readmes/new`}>
                    {readmes.find(r => r.author.id === user?.profile?.id) ? (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Your README
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add README
                      </>
                    )}
                  </Link>
                </Button>
              </div>

              {readmesLoading ? (
                <div className="text-center py-12">
                  <Loader2 className={cn("h-8 w-8 animate-spin mx-auto", isCyberpunk ? "text-[var(--cyber-purple)]" : "text-muted-foreground")} />
                </div>
              ) : readmes.length === 0 ? (
                <div className={cn("text-center py-12", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-lg mb-2">No READMEs yet.</p>
                  <p className="text-sm mb-4">Be the first to share your project notes and guides!</p>
                </div>
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
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Completed Users from Campus */}

          {/* Completed Users from Campus */}
          {project.fortyTwoProjectId && (
            <Card
              className={cn(
                "p-4",
                isCyberpunk
                  ? "bg-[var(--cyber-panel)] border border-[var(--cyber-border)]"
                  : "border-2 border-border manga-shadow"
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <Users className={cn("h-4 w-4", isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-primary")} />
                <h3
                  className={cn(
                    "text-sm font-display font-bold uppercase",
                    isCyberpunk ? "text-white" : "text-foreground"
                  )}
                >
                  Completed ({projectUsers.length})
                </h3>
              </div>
              {projectUsersLoading ? (
                <div className="text-center py-4">
                  <Loader2 className={cn("h-5 w-5 animate-spin mx-auto", isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-muted-foreground")} />
                </div>
              ) : projectUsers.length === 0 ? (
                <div className="text-center py-4">
                  {rateLimited ? (
                    <p className={cn("text-xs", isCyberpunk ? "text-orange-400" : "text-orange-600")}>
                      ⚠️ Rate limited by 42 API. Please try again in a moment.
                    </p>
                  ) : (
                    <p className={cn("text-xs", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                      {user?.profile?.campus
                        ? `No one from ${user.profile.campus} has completed this project yet.`
                        : "No completed users found."}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {projectUsers.map((projectUser) => (
                      <Link
                        key={projectUser.id}
                        href={`/profile/${projectUser.login}`}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors",
                          isCyberpunk && "hover:bg-[var(--cyber-dark)]"
                        )}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={projectUser.avatarUrl || undefined}
                            alt={projectUser.login}
                          />
                          <AvatarFallback className="text-xs">
                            {projectUser.login.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className={cn("text-sm font-medium truncate", isCyberpunk ? "text-white" : "text-foreground")}>
                              {projectUser.displayName || projectUser.login}
                            </p>
                            {projectUser.validated && (
                              <CheckCircle2 className={cn("h-3 w-3 shrink-0", isCyberpunk ? "text-green-400" : "text-green-600")} />
                            )}
                          </div>
                          {projectUser.finalMark !== null && (
                            <p className={cn("text-xs", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                              {projectUser.finalMark}%
                              {projectUser.level && ` • Level ${projectUser.level.toFixed(2)}`}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  {hasMoreUsers && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMoreUsers}
                      disabled={loadingMoreUsers}
                      className={cn(
                        "w-full mt-3",
                        isCyberpunk && "border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
                      )}
                    >
                      {loadingMoreUsers ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Load More
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

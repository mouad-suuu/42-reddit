"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButton } from "./vote-button";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ChevronDown, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Author {
  id: string;
  intraLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ReadmePreviewData {
  id: string;
  title: string | null;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  score: number;
  voteCount: number;
  hasCompleted: boolean;
}

interface ReadmePreviewCardProps {
  readme: ReadmePreviewData;
  userVote?: number;
  projectSlug: string;
}

/**
 * README preview card showing snippet with voting.
 * Clicking anywhere on the card navigates to the full README page.
 */
export function ReadmePreviewCard({ readme, userVote, projectSlug }: ReadmePreviewCardProps) {
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";
  const { login } = useAuth();

  // Truncate content for preview (first 300 characters)
  const previewLength = 300;
  const needsTruncation = readme.content.length > previewLength;
  const previewContent = needsTruncation
    ? readme.content.slice(0, previewLength) + "..."
    : readme.content;

  return (
    <Link href={`/projects/${projectSlug}/readmes/${readme.id}`} className="block">
      <Card
        className={cn(
          "p-5 transition-all cursor-pointer",
          isCyberpunk
            ? "bg-[var(--cyber-panel)] border-[var(--cyber-border)] hover:border-[var(--cyber-cyan)]"
            : "border-2 border-border hover:manga-shadow"
        )}
      >
        <div className="flex gap-4">
          {/* Vote buttons - stop propagation to prevent card navigation */}
          <div onClick={(e) => e.preventDefault()} className="shrink-0">
            <VoteButton
              targetType="POST"
              targetId={readme.id}
              initialScore={readme.score}
              initialUserVote={userVote}
              size="md"
              onAuthRequired={login}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <FileText
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isCyberpunk ? "text-[var(--cyber-purple)]" : "text-primary"
                  )}
                />
                <h3
                  className={cn(
                    "text-lg font-bold",
                    isCyberpunk ? "text-white" : "text-foreground"
                  )}
                >
                  {readme.title || "Untitled README"}
                </h3>
              </div>
              {readme.hasCompleted && (
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-bold shrink-0",
                    isCyberpunk
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-green-50 text-green-700 border border-green-200"
                  )}
                  title="User has completed this project"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </div>
              )}
            </div>

            {/* Author info - stop propagation for profile links */}
            <div className="flex items-center gap-2 mb-4" onClick={(e) => e.preventDefault()}>
              <Link href={`/profile/${readme.author.intraLogin}`} onClick={(e) => e.stopPropagation()}>
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={readme.author.avatarUrl || undefined}
                    alt={readme.author.intraLogin}
                  />
                  <AvatarFallback className="text-xs">
                    {readme.author.intraLogin.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Link
                href={`/profile/${readme.author.intraLogin}`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "text-sm font-medium hover:underline",
                  isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-foreground"
                )}
              >
                {readme.author.displayName || readme.author.intraLogin}
              </Link>
              <span className={cn("text-xs", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                •
              </span>
              <span className={cn("text-xs", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                {formatDistanceToNow(new Date(readme.createdAt), { addSuffix: true })}
              </span>
              {readme.updatedAt !== readme.createdAt && (
                <>
                  <span className={cn("text-xs", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                    •
                  </span>
                  <span className={cn("text-xs italic", isCyberpunk ? "text-gray-500" : "text-muted-foreground")}>
                    edited
                  </span>
                </>
              )}
            </div>

            {/* Markdown preview */}
            <div
              className={cn(
                "prose prose-sm max-w-none mb-3",
                isCyberpunk
                  ? "prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-[var(--cyber-cyan)] prose-code:text-[var(--cyber-purple)] prose-code:bg-[var(--cyber-dark)] prose-pre:bg-[var(--cyber-dark)]"
                  : "prose-headings:text-foreground prose-p:text-foreground"
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {previewContent}
              </ReactMarkdown>
            </div>

            {/* View full README indicator */}
            {needsTruncation && (
              <div className={cn(
                "flex items-center gap-1 mt-3 text-sm",
                isCyberpunk ? "text-[var(--cyber-cyan)]" : "text-primary"
              )}>
                <ChevronDown className="h-4 w-4" />
                <span className="font-medium">Click to read full README</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

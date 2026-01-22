"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButton } from "./vote-button";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Author {
  id: string;
  intraLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ReadmeData {
  id: string;
  title: string | null;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  score: number;
  voteCount: number;
}

interface ReadmeCardProps {
  readme: ReadmeData;
  userVote?: number;
}

/**
 * README card with collapsible markdown content and voting.
 * No reply functionality - only upvote/downvote.
 */
export function ReadmeCard({ readme, userVote }: ReadmeCardProps) {
  const { theme } = useTheme();
  const isCyberpunk = theme === "cyberpunk";
  const { login } = useAuth();

  const [isExpanded, setIsExpanded] = useState(false);

  // Truncate content for preview
  const previewLength = 300;
  const needsTruncation = readme.content.length > previewLength;
  const previewContent = needsTruncation
    ? readme.content.slice(0, previewLength) + "..."
    : readme.content;

  return (
    <Card
      className={cn(
        "p-4",
        isCyberpunk
          ? "bg-[var(--cyber-panel)] border-[var(--cyber-border)]"
          : "border-2 border-border"
      )}
    >
      <div className="flex gap-4">
        {/* Vote buttons */}
        <VoteButton
          targetType="POST"
          targetId={readme.id}
          initialScore={readme.score}
          initialUserVote={userVote}
          size="md"
          onAuthRequired={login}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <FileText
                className={cn(
                  "h-5 w-5",
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
          </div>

          {/* Author info */}
          <div className="flex items-center gap-2 mb-4">
            <Link href={`/profile/${readme.author.intraLogin}`}>
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
          </div>

          {/* Markdown content */}
          <div
            className={cn(
              "prose prose-sm max-w-none",
              isCyberpunk
                ? "prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-[var(--cyber-cyan)] prose-code:text-[var(--cyber-purple)] prose-code:bg-[var(--cyber-dark)] prose-pre:bg-[var(--cyber-dark)]"
                : "prose-headings:text-foreground prose-p:text-foreground"
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {isExpanded ? readme.content : previewContent}
            </ReactMarkdown>
          </div>

          {/* Expand/collapse button */}
          {needsTruncation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "mt-3 h-8",
                isCyberpunk
                  ? "text-[var(--cyber-cyan)] hover:text-[var(--cyber-cyan)] hover:bg-[var(--cyber-cyan)]/10"
                  : "text-primary hover:text-primary"
              )}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Read full README
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

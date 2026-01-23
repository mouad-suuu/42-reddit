"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButton } from "./vote-button";
import { formatDistanceToNow } from "date-fns";
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
 * Uses CSS-only theme styling for performance.
 */
export function ReadmeCard({ readme, userVote }: ReadmeCardProps) {
  const { login } = useAuth();

  const [isExpanded, setIsExpanded] = useState(false);

  // Truncate content for preview
  const previewLength = 300;
  const needsTruncation = readme.content.length > previewLength;
  const previewContent = needsTruncation
    ? readme.content.slice(0, previewLength) + "..."
    : readme.content;

  return (
    <Card className="p-4 t-card-static">
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
              <FileText className="h-5 w-5 t-text-accent" />
              <h3 className="text-lg font-bold t-text-primary">
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
              className="text-sm font-medium hover:underline t-text-accent"
            >
              {readme.author.displayName || readme.author.intraLogin}
            </Link>
            <span className="text-xs t-text-subtle">•</span>
            <span className="text-xs t-text-subtle">
              {formatDistanceToNow(new Date(readme.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Markdown content */}
          <div className="prose prose-sm max-w-none t-prose">
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
              className="mt-3 h-8 t-expand-btn"
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

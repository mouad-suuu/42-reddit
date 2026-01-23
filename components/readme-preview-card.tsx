"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VoteButton } from "./vote-button";
import { formatDistanceToNow } from "date-fns";
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
 * Uses CSS-only theme styling for performance.
 */
export function ReadmePreviewCard({ readme, userVote, projectSlug }: ReadmePreviewCardProps) {
  const { login } = useAuth();

  // Truncate content for preview (first 300 characters)
  const previewLength = 300;
  const needsTruncation = readme.content.length > previewLength;
  const previewContent = needsTruncation
    ? readme.content.slice(0, previewLength) + "..."
    : readme.content;

  return (
    <Link href={`/projects/${projectSlug}/readmes/${readme.id}`} className="block">
      <Card className="p-5 cursor-pointer t-card t-card-interactive">
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
              readOnly={true}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 shrink-0 t-text-accent" />
                <h3 className="text-lg font-bold t-text-primary">
                  {readme.title || "Untitled README"}
                </h3>
              </div>
              {readme.hasCompleted && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold shrink-0 t-badge-completed"
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
                className="text-sm font-medium hover:underline t-text-accent"
              >
                {readme.author.displayName || readme.author.intraLogin}
              </Link>
              <span className="text-xs t-text-subtle">•</span>
              <span className="text-xs t-text-subtle">
                {formatDistanceToNow(new Date(readme.createdAt), { addSuffix: true })}
              </span>
              {readme.updatedAt !== readme.createdAt && (
                <>
                  <span className="text-xs t-text-subtle">•</span>
                  <span className="text-xs italic t-text-subtle">edited</span>
                </>
              )}
            </div>

            {/* Markdown preview */}
            <div
              className="mb-3 line-clamp-4 markdown-body t-markdown-preview"
              style={{ backgroundColor: 'transparent' }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {previewContent}
              </ReactMarkdown>
            </div>

            {/* View full README indicator */}
            {needsTruncation && (
              <div className="flex items-center gap-1 mt-3 text-sm t-text-accent">
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

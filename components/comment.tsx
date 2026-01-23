"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoteButton } from "./vote-button";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { MessageSquare, Send, X } from "lucide-react";
import Link from "next/link";

interface Author {
  id: string;
  intraLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface CommentData {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  score: number;
  voteCount: number;
  replies: CommentData[];
}

interface CommentProps {
  comment: CommentData;
  projectSlug: string;
  userVotes?: Record<string, number>;
  onReplyAdded?: (parentId: string, newComment: CommentData) => void;
  depth?: number;
}

/**
 * Recursive comment component with voting and reply functionality.
 * Renders nested replies up to depth 5.
 * Uses CSS-only theme styling for performance.
 */
export function Comment({
  comment,
  projectSlug,
  userVotes = {},
  onReplyAdded,
  depth = 0,
}: CommentProps) {
  const { authenticated, login } = useAuth();

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReplies, setLocalReplies] = useState<CommentData[]>(comment.replies);

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent.trim(),
          parentCommentId: comment.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post reply");
      }

      const data = await response.json();
      const newReply = data.comment;

      // Add to local replies
      setLocalReplies((prev) => [...prev, newReply]);
      onReplyAdded?.(comment.id, newReply);

      // Reset form
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxDepth = 5;
  const canReply = depth < maxDepth;

  return (
    <div
      className={cn(
        "group",
        depth > 0 && "border-l-2 t-border pl-4 ml-2"
      )}
    >
      <div className="flex gap-3">
        {/* Vote buttons */}
        <VoteButton
          targetType="COMMENT"
          targetId={comment.id}
          initialScore={comment.score}
          initialUserVote={userVotes[comment.id]}
          size="sm"
          onAuthRequired={login}
        />

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/profile/${comment.author.intraLogin}`}>
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={comment.author.avatarUrl || undefined}
                  alt={comment.author.intraLogin}
                />
                <AvatarFallback className="text-xs">
                  {comment.author.intraLogin.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link
              href={`/profile/${comment.author.intraLogin}`}
              className="text-sm font-medium hover:underline t-text-accent"
            >
              {comment.author.displayName || comment.author.intraLogin}
            </Link>
            <span className="text-xs t-text-subtle">•</span>
            <span className="text-xs t-text-subtle">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Content */}
          <p className="text-sm whitespace-pre-wrap break-words t-text-primary">
            {comment.content}
          </p>

          {/* Actions */}
          {canReply && (
            <div className="mt-2">
              {!showReplyForm ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!authenticated) {
                      login();
                      return;
                    }
                    setShowReplyForm(true);
                  }}
                  className="h-7 px-2 text-xs t-reply-btn"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              ) : (
                <div className="mt-2 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSubmitReply}
                      disabled={!replyContent.trim() || isSubmitting}
                      className="h-7 t-submit-btn"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      {isSubmitting ? "Posting..." : "Reply"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent("");
                      }}
                      className="h-7"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {localReplies.length > 0 && (
        <div className="mt-4 space-y-4">
          {localReplies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              projectSlug={projectSlug}
              userVotes={userVotes}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface VoteButtonProps {
  targetType: "POST" | "COMMENT";
  targetId: string;
  initialScore: number;
  initialUserVote?: number; // 1, -1, or undefined
  size?: "sm" | "md";
  onAuthRequired?: () => void;
  readOnly?: boolean;
}

/**
 * Upvote/downvote button with optimistic updates.
 * Displays score and allows voting on posts or comments.
 * Uses CSS-only theme styling for performance.
 */
export function VoteButton({
  targetType,
  targetId,
  initialScore,
  initialUserVote,
  size = "md",
  onAuthRequired,
  readOnly = false,
}: VoteButtonProps) {
  const { authenticated } = useAuth();

  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<number | undefined>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = useCallback(
    async (value: 1 | -1) => {
      if (readOnly) return;

      if (!authenticated) {
        onAuthRequired?.();
        return;
      }

      if (isLoading) return;

      // Optimistic update
      const previousScore = score;
      const previousVote = userVote;

      let newVote: number | undefined;
      let scoreDelta: number;

      if (userVote === value) {
        // Clicking same vote = remove vote
        newVote = undefined;
        scoreDelta = -value;
      } else if (userVote) {
        // Switching vote direction
        newVote = value;
        scoreDelta = value * 2; // Remove old + add new
      } else {
        // New vote
        newVote = value;
        scoreDelta = value;
      }

      setUserVote(newVote);
      setScore(previousScore + scoreDelta);
      setIsLoading(true);

      try {
        const response = await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetType,
            targetId,
            value: newVote ?? 0,
          }),
        });

        if (!response.ok) {
          throw new Error("Vote failed");
        }

        const data = await response.json();
        // Use server's score as source of truth
        setScore(data.newScore);
      } catch (error) {
        // Revert on error
        setScore(previousScore);
        setUserVote(previousVote);
        console.error("Vote error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [authenticated, isLoading, score, userVote, targetType, targetId, onAuthRequired, readOnly]
  );

  const buttonSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const fontSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex flex-col items-center gap-0.5", readOnly && "opacity-80")}>
      <button
        onClick={() => handleVote(1)}
        disabled={isLoading || readOnly}
        className={cn(
          "p-0.5 rounded transition-colors",
          buttonSize,
          readOnly ? "cursor-default" : "cursor-pointer",
          userVote === 1
            ? "t-vote-up-active animate-vote-pop"
            : "t-vote-up",
          (isLoading || readOnly) && "hover:bg-transparent hover:text-inherit"
        )}
        aria-label="Upvote"
      >
        <ChevronUp className={iconSize} />
      </button>

      <span
        className={cn(
          "font-mono font-bold tabular-nums",
          fontSize,
          score > 0
            ? "t-score-positive"
            : score < 0
              ? "text-destructive"
              : "t-score-zero"
        )}
      >
        {score}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isLoading || readOnly}
        className={cn(
          "p-0.5 rounded transition-colors",
          buttonSize,
          readOnly ? "cursor-default" : "cursor-pointer",
          userVote === -1
            ? "text-destructive bg-destructive/20 animate-vote-pop"
            : "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
          (isLoading || readOnly) && "hover:bg-transparent hover:text-inherit"
        )}
        aria-label="Downvote"
      >
        <ChevronDown className={iconSize} />
      </button>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { VoteTargetType } from "@prisma/client";

/**
 * POST /api/votes
 * Create, update, or remove a vote.
 * Body: { targetType: "POST" | "COMMENT", targetId: string, value: 1 | -1 | 0 }
 * value 0 = remove vote
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authUser = await getAuthUser();
    if (!authUser?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = authUser.user.id;

    // Parse request body
    const body = await request.json();
    const { targetType, targetId, value } = body;

    // Validate target type
    if (!targetType || !["POST", "COMMENT"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid target type. Must be POST or COMMENT" },
        { status: 400 }
      );
    }

    // Validate target ID
    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json(
        { error: "Target ID is required" },
        { status: 400 }
      );
    }

    // Validate value
    if (typeof value !== "number" || ![1, -1, 0].includes(value)) {
      return NextResponse.json(
        { error: "Value must be 1, -1, or 0" },
        { status: 400 }
      );
    }

    // Verify target exists
    if (targetType === "POST") {
      const post = await prisma.post.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!post) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }
    } else {
      const comment = await prisma.comment.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (!comment) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 }
        );
      }
    }

    // Find existing vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        ...(targetType === "POST"
          ? { postId: targetId }
          : { commentId: targetId }),
      },
    });

    let result: { action: string; vote: any | null; newScore: number };

    if (value === 0) {
      // Remove vote
      if (existingVote) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        result = { action: "removed", vote: null, newScore: 0 };
      } else {
        result = { action: "none", vote: null, newScore: 0 };
      }
    } else if (existingVote) {
      // Update existing vote
      if (existingVote.value === value) {
        // Same value, no change
        result = { action: "none", vote: existingVote, newScore: 0 };
      } else {
        // Different value, update
        const updatedVote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        result = { action: "updated", vote: updatedVote, newScore: 0 };
      }
    } else {
      // Create new vote
      const newVote = await prisma.vote.create({
        data: {
          userId,
          targetType: targetType as VoteTargetType,
          value,
          ...(targetType === "POST"
            ? { postId: targetId }
            : { commentId: targetId }),
        },
      });
      result = { action: "created", vote: newVote, newScore: 0 };
    }

    // Calculate new score
    const votes = await prisma.vote.findMany({
      where:
        targetType === "POST"
          ? { postId: targetId }
          : { commentId: targetId },
      select: { value: true },
    });

    result.newScore = votes.reduce((sum, v) => sum + v.value, 0);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to process vote:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/votes
 * Get the current user's votes for given targets.
 * Query: targetType=POST|COMMENT&targetIds=id1,id2,id3
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authUser = await getAuthUser();
    if (!authUser?.user) {
      return NextResponse.json({ votes: {} });
    }

    const userId = authUser.user.id;
    const searchParams = request.nextUrl.searchParams;
    const targetType = searchParams.get("targetType");
    const targetIds = searchParams.get("targetIds")?.split(",").filter(Boolean) || [];

    if (!targetType || !["POST", "COMMENT"].includes(targetType)) {
      return NextResponse.json({ votes: {} });
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ votes: {} });
    }

    // Fetch user's votes for these targets
    const votes = await prisma.vote.findMany({
      where: {
        userId,
        ...(targetType === "POST"
          ? { postId: { in: targetIds } }
          : { commentId: { in: targetIds } }),
      },
      select: {
        postId: true,
        commentId: true,
        value: true,
      },
    });

    // Map to targetId -> value
    const voteMap: Record<string, number> = {};
    votes.forEach((v) => {
      const id = targetType === "POST" ? v.postId : v.commentId;
      if (id) {
        voteMap[id] = v.value;
      }
    });

    return NextResponse.json({ votes: voteMap });
  } catch (error) {
    console.error("Failed to fetch votes:", error);
    return NextResponse.json({ votes: {} });
  }
}
